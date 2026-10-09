/** Explorer landing footer copy. */
export interface FooterCopy {
  tagline: string;
  columns: { products: string; governance: string; developers: string; community: string };
  links: {
    liquidityHub: string;
    corePool: string;
    vaults: string;
    prime: string;
    trade: string;
    bridge: string;
    proposals: string;
    voters: string;
    forum: string;
    docs: string;
    skills: string;
    audits: string;
    github: string;
    telegram: string;
    discord: string;
    x: string;
  };
  privacy: string;
  terms: string;
  rights: string;
  /** "Live on {chain}" status, followed by the latest block. */
  live: string;
  block: string;
}

const en: FooterCopy = {
  tagline: 'Supply once. Reach every market.',
  columns: {
    products: 'Products',
    governance: 'Governance',
    developers: 'Developers',
    community: 'Community',
  },
  links: {
    liquidityHub: 'Liquidity Hub',
    corePool: 'Core Pool',
    vaults: 'Vaults',
    prime: 'Prime',
    trade: 'Trade',
    bridge: 'Bridge',
    proposals: 'Proposals',
    voters: 'Voter leaderboard',
    forum: 'Community forum',
    docs: 'Documentation',
    skills: 'Agent skills',
    audits: 'Security & audits',
    github: 'GitHub',
    telegram: 'Telegram',
    discord: 'Discord',
    x: 'X',
  },
  privacy: 'Privacy policy',
  terms: 'Terms of use',
  rights: '© {year} Venus Protocol',
  live: 'Live on {chain}',
  block: 'Block',
};

const zhHant: FooterCopy = {
  tagline: '存一次，連接每一個市場。',
  columns: { products: '產品', governance: '治理', developers: '開發者', community: '社群' },
  links: {
    liquidityHub: 'Liquidity Hub',
    corePool: 'Core Pool',
    vaults: '金庫',
    prime: 'Prime',
    trade: '交易',
    bridge: '跨鏈橋',
    proposals: '提案',
    voters: '投票者排行榜',
    forum: '社群論壇',
    docs: '文件',
    skills: 'Agent skills',
    audits: '安全與審計',
    github: 'GitHub',
    telegram: 'Telegram',
    discord: 'Discord',
    x: 'X',
  },
  privacy: '私隱政策',
  terms: '使用條款',
  rights: '© {year} Venus Protocol',
  live: '運行於 {chain}',
  block: '區塊',
};

const zhHans: FooterCopy = {
  ...zhHant,
  tagline: '存一次，连接每一个市场。',
  columns: { products: '产品', governance: '治理', developers: '开发者', community: '社区' },
  links: {
    ...zhHant.links,
    vaults: '金库',
    bridge: '跨链桥',
    voters: '投票者排行榜',
    forum: '社区论坛',
    docs: '文档',
    audits: '安全与审计',
  },
  privacy: '隐私政策',
  terms: '使用条款',
  live: '运行于 {chain}',
  block: '区块',
};

export const footerCopyByLanguage: Record<string, FooterCopy> = {
  en,
  'zh-Hant': zhHant,
  'zh-Hans': zhHans,
};
