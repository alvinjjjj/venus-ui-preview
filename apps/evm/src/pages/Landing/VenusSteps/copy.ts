import { type AllocateVisualCopy, allocateCopyByLanguage } from './allocateCopy';
import { type BorrowVisualCopy, borrowCopyByLanguage } from './borrowCopy';
import { type EarnVisualCopy, earnCopyByLanguage } from './earnCopy';
import { type TradeVisualCopy, tradeCopyByLanguage } from './tradeCopy';

// Explorer Section 3: "How Venus works" in five steps. Prototype copy kept beside the
// component (as AssetOrbit does); move to the translation files once approved.
// 01 Supply (Liquidity Hub), 02 Allocate (Spoke markets, vaults), 03 Borrow,
// 04 Earn more (XVS vault + Prime), 05 Trade. Governance and safety move to Section 4.
// App and Agent Skills live in the Human / Agent switch on the visuals.

export type StepId = 'supply' | 'allocate' | 'borrow' | 'trade' | 'earn';

export interface StepCopy {
  id: StepId;
  nav: string;
  title: string;
  body: string;
  points: string[];
  cta: { label: string; to: string };
  secondaryCta?: { label: string; to: string };
}

/** `{sym}`, `{vh}`, `{apy}`, `{shares}`, `{value}`, `{pps}`, `{year}` are filled at render time. */
export interface SupplyVisualCopy {
  human: string;
  agent: string;
  hub: string;
  screens: [string, string, string];
  choose: string;
  highest: string;
  apy: string;
  supply: string;
  wallet: string;
  receive: string;
  /** What you receive, value first: "$10,000.00 of vhUSDC". */
  receiveValue: string;
  rate: string;
  /** The share count, kept to the small print. */
  sharesNote: string;
  approve: string;
  supplyStep: string;
  you: string;
  spokes: { core: string; flux: string; frv: string };
  position: string;
  perYear: string;
  /** Label over the Hold value, which counts up to one year of earnings. */
  afterYear: string;
  /** Hold chart axis ends. */
  today: string;
  inYear: string;
  earning: string;
  collateral: string;
  noClaim: string;
  prompt: string;
  agentName: string;
  agentPick: string;
  agentWorking: string;
  agentDone: string;
  replay: string;
  illustrative: string;
}

export interface VenusStepsCopy {
  eyebrow: string;
  /** The title is split so the destination can be set in Venus blue. */
  titleLead: string;
  titleAccent: string;
  steps: StepCopy[];
  supply: SupplyVisualCopy;
  allocate: AllocateVisualCopy;
  borrow: BorrowVisualCopy;
  earn: EarnVisualCopy;
  trade: TradeVisualCopy;
  comingSoon: string;
  /** Shown as the primary action while the Venus AI Agent mode is on. */
  agentCta: { label: string; to: string };
}

