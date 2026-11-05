import type BigNumber from 'bignumber.js';
import { create } from 'zustand';
import type { Token } from 'types';

// Lite rule (UI only in this design preview): a Core market whose underlying is a Liquidity Hub
// vhToken lets the user supply either the vhToken or its underlying asset. FE ships the real
// transaction flow on branch feat/lite-mode; here the selector is visual and supplying the
// underlying sends no hub transaction.
export const useDemoVhMarketStore = create<{
  vhToken?: Token;
  underlyingToken?: Token;
  underlyingBalanceTokens?: BigNumber;
  set: (value: { vhToken?: Token; underlyingToken?: Token; underlyingBalanceTokens?: BigNumber }) => void;
}>()(set => ({
  set: value => set({ vhToken: undefined, underlyingToken: undefined, underlyingBalanceTokens: undefined, ...value }),
}));
