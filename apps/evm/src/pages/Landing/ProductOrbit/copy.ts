// Explorer Section 3 copy. Kept beside the component, as AssetOrbit does, while the
// section is a design prototype; move to the translation files once it is approved.
// No rates or counts here: everything on screen describes how the products work.

export type ProductCopy = typeof en;

const en = {
  intro: {
    title: 'Inside Venus',
    body: 'One deposit at the centre. Every market around it.',
  },
  hub: {
    eyebrow: '01 · Liquidity Hub',
    title: 'Supply once.',
    body: 'Deposit a stablecoin and hold a vhToken that grows in value on its own. The same token counts as collateral, so one deposit can earn and back a loan.',
    from: 'You supply',
    to: 'You hold',
    tags: ['Earns automatically', 'Usable as collateral', 'Nothing to claim'],
    cta: 'Explore Liquidity Hub',
  },
  spokes: {
    eyebrow: '02 · Spoke markets',
    title: 'Your liquidity goes to work.',
    body: 'The Hub routes deposits across Spoke markets in a priority order set by governance, each within its own cap.',
    order: 'Allocation order',
    items: [
      { id: 'core', name: 'Venus Core', note: 'Classic lending and borrowing' },
      { id: 'flux', name: 'Venus Flux', note: 'Capital-efficient markets' },
      { id: 'fixed', name: 'Fixed Rate', note: 'Locked-in yield' },
    ],
    next: { name: 'Next Spoke', note: 'Added by governance, without touching the others' },
  },
  apps: {
    eyebrow: '03 · Built around the Hub',
    title: 'More ways to use Venus.',
    items: [
      {
        id: 'vaults',
        name: 'Vaults',
        note: 'Stake XVS for voting power and a shot at Prime, or lock into a fixed-term vault.',
        cta: 'Open Vaults',
        to: '/vaults',
      },
      {
        id: 'prime',
        name: 'Prime',
        note: 'Each month the top XVS stakers earn boosted rates, including on Liquidity Hub deposits.',
        cta: 'See the leaderboard',
        to: '/prime-leaderboard',
      },
      {
        id: 'trade',
        name: 'Trade',
        note: 'Open leveraged long and short positions on Venus markets.',
        cta: 'Start trading',
        to: '/trade',
      },
    ],
  },
  labels: {
    hub: 'Liquidity Hub',
    core: 'Venus Core',
    flux: 'Venus Flux',
    fixed: 'Fixed Rate',
    next: 'Next Spoke',
    vaults: 'Vaults',
    prime: 'Prime',
    trade: 'Trade',
  },
  section: 'Venus products',
};

const zhHant: ProductCopy = {
  intro: { title: '走進 Venus', body: '中心是一次存入，四周是每一個市場。' },
  hub: {
    eyebrow: '01 · 流動性中心',
    title: '存一次就好。',
    body: '存入穩定幣，拿到會自己增值的 vhToken。這個 token 同時可以當抵押品，一筆存款既能賺收益，也能用來借款。',
    from: '你存入',
    to: '你持有',
    tags: ['自動累積收益', '可作抵押品', '不用領取'],
    cta: '探索 Liquidity Hub',
  },
  spokes: {
    eyebrow: '02 · Spoke 市場',
    title: '你的資金開始運作。',
    body: '流動性中心依治理設定的優先順序，把資金分配到各個 Spoke 市場，每個市場都有自己的上限。',
    order: '分配順序',
    items: [
      { id: 'core', name: 'Venus Core', note: '經典借貸' },
      { id: 'flux', name: 'Venus Flux', note: '資金效率更高的市場' },
      { id: 'fixed', name: 'Fixed Rate', note: '鎖定收益' },
    ],
    next: { name: '下一個 Spoke', note: '由治理加入，不影響現有市場' },
  },
  apps: {
    eyebrow: '03 · 圍繞流動性中心',
    title: '更多使用 Venus 的方式。',
    items: [
      {
        id: 'vaults',
        name: 'Vaults',
        note: '質押 XVS 取得投票權和 Prime 資格，或參加定期金庫。',
        cta: '打開金庫',
        to: '/vaults',
      },
      {
        id: 'prime',
        name: 'Prime',
        note: '每月排名前列的 XVS 質押者享有加成收益，透過流動性中心存入的資金也算在內。',
        cta: '查看排行榜',
        to: '/prime-leaderboard',
      },
      {
        id: 'trade',
        name: 'Trade',
        note: '在 Venus 市場上開槓桿多空倉位。',
        cta: '開始交易',
        to: '/trade',
      },
    ],
  },
  labels: {
    hub: 'Liquidity Hub',
    core: 'Venus Core',
    flux: 'Venus Flux',
    fixed: 'Fixed Rate',
    next: '下一個 Spoke',
    vaults: 'Vaults',
    prime: 'Prime',
    trade: 'Trade',
  },
  section: 'Venus 產品',
};

const zhHans: ProductCopy = {
  intro: { title: '走进 Venus', body: '中心是一次存入，四周是每一个市场。' },
  hub: {
    eyebrow: '01 · 流动性中心',
    title: '存一次就好。',
    body: '存入稳定币，拿到会自己增值的 vhToken。这个 token 同时可以作为抵押品，一笔存款既能赚收益，也能用来借款。',
    from: '你存入',
    to: '你持有',
    tags: ['自动累积收益', '可作抵押品', '无需领取'],
    cta: '探索 Liquidity Hub',
  },
  spokes: {
    eyebrow: '02 · Spoke 市场',
    title: '你的资金开始运作。',
    body: '流动性中心按治理设定的优先顺序，把资金分配到各个 Spoke 市场，每个市场都有自己的上限。',
    order: '分配顺序',
    items: [
      { id: 'core', name: 'Venus Core', note: '经典借贷' },
      { id: 'flux', name: 'Venus Flux', note: '资金效率更高的市场' },
      { id: 'fixed', name: 'Fixed Rate', note: '锁定收益' },
    ],
    next: { name: '下一个 Spoke', note: '由治理加入，不影响现有市场' },
  },
  apps: {
    eyebrow: '03 · 围绕流动性中心',
    title: '更多使用 Venus 的方式。',
    items: [
      {
        id: 'vaults',
        name: 'Vaults',
        note: '质押 XVS 获得投票权和 Prime 资格，或参加定期金库。',
        cta: '打开金库',
        to: '/vaults',
      },
      {
        id: 'prime',
        name: 'Prime',
        note: '每月排名靠前的 XVS 质押者享有加成收益，通过流动性中心存入的资金也计算在内。',
        cta: '查看排行榜',
        to: '/prime-leaderboard',
      },
      {
        id: 'trade',
        name: 'Trade',
        note: '在 Venus 市场上开杠杆多空仓位。',
        cta: '开始交易',
        to: '/trade',
      },
    ],
  },
  labels: {
    hub: 'Liquidity Hub',
    core: 'Venus Core',
    flux: 'Venus Flux',
    fixed: 'Fixed Rate',
    next: '下一个 Spoke',
    vaults: 'Vaults',
    prime: 'Prime',
    trade: 'Trade',
  },
  section: 'Venus 产品',
};

export const productCopyByLanguage: Record<string, ProductCopy> = {
  en,
  'zh-Hant': zhHant,
  'zh-Hans': zhHans,
};