const en: VenusStepsCopy = {
  eyebrow: 'How Venus works',
  titleLead: 'From one deposit to',
  titleAccent: 'every market.',
  steps: [
    {
      id: 'supply',
      nav: 'Supply',
      title: 'Supply once.',
      body: 'Deposit once and watch your balance grow.',
      points: [
        'Compare assets and APYs',
        'Supply and receive a vhToken',
        'Hold as your value grows',
      ],
      cta: { label: 'Explore Liquidity Hub', to: '/liquidity-hubs' },
    },
    {
      id: 'allocate',
      nav: 'Allocate',
      title: 'Reach every market.',
      body: 'One deposit flows to Spoke markets and vaults.',
      points: [
        'Start with your Hub deposit',
        'Explore Spoke markets and vaults',
        'Review allocation shares and limits',
        'Track your single Hub position',
      ],
      cta: { label: 'Explore Spoke markets', to: '/liquidity-hubs' },
      secondaryCta: { label: 'Explore vaults', to: '/vaults' },
    },
    {
      id: 'borrow',
      nav: 'Borrow',
      title: 'Borrow without selling.',
      body: 'Borrow against what you hold, at live rates.',
      points: [
        'Use your vhToken as collateral',
        'Borrow at the live rate',
        'Keep an eye on your position health',
      ],
      cta: {
        label: 'Explore borrowing',
        to: '/markets/0xfD36E2c2a6789Db23113685031d7F16329158384',
      },
    },
    {
      id: 'earn',
      nav: 'Earn more',
      title: 'Earn more for staying.',
      body: 'Stake XVS, reach the top 500 and earn Prime rewards.',
      points: [
        'Stake XVS in the vault',
        'Climb into the top 500',
        'Earn boosted rates on Core Pool markets',
      ],
      cta: { label: 'See the Prime leaderboard', to: '/prime-leaderboard' },
      secondaryCta: { label: 'Prime calculator', to: '/prime-calculator' },
    },
    {
      id: 'trade',
      nav: 'Trade',
      title: 'Trade your view.',
      body: 'Go long or short with leverage on your collateral.',
      points: [
        'Pick a pair and a direction',
        'Set collateral and leverage',
        'Watch PnL and the health factor',
      ],
      cta: { label: 'Explore Trade', to: '/trade' },
    },
  ],
  allocate: allocateCopyByLanguage['en'],
  borrow: borrowCopyByLanguage['en'],
  earn: earnCopyByLanguage['en'],
  trade: tradeCopyByLanguage['en'],
  supply: {
    human: 'Human',
    agent: 'Venus AI Agent',
    hub: 'Liquidity Hub',
    screens: ['Choose', 'Supply', 'Hold'],
    choose: 'Choose an asset',
    highest: 'Highest APY',
    apy: 'APY',
    supply: 'Supply',
    wallet: 'Wallet',
    receive: 'You receive',
    receiveValue: '{value} of {vh}',
    rate: '1 {vh} ≈ {pps} {sym}',
    sharesNote: '{shares} {vh}',
    approve: 'Approve {sym}',
    supplyStep: 'Supply to Liquidity Hub',
    you: 'You',
    spokes: { core: 'Venus Core', flux: 'Venus Flux', frv: 'Fixed Rate' },
    position: '{vh} position',
    perYear: '≈ +{year} a year at {apy} APY, from {value}',
    afterYear: 'Value in one year',
    today: 'Today',
    inYear: 'In 1 year',
    earning: 'Earning',
    collateral: 'Collateral · {cf}',
    noClaim: 'Nothing to claim',
    prompt: 'Put $10,000 of stablecoins to work on Venus.',
    agentName: 'Venus AI Agent',
    agentPick:
      '{sym} has the highest Liquidity Hub rate right now, {apy} APY. I’ll supply 10,000 {sym}; you’ll hold {value} of {vh}.',
    agentWorking: 'On it: approve, then supply.',
    agentDone: 'Done. You hold {value} of {vh}, earning about {year} a year.',
    replay: 'Replay',
    illustrative: 'Illustrative amount and split · live Hub rates',
  },

  agentCta: { label: 'Set up Agent skills', to: '/skills' },
  comingSoon: 'Visual in progress',
};

