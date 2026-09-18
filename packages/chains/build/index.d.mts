import { Address } from "viem";
import { Chain as Chain$1 } from "wagmi/chains";

//#region src/types/index.d.ts
declare enum ChainId {
  BSC_MAINNET = 56,
  BSC_TESTNET = 97,
  ETHEREUM = 1,
  SEPOLIA = 11155111,
  OPBNB_MAINNET = 204,
  OPBNB_TESTNET = 5611,
  ARBITRUM_ONE = 42161,
  ARBITRUM_SEPOLIA = 421614,
  ZKSYNC_MAINNET = 324,
  ZKSYNC_SEPOLIA = 300,
  OPTIMISM_MAINNET = 10,
  OPTIMISM_SEPOLIA = 11155420,
  BASE_MAINNET = 8453,
  BASE_SEPOLIA = 84532,
  UNICHAIN_MAINNET = 130,
  UNICHAIN_SEPOLIA = 1301,
}
declare enum MainnetChainId {
  BSC_MAINNET = 56,
  ETHEREUM = 1,
  OPBNB_MAINNET = 204,
  ARBITRUM_ONE = 42161,
  ZKSYNC_MAINNET = 324,
  OPTIMISM_MAINNET = 10,
  BASE_MAINNET = 8453,
  UNICHAIN_MAINNET = 130,
}
declare enum TestnetChainId {
  BSC_TESTNET = 97,
  SEPOLIA = 11155111,
  OPBNB_TESTNET = 5611,
  ARBITRUM_SEPOLIA = 421614,
  ZKSYNC_SEPOLIA = 300,
  OPTIMISM_SEPOLIA = 11155420,
  BASE_SEPOLIA = 84532,
  UNICHIAN_SEPOLIA = 1301,
}
interface Hardfork {
  startTimestamp: number;
  blockTimeMs: number;
}
interface Chain {
  name: string;
  iconSrc: string;
  explorerUrl: string;
  nativeToken: Token;
  layerZeroScanUrl: string;
  corePoolComptrollerContractAddress: Address;
  safeWalletApiUrl?: string;
  proposalExecutionGracePeriodMs?: number;
  hardforks?: Hardfork[];
  blocksPerDay?: number;
}
interface Token {
  symbol: string;
  decimals: number;
  iconSrc: string;
  chainId: ChainId;
  address: Address;
  isNative?: boolean;
  tokenWrapped?: Token;
}
interface VToken extends Omit<Token, 'isNative' | 'iconSrc' | 'tokenWrapped'> {
  decimals: 8;
  underlyingToken: Token;
}
interface VhToken extends Omit<Token, 'isNative' | 'iconSrc' | 'tokenWrapped'> {
  underlyingToken: Token;
}
//#endregion
//#region src/constants/index.d.ts
declare const NATIVE_TOKEN_ADDRESS: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB";
declare const IMAGES_DIR_NAME = "images";
declare const IMAGES_DIR_PATH = "src/images";
declare const MS_PER_DAY: number;
//#endregion
//#region src/chains/viemChains/index.d.ts
declare const viemChains: Record<ChainId, Chain$1>;
//#endregion
//#region src/chains/chainMetadata/index.d.ts
declare const chains: Record<ChainId, Chain>;
//#endregion
//#region src/tokens/underlyingTokens/index.d.ts
declare const tokens: { [chainId in ChainId]: Token[] };
//#endregion
//#region src/tokens/nativeTokens/index.d.ts
type TokenMapping<C extends ChainId[]> = Record<C[number], Token>;
declare const eth: TokenMapping<(ChainId.ETHEREUM | ChainId.SEPOLIA | ChainId.ARBITRUM_ONE | ChainId.ARBITRUM_SEPOLIA | ChainId.ZKSYNC_MAINNET | ChainId.ZKSYNC_SEPOLIA | ChainId.OPTIMISM_MAINNET | ChainId.OPTIMISM_SEPOLIA | ChainId.BASE_MAINNET | ChainId.BASE_SEPOLIA | ChainId.UNICHAIN_MAINNET | ChainId.UNICHAIN_SEPOLIA)[]>;
declare const bnb: TokenMapping<(ChainId.BSC_MAINNET | ChainId.BSC_TESTNET | ChainId.OPBNB_MAINNET | ChainId.OPBNB_TESTNET)[]>;
//#endregion
//#region src/generated/vTokens/index.d.ts
declare const vTokens: { [chainId in ChainId]: VToken[] };
//#endregion
//#region src/utilities/getToken/index.d.ts
interface GetTokenInput {
  chainId: ChainId;
  symbol: string;
}
declare const getToken: ({
  chainId,
  symbol
}: GetTokenInput) => Token | undefined;
//#endregion
//#region src/utilities/getRpcUrls/index.d.ts
declare const getRpcUrls: ({
  nodeRealApiKey,
  alchemyApiKey
}: {
  nodeRealApiKey: string;
  alchemyApiKey: string;
}) => { [chainId in ChainId]: string[] };
//#endregion
//#region src/utilities/getBlockTimeByChainId/index.d.ts
declare const getBlockTimeByChainId: ({
  chainId,
  targetTimestamp
}: {
  chainId: ChainId;
  targetTimestamp?: number;
}) => {
  startTimestamp: number;
  blockTimeMs: number;
  blocksPerDay: number;
} | undefined;
//#endregion
export { Chain, ChainId, GetTokenInput, Hardfork, IMAGES_DIR_NAME, IMAGES_DIR_PATH, MS_PER_DAY, MainnetChainId, NATIVE_TOKEN_ADDRESS, TestnetChainId, Token, VToken, VhToken, bnb, chains, eth, getBlockTimeByChainId, getRpcUrls, getToken, tokens, vTokens, viemChains };