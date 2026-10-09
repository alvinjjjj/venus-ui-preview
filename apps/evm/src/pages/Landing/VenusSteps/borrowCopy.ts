import type { VisualDeckCopy } from './StepVisualDeck';

/**
 * Step 03 Borrow. Templates: `{vh}` vhToken, `{cf}` collateral factor, `{limit}` borrow limit,
 * `{sym}` borrowed asset, `{amount}` borrowed amount, `{rate}` borrow APY, `{used}` limit used,
 * `{apy}` Hub supply APY, `{net}` net yearly result.
 */
export interface BorrowVisualCopy extends VisualDeckCopy {
  agentName: string;
  collateralTitle: string;
  useAsCollateral: string;
  collateralValue: string;
  collateralFactor: string;
  borrowLimit: string;
  stillEarning: string;
  borrowTitle: string;
  borrowApy: string;
  limitUsed: string;
  borrowStep: string;
  enableStep: string;
  safe: string;
  liquidation: string;
  collateral: string;
  borrowed: string;
  earn: string;
  pay: string;
  net: string;
  healthNote: string;
  agentPrompts: [string, string, string];
  agentReplies: [string, string, string];
  illustrative: string;
}

const en: BorrowVisualCopy = {
  human: 'Human',
  agent: 'Venus AI Agent',
  agentName: 'Venus AI Agent',
  hub: 'Core Pool',
  screens: ['Collateral', 'Borrow', 'Health'],
  pause: 'Pause',
  resume: 'Play',
  replay: 'Replay',
  collateralTitle: 'Your Hub position',
  useAsCollateral: 'Use as collateral',
  collateralValue: 'Collateral value',
  collateralFactor: 'Collateral factor',
  borrowLimit: 'Borrow limit',
  stillEarning: 'Your {vh} keeps earning {apy} APY while it backs your loan.',
  borrowTitle: 'Choose what to borrow',
  borrowApy: 'Borrow APY',
  limitUsed: 'Borrow limit used',
  borrowStep: 'Borrow {sym}',
  enableStep: 'Enable {vh} as collateral',
  safe: 'Safe',
  liquidation: 'Liquidation',
  collateral: 'Collateral',
  borrowed: 'Borrowed',
  earn: 'Earning',
  pay: 'Paying',
  net: 'Net, a year',
  healthNote: 'Liquidation starts when the limit used reaches 100%.',
  agentPrompts: [
    'Can I borrow against my {vh}?',
    'Borrow {amount} {sym} for me.',
    'Is my position safe?',
  ],
  agentReplies: [
    'Yes. {vh} counts at {cf}, so {value} lets you borrow up to {limit}. It keeps earning while it’s collateral.',
    '{sym} is {rate} APY to borrow right now. Enabling collateral, then borrowing.',
    'You’re using {used} of your limit. Liquidation starts at 100%, so keeping well below leaves room for price moves.',
  ],
  illustrative: 'Illustrative amounts · live Core Pool rates',
};

const zhHant: BorrowVisualCopy = {
  human: '親自操作',
  agent: 'Venus AI 代理',
  agentName: 'Venus AI 代理',
  hub: 'Core Pool',
  screens: ['抵押', '借款', '健康度'],
  pause: '暫停',
  resume: '播放',
  replay: '重播',
  collateralTitle: '你的 Hub 持倉',
  useAsCollateral: '用作抵押品',
  collateralValue: '抵押品價值',
  collateralFactor: '抵押率',
  borrowLimit: '可借上限',
  stillEarning: '作為抵押品期間，{vh} 仍持續賺取 {apy} APY。',
  borrowTitle: '選擇借入資產',
  borrowApy: '借款 APY',
  limitUsed: '已用借款額度',
  borrowStep: '借入 {sym}',
  enableStep: '啟用 {vh} 作抵押品',
  safe: '安全',
  liquidation: '清算',
  collateral: '抵押品',
  borrowed: '已借款',
  earn: '收益',
  pay: '利息',
  net: '每年淨額',
  healthNote: '已用額度達到 100% 時會開始清算。',
  agentPrompts: ['我可以用 {vh} 抵押借款嗎？', '幫我借 {amount} {sym}。', '我的持倉安全嗎？'],
  agentReplies: [
    '可以。{vh} 的抵押率是 {cf}，{value} 最多可借 {limit}。作為抵押品期間它會繼續賺取收益。',
    '{sym} 目前的借款 APY 是 {rate}。先啟用抵押品，再借款。',
    '你已使用 {used} 的借款額度。達到 100% 才會清算，保持在遠低於上限的水平，可以應付價格波動。',
  ],
  illustrative: '金額為示意 · 利率即時取自 Core Pool',
};

const zhHans: BorrowVisualCopy = {
  human: '亲自操作',
  agent: 'Venus AI 代理',
  agentName: 'Venus AI 代理',
  hub: 'Core Pool',
  screens: ['抵押', '借款', '健康度'],
  pause: '暂停',
  resume: '播放',
  replay: '重播',
  collateralTitle: '你的 Hub 持仓',
  useAsCollateral: '用作抵押品',
  collateralValue: '抵押品价值',
  collateralFactor: '抵押率',
  borrowLimit: '可借上限',
  stillEarning: '作为抵押品期间，{vh} 仍持续赚取 {apy} APY。',
  borrowTitle: '选择借入资产',
  borrowApy: '借款 APY',
  limitUsed: '已用借款额度',
  borrowStep: '借入 {sym}',
  enableStep: '启用 {vh} 作抵押品',
  safe: '安全',
  liquidation: '清算',
  collateral: '抵押品',
  borrowed: '已借款',
  earn: '收益',
  pay: '利息',
  net: '每年净额',
  healthNote: '已用额度达到 100% 时会开始清算。',
  agentPrompts: ['我可以用 {vh} 抵押借款吗？', '帮我借 {amount} {sym}。', '我的持仓安全吗？'],
  agentReplies: [
    '可以。{vh} 的抵押率是 {cf}，{value} 最多可借 {limit}。作为抵押品期间它会继续赚取收益。',
    '{sym} 目前的借款 APY 是 {rate}。先启用抵押品，再借款。',
    '你已使用 {used} 的借款额度。达到 100% 才会清算，保持在远低于上限的水平，可以应对价格波动。',
  ],
  illustrative: '金额为示意 · 利率实时取自 Core Pool',
};

export const borrowCopyByLanguage: Record<string, BorrowVisualCopy> = {
  en,
  'zh-Hant': zhHant,
  'zh-Hans': zhHans,
};