const zhHant: VenusStepsCopy = {
  allocate: allocateCopyByLanguage['zh-Hant'],
  borrow: borrowCopyByLanguage['zh-Hant'],
  earn: earnCopyByLanguage['zh-Hant'],
  trade: tradeCopyByLanguage['zh-Hant'],
  eyebrow: 'Venus 如何運作',
  titleLead: '從一筆存款，',
  titleAccent: '到每一個市場。',
  steps: [
    {
      id: 'supply',
      nav: '存入',
      title: '存一次就好。',
      body: '存入一次，看著餘額自己增長。',
      points: ['比較資產與收益率', '存入並收到 vhToken', '持有，價值持續增長'],
      cta: { label: '探索 Liquidity Hub', to: '/liquidity-hubs' },
    },
    {
      id: 'allocate',
      nav: '分配',
      title: '連接每一個市場。',
      body: '一筆存款，流向 Spoke 市場和金庫。',
      points: [
        '從你的 Hub 存款開始',
        '探索 Spoke 市場與金庫',
        '查看分配比例與上限',
        '追蹤你的單一 Hub 持倉',
      ],
      cta: { label: '探索 Spoke 市場', to: '/liquidity-hubs' },
      secondaryCta: { label: '探索金庫', to: '/vaults' },
    },
    {
      id: 'borrow',
      nav: '借款',
      title: '不用賣出也能借款。',
      body: '以持有的資產作抵押，按即時利率借款。',
      points: ['用 vhToken 作抵押品', '以即時利率借款', '留意持倉健康度'],
      cta: { label: '探索借款', to: '/markets/0xfD36E2c2a6789Db23113685031d7F16329158384' },
    },
    {
      id: 'earn',
      nav: '更多收益',
      title: '留得越久，賺得越多。',
      body: '質押 XVS，擠進前 500 名，賺取 Prime 獎勵。',
      points: ['在金庫質押 XVS', '擠進前 500 名', '在 Core Pool 市場賺取加成收益'],
      cta: { label: '查看 Prime 排行榜', to: '/prime-leaderboard' },
      secondaryCta: { label: 'Prime 計算器', to: '/prime-calculator' },
    },
    {
      id: 'trade',
      nav: '交易',
      title: '交易你的觀點。',
      body: '以抵押品開槓桿多倉或空倉。',
      points: ['選擇交易對和方向', '設定抵押品和槓桿', '留意盈虧和健康因子'],
      cta: { label: '探索 Trade', to: '/trade' },
    },
  ],
  supply: {
    human: '親自操作',
    agent: 'Venus AI 代理',
    hub: 'Liquidity Hub',
    screens: ['選擇', '存入', '持有'],
    choose: '選擇資產',
    highest: '最高 APY',
    apy: 'APY',
    supply: '存入',
    wallet: '錢包',
    receive: '你會收到',
    receiveValue: '價值 {value} 的 {vh}',
    rate: '1 {vh} ≈ {pps} {sym}',
    sharesNote: '{shares} {vh}',
    approve: '授權 {sym}',
    supplyStep: '存入流動性中心',
    you: '你',
    spokes: { core: 'Venus Core', flux: 'Venus Flux', frv: 'Fixed Rate' },
    position: '{vh} 持倉',
    perYear: '以 APY {apy} 計，{value} 每年約 +{year}',
    afterYear: '一年後的價值',
    today: '今天',
    inYear: '一年後',
    earning: '收益中',
    collateral: '可作抵押 · {cf}',
    noClaim: '不用領取',
    prompt: '幫我把 $10,000 穩定幣放到 Venus 賺收益。',
    agentName: 'Venus AI 代理',
    agentPick:
      '{sym} 目前在流動性中心的利率最高，APY {apy}。我會存入 10,000 {sym}，你會持有價值 {value} 的 {vh}。',
    agentWorking: '開始處理：先授權，再存入。',
    agentDone: '完成。你持有價值 {value} 的 {vh}，每年約賺 {year}。',
    replay: '重播',
    illustrative: '金額與分配為示意 · 利率即時取自 Hub',
  },

  agentCta: { label: '設定 Agent skills', to: '/skills' },
  comingSoon: '示意圖製作中',
};

