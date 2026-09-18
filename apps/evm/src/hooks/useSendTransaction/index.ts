import type {
  GetFusionQuotePayload,
  GetSupertransactionReceiptPayloadWithReceipts,
} from '@biconomy/abstractjs';
import { type MutationObserverOptions, useMutation } from '@tanstack/react-query';

import type { TransactionType } from 'types';
import type {
  Abi,
  Account,
  Chain,
  ContractFunctionArgs,
  ContractFunctionName,
  TransactionReceipt,
  WriteContractParameters,
} from 'viem';

export interface UseSendTransactionOptions<TMutateInput extends Record<string, unknown> | void>
  extends MutationObserverOptions<unknown, Error, TMutateInput> {
  waitForConfirmation?: boolean;
  tryGasless?: boolean;
}

export interface UseSendTransactionInput<
  TMutateInput extends Record<string, unknown> | void,
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends ContractFunctionName<TAbi, 'payable' | 'nonpayable'>,
  TArgs extends ContractFunctionArgs<TAbi, 'payable' | 'nonpayable', TFunctionName>,
> {
  fn: (
    input: TMutateInput,
  ) =>
    | WriteContractParameters<TAbi, TFunctionName, TArgs, Chain, Account>
    | Promise<WriteContractParameters<TAbi, TFunctionName, TArgs, Chain, Account>>
    | GetFusionQuotePayload
    | Promise<GetFusionQuotePayload>;
  transactionType?: TransactionType;
  onSigned?: (input: {
    transactionHash: string;
    input: TMutateInput;
  }) => Promise<unknown> | unknown;
  onConfirmed?: (input: {
    transactionHash: string;
    transactionReceipt: TransactionReceipt | GetSupertransactionReceiptPayloadWithReceipts;
    input: TMutateInput;
  }) => Promise<unknown> | unknown;
  onReverted?: (input: {
    transactionHash: string;
    input: TMutateInput;
  }) => Promise<unknown> | unknown;
  options?: UseSendTransactionOptions<TMutateInput>;
}

export const useSendTransaction = <
  TMutateInput extends Record<string, unknown> | void,
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends ContractFunctionName<TAbi, 'payable' | 'nonpayable'>,
  TArgs extends ContractFunctionArgs<TAbi, 'payable' | 'nonpayable', TFunctionName>,
>(
  input: UseSendTransactionInput<TMutateInput, TAbi, TFunctionName, TArgs>,
) =>
  useMutation({
    ...input.options,
    mutationFn: async (_variables: TMutateInput) => {
      window.dispatchEvent(
        new CustomEvent('venus-demo-action', {
          detail: 'Action simulated. No wallet transaction was sent.',
        }),
      );
      return undefined;
    },
  });
