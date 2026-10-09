import type { VisualDeckCopy } from './StepVisualDeck';

export interface AllocateVisualCopy extends VisualDeckCopy {
  deposit: string;
  example: string;
  total: string;
  limit: string;
  limits: string;
  allAllocated: string;
  automatic: string;
  sourceNames: [string, string, string];
  sourceDescriptions: [string, string, string];
  sourceDetails: [string, string, string];
  agentPrompts: [string, string, string, string];
  agentNotes: [string, string, string, string];
}

const en: AllocateVisualCopy = {
  human: 'Human',
  agent: 'Venus AI Agent',
  hub: 'Liquidity Hub',
  screens: ['Hub', 'Destinations', 'Allocation', 'Overview'],
  pause: 'Pause',
  resume: 'Play',
  replay: 'Replay',
  deposit: 'Your Hub deposit',
  example: 'Example allocation',
  total: 'Total allocated',
  limit: 'Limit',
  limits: 'Each source has its own allocation limit.',
  allAllocated: 'One Hub position. Three destinations.',
  automatic: 'The Hub allocates for you.',
  sourceNames: ['Venus Core', 'Spoke Markets', 'Vaults'],
  sourceDescriptions: [
    'Core lending markets',
    'Markets for different lending needs',
    'Supported yield strategies',
  ],
  sourceDetails: [
    'Explore the lending markets receiving Hub liquidity.',
    'Review each Spoke’s assets, rates and market rules.',
    'Review the vault’s strategy, rate and withdrawal conditions.',
  ],
  agentPrompts: [
    'Where is my deposit allocated?',
    'What are these destinations?',
    'How do the allocation limits work?',
    'Do I need to track separate positions?',
  ],
  agentNotes: [
    'Your deposit is allocated across three destinations.',
    'Compare each destination’s market rules.',
    'Review the split against each allocation limit.',
    'Your vhToken represents your single Hub position.',
  ],
};

const zhHant: AllocateVisualCopy = {
  human: '親自操作',
  agent: 'Venus AI 代理',
  hub: 'Liquidity Hub',
  screens: ['Hub', '目的地', '分配', '總覽'],
  pause: '暫停',
  resume: '播放',
  replay: '重播',
  deposit: '你的 Hub 存款',
  example: '分配示例',
  total: '已分配總額',
  limit: '上限',
  limits: '每個來源都有自己的分配上限。',
  allAllocated: '一個 Hub 持倉，三個目的地。',
  automatic: '由 Hub 為你分配資金。',
  sourceNames: ['Venus Core', 'Spoke Markets', 'Vaults'],
  sourceDescriptions: ['Core 借貸市場', '滿足不同借貸需求的市場', '支援的收益策略'],
  sourceDetails: [
    '探索接收 Hub 流動性的借貸市場。',
    '查看各個 Spoke 的資產、利率和市場規則。',
    '查看金庫策略、利率和提款條件。',
  ],
  agentPrompts: [
    '我的存款分配到哪裡？',
    '這些目的地有甚麼分別？',
    '分配上限如何運作？',
    '我要追蹤多個持倉嗎？',
  ],
  agentNotes: [
    '你的存款分配到三個目的地。',
    '比較各個目的地的市場規則。',
    '對照分配比例與每個來源的上限。',
    '你的 vhToken 代表一個 Hub 持倉。',
  ],
};

const zhHans: AllocateVisualCopy = {
  human: '亲自操作',
  agent: 'Venus AI 代理',
  hub: 'Liquidity Hub',
  screens: ['Hub', '目的地', '分配', '总览'],
  pause: '暂停',
  resume: '播放',
  replay: '重播',
  deposit: '你的 Hub 存款',
  example: '分配示例',
  total: '已分配总额',
  limit: '上限',
  limits: '每个来源都有自己的分配上限。',
  allAllocated: '一个 Hub 持仓，三个目的地。',
  automatic: '由 Hub 为你分配资金。',
  sourceNames: ['Venus Core', 'Spoke Markets', 'Vaults'],
  sourceDescriptions: ['Core 借贷市场', '满足不同借贷需求的市场', '支持的收益策略'],
  sourceDetails: [
    '探索接收 Hub 流动性的借贷市场。',
    '查看各个 Spoke 的资产、利率和市场规则。',
    '查看金库策略、利率和提款条件。',
  ],
  agentPrompts: [
    '我的存款分配到哪里？',
    '这些目的地有什么区别？',
    '分配上限如何运作？',
    '我要追踪多个持仓吗？',
  ],
  agentNotes: [
    '你的存款分配到三个目的地。',
    '比较各个目的地的市场规则。',
    '对照分配比例与每个来源的上限。',
    '你的 vhToken 代表一个 Hub 持仓。',
  ],
};

export const allocateCopyByLanguage: Record<string, AllocateVisualCopy> = {
  en,
  'zh-Hant': zhHant,
  'zh-Hans': zhHans,
};