const zhHans: VenusStepsCopy = {
  allocate: allocateCopyByLanguage['zh-Hans'],
  borrow: borrowCopyByLanguage['zh-Hans'],
  earn: earnCopyByLanguage['zh-Hans'],
  trade: tradeCopyByLanguage['zh-Hans'],
  eyebrow: 'Venus 如何运作',
  titleLead: '从一笔存款，',
  titleAccent: '到每一个市场。',
  steps: [
    {
      id: 'supply',
      nav: '存入',
      title: '存一次就好。',
      body: '存入一次，看着余额自己增长。',
      points: ['比较资产与收益率', '存入并收到 vhToken', '持有，价值持续增长'],
      cta: { label: '探索 Liquidity Hub', to: '/liquidity-hubs' },
    },
    {
      id: 'allocate',
      nav: '分配',
      title: '连接每一个市场。',
      body: '一笔存款，流向 Spoke 市场和金库。',
      points: [
        '从你的 Hub 存款开始',
        '探索 Spoke 市场与金库',
        '查看分配比例与上限',
        '追踪你的单一 Hub 持仓',
      ],
      cta: { label: '探索 Spoke 市场', to: '/liquidity-hubs' },
      secondaryCta: { label: '探索金库', to: '/vaults' },
    },
    {
      id: 'borrow',
      nav: '借款',
      title: '不用卖出也能借款。',
      body: '以持有的资产作抵押，按实时利率借款。',
      points: ['用 vhToken 作抵押品', '以实时利率借款', '留意持仓健康度'],
      cta: { label: '探索借款', to: '/markets/0xfD36E2c2a6789Db23113685031d7F16329158384' },
    },
    {
      id: 'earn',
      nav: '更多收益',
      title: '留得越久，赚得越多。',
      body: '质押 XVS，挤进前 500 名，赚取 Prime 奖励。',
      points: ['在金库质押 XVS', '挤进前 500 名', '在 Core Pool 市场赚取加成收益'],
      cta: { label: '查看 Prime 排行榜', to: '/prime-leaderboard' },
      secondaryCta: { label: 'Prime 计算器', to: '/prime-calculator' },
    },
    {
      id: 'trade',
      nav: '交易',
      title: '交易你的观点。',
      body: '以抵押品开杠杆多仓或空仓。',
      points: ['选择交易对和方向', '设置抵押品和杠杆', '留意盈亏和健康因子'],
      cta: { label: '探索 Trade', to: '/trade' },
    },
  ],
  supply: {
    human: '亲自操作',
    agent: 'Venus AI 代理',
    hub: 'Liquidity Hub',
    screens: ['选择', '存入', '持有'],
    choose: '选择资产',
    highest: '最高 APY',
    apy: 'APY',
    supply: '存入',
    wallet: '钱包',
    receive: '你会收到',
    receiveValue: '价值 {value} 的 {vh}',
    rate: '1 {vh} ≈ {pps} {sym}',
    sharesNote: '{shares} {vh}',
    approve: '授权 {sym}',
    supplyStep: '存入流动性中心',
    you: '你',
    spokes: { core: 'Venus Core', flux: 'Venus Flux', frv: 'Fixed Rate' },
    position: '{vh} 持仓',
    perYear: '按 APY {apy} 计，{value} 每年约 +{year}',
    afterYear: '一年后的价值',
    today: '今天',
    inYear: '一年后',
    earning: '收益中',
    collateral: '可作抵押 · {cf}',
    noClaim: '无需领取',
    prompt: '帮我把 $10,000 稳定币放到 Venus 赚收益。',
    agentName: 'Venus AI 代理',
    agentPick:
      '{sym} 目前在流动性中心的利率最高，APY {apy}。我会存入 10,000 {sym}，你会持有价值 {value} 的 {vh}。',
    agentWorking: '开始处理：先授权，再存入。',
    agentDone: '完成。你持有价值 {value} 的 {vh}，每年约赚 {year}。',
    replay: '重播',
    illustrative: '金额与分配为示意 · 利率实时取自 Hub',
  },

  agentCta: { label: '设置 Agent skills', to: '/skills' },
  comingSoon: '示意图制作中',
};

export const venusStepsCopyByLanguage: Record<string, VenusStepsCopy> = {
  en,
  'zh-Hant': zhHant,
  'zh-Hans': zhHans,
};
