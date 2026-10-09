import type { VisualDeckCopy } from './StepVisualDeck';

/**
 * Step 05 Trade. Templates: `{long}` / `{short}` token symbols, `{price}` entry price,
 * `{liq}` liquidation price, `{lev}` leverage, `{collateral}` collateral amount,
 * `{size}` position size, `{net}` net APY, `{hf}` health factor, `{move}` price move,
 * `{pnl}` profit and loss.
 */
export interface TradeVisualCopy extends VisualDeckCopy {
  agentName: string;
  long: string;
  short: string;
  pair: string;
  supplyApy: string;
  borrowApy: string;
  pairNote: string;
  collateral: string;
  leverage: string;
  entryPrice: string;
  liqPrice: string;
  netApy: string;
  openNote: string;
  position: string;
  healthy: string;
  pnl: string;
  healthFactor: string;
  increase: string;
  reduce: string;
  close: string;
  entry: string;
  liquidation: string;
  agentPrompts: [string, string, string];
  agentReplies: [string, string, string];
}

const en: TradeVisualCopy = {
  human: 'Human',
  agent: 'Venus AI Agent',
  agentName: 'Venus AI Agent',
  hub: 'Trade',
  screens: ['Pair', 'Open', 'Position'],
  pause: 'Pause',
  resume: 'Play',
  replay: 'Replay',
  long: 'Long',
  short: 'Short',
  pair: '{long}/{short}',
  supplyApy: '{long} supply APY',
  borrowApy: '{short} borrow APY',
  pairNote: 'Long what you expect to rise, short what you borrow against it.',
  collateral: 'Collateral',
  leverage: 'Leverage',
  entryPrice: 'Entry price',
  liqPrice: 'Liq. price',
  netApy: 'Net APY',
  openNote: 'Venus borrows {short}, swaps it into {long} and supplies it for you.',
  position: 'Long {long} · {lev}',
  healthy: 'Healthy',
  pnl: 'PnL',
  healthFactor: 'Health factor',
  increase: 'Increase',
  reduce: 'Reduce',
  close: 'Close',
  entry: 'Entry',
  liquidation: 'Liq.',
  agentPrompts: [
    'I think BNB will go up. What can I do?',
    'Open a {lev} long with {collateral} USDC.',
    'How is my position doing?',
  ],
  agentReplies: [
    'Go long {long} and short {short}: you borrow {short} against your collateral and hold {long} instead.',
    'Opening {long}/{short} at {lev}: about {size} of {long}. Entry {price}, liquidation near {liq}.',
    '{long} is up {move}, so PnL is {pnl}. Health factor {hf}; liquidation happens below 1.0.',
  ],
};

const zhHant: TradeVisualCopy = {
  human: '親自操作',
  agent: 'Venus AI 代理',
  agentName: 'Venus AI 代理',
  hub: 'Trade',
  screens: ['交易對', '開倉', '持倉'],
  pause: '暫停',
  resume: '播放',
  replay: '重播',
  long: '做多',
  short: '做空',
  pair: '{long}/{short}',
  supplyApy: '{long} 存款 APY',
  borrowApy: '{short} 借款 APY',
  pairNote: '做多你看漲的資產，做空你借入的資產。',
  collateral: '抵押品',
  leverage: '槓桿',
  entryPrice: '開倉價',
  liqPrice: '清算價',
  netApy: '淨 APY',
  openNote: 'Venus 會幫你借入 {short}、換成 {long} 並存入。',
  position: '做多 {long} · {lev}',
  healthy: '健康',
  pnl: '盈虧',
  healthFactor: '健康因子',
  increase: '加倉',
  reduce: '減倉',
  close: '平倉',
  entry: '開倉',
  liquidation: '清算',
  agentPrompts: [
    '我覺得 BNB 會升，可以怎樣做？',
    '用 {collateral} USDC 開 {lev} 多倉。',
    '我的持倉怎樣？',
  ],
  agentReplies: [
    '做多 {long}、做空 {short}：用抵押品借入 {short}，換成 {long} 持有。',
    '開 {long}/{short} {lev}：約 {size} 的 {long}。開倉價 {price}，清算價約 {liq}。',
    '{long} 升了 {move}，盈虧 {pnl}。健康因子 {hf}，低於 1.0 才會清算。',
  ],
};

const zhHans: TradeVisualCopy = {
  human: '亲自操作',
  agent: 'Venus AI 代理',
  agentName: 'Venus AI 代理',
  hub: 'Trade',
  screens: ['交易对', '开仓', '持仓'],
  pause: '暂停',
  resume: '播放',
  replay: '重播',
  long: '做多',
  short: '做空',
  pair: '{long}/{short}',
  supplyApy: '{long} 存款 APY',
  borrowApy: '{short} 借款 APY',
  pairNote: '做多你看涨的资产，做空你借入的资产。',
  collateral: '抵押品',
  leverage: '杠杆',
  entryPrice: '开仓价',
  liqPrice: '清算价',
  netApy: '净 APY',
  openNote: 'Venus 会帮你借入 {short}、换成 {long} 并存入。',
  position: '做多 {long} · {lev}',
  healthy: '健康',
  pnl: '盈亏',
  healthFactor: '健康因子',
  increase: '加仓',
  reduce: '减仓',
  close: '平仓',
  entry: '开仓',
  liquidation: '清算',
  agentPrompts: [
    '我觉得 BNB 会涨，可以怎么做？',
    '用 {collateral} USDC 开 {lev} 多仓。',
    '我的持仓怎么样？',
  ],
  agentReplies: [
    '做多 {long}、做空 {short}：用抵押品借入 {short}，换成 {long} 持有。',
    '开 {long}/{short} {lev}：约 {size} 的 {long}。开仓价 {price}，清算价约 {liq}。',
    '{long} 涨了 {move}，盈亏 {pnl}。健康因子 {hf}，低于 1.0 才会清算。',
  ],
};

export const tradeCopyByLanguage: Record<string, TradeVisualCopy> = {
  en,
  'zh-Hant': zhHant,
  'zh-Hans': zhHans,
};
