// Upstream Venus implementation (VenusProtocol/venus-protocol-interface). Used only when the
// preview runs locally — see index.ts.
import type {
  GetFusionQuotePayload,
  GetSupertransactionReceiptPayloadWithReceipts,
} from '@biconomy/abstractjs';
import { type MutationObserverOptions, useMutation } from '@tanstack/react-query';

import type { TransactionType } from 'types';

import { useGetPaymasterInfo } from 'clients/api';
import { isDemoAddress } from 'demo/state';
import { useStore as useResendPayingGasModalStore } from 'containers/ResendPayingGasModal/store';
import { useIsFeatureEnabled } from 'hooks/useIsFeatureEnabled';
import { useUserChainSettings } from 'hooks/useUserChainSettings';
import { VError, logError } from 'libs/errors';
import { useAccountAddress, useChainId, useMeeClient, usePublicClient } from 'libs/wallet';
import type {
  Abi,
  Account,
  Chain,
  ContractFunctionArgs,
  ContractFunctionName,
  TransactionReceipt,
  WriteContractParameters,
} from 'viem';
import { useWalletClient } from 'wagmi';
import { sendTransaction } from './sendTransaction';
import { useTrackTransaction } from './useTrackTransaction';

import type { UseSendTransactionInput } from '.';

type LastFailedGaslessTransaction<TMutateInput extends Record<string, unknown> | void> =
  UseSendTransactionInput<TMutateInput, any, any, any> & {
    mutationInput: TMutateInput;
  };

export const useRealSendTransaction = <
  TMutateInput extends Record<string, unknown> | void,
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends ContractFunctionName<TAbi, 'payable' | 'nonpayable'>,
  TArgs extends ContractFunctionArgs<TAbi, 'payable' | 'nonpayable', TFunctionName>,
>(
  input: UseSendTransactionInput<TMutateInput, TAbi, TFunctionName, TArgs>,
) => {
  const isGaslessTransactionsFeatureEnabled = useIsFeatureEnabled({ name: 'gaslessTransactions' });

  const { fn, transactionType, onConfirmed, onReverted, onSigned, options } = input;
  const tryGasless = options?.tryGasless ?? true;

  const { accountAddress } = useAccountAddress();
  const { data: walletClient } = useWalletClient({
    account: accountAddress,
  });
  const { publicClient } = usePublicClient();
  const { chainId } = useChainId();

  const { data, error: getMeeClientError } = useMeeClient(
    { chainId },
    { enabled: input.transactionType === 'biconomy' },
  );
  const meeClient = data?.meeClient;

  const openResendPayingGasModalStoreModal = useResendPayingGasModalStore(state => state.openModal);

  const [userChainSettings] = useUserChainSettings();

  const { data: getPaymasterInfo, refetch: refetchPaymasterInfo } = useGetPaymasterInfo(
    {
      chainId,
    },
    {
      enabled: tryGasless && isGaslessTransactionsFeatureEnabled,
    },
  );
  const paymasterCanSponsorTransactions = !!getPaymasterInfo?.canSponsorTransactions;

  // a transaction should be gas free when:
  // 1) we're on a chain that supports the feature
  // 2) the gaslessTransactions user setting is set to true
  // 3) the tryGasless option is set to true
  // 4) there are funds in the paymaster wallet
  const shouldTryGasless =
    isGaslessTransactionsFeatureEnabled &&
    userChainSettings.gaslessTransactions &&
    tryGasless &&
    paymasterCanSponsorTransactions;

  const trackTransaction = useTrackTransaction({ transactionType });

  return useMutation({
    mutationFn: async mutationInput => {
      // Demo balances never represent real funds, even on the local dev server.
      // Stop before preparing a transaction or requesting a wallet signature.
      if (isDemoAddress(accountAddress)) {
        window.dispatchEvent(
          new CustomEvent('venus-demo-action', {
            detail: 'Action simulated. No wallet transaction was sent.',
          }),
        );
        return;
      }

      if (!accountAddress || !walletClient) {
        throw new VError({
          type: 'unexpected',
          code: 'somethingWentWrong',
        });
      }

      // Get transaction data from the passed input
      const txData = await fn(mutationInput);

      if ('quote' in txData && !meeClient) {
        logError(`Could not send super transaction, missing MEE client: ${getMeeClientError}`);

        throw new VError({
          type: 'unexpected',
          code: 'somethingWentWrong',
        });
      }

      const { transactionHash } = await sendTransaction<TAbi, TFunctionName, TArgs>(
        'quote' in txData
          ? {
              txData,
              meeClient: meeClient!,
            }
          : {
              walletClient,
              publicClient,
              txData,
              chainId,
              accountAddress,
              gasless: shouldTryGasless,
            },
      );

      if (onSigned) {
        onSigned({ transactionHash, input: mutationInput });
      }

      // Track transaction's progress in the background
      const promise = trackTransaction({
        transactionHash,
        onConfirmed: onConfirmedInput =>
          onConfirmed?.({ ...onConfirmedInput, input: mutationInput }),
        onReverted: onRevertedInput => onReverted?.({ ...onRevertedInput, input: mutationInput }),
      });

      if (options?.waitForConfirmation) {
        // Only return when transaction has been confirmed
        await promise;
      }
    },
    onError: (error, variables, context) => {
      if (error instanceof VError && error.code === 'gaslessTransactionNotAvailable') {
        // Refetch paymaster balance in case it went below threshold
        refetchPaymasterInfo();

        // Open modal asking user if they want to send the transaction again by paying for the gas
        // themselves
        openResendPayingGasModalStoreModal({
          lastFailedGaslessTransaction: {
            ...input,
            mutationInput: variables,
          } as LastFailedGaslessTransaction<TMutateInput>,
        });

        return;
      }

      if (options?.onError) {
        options.onError(error, variables, context);
      }
    },
    ...options,
  });
};
