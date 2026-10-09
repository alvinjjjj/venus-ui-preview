import type { VisualDeckCopy } from './StepVisualDeck';

/**
 * Step 04 Earn more. Templates: `{seats}` Prime seats, `{min}` XVS at the last seat,
 * `{cycle}` cycle number, `{days}` days left, `{pool}` this cycle's Prime rewards,
 * `{base}` USDT supply APY, `{boost}` Prime boost, `{total}` both, `{xvs}` XVS staked.
 */
export interface EarnVisualCopy extends VisualDeckCopy {
  agentName: string;
  stakeTitle: string;
  votingPower: string;
  votes: string;
  cutoff: string;
  votingNote: string;
  cycle: string;
  endsIn: string;
  yourRank: string;
  topSeats: string;
  daysStaked: string;
  scoreRule: string;
  rankNote: string;
  marketTitle: string;
  supplyApy: string;
  primeBoost: string;
  estimated: string;
  pool: string;
  poolNote: string;
  boostNote: string;
  agentPrompts: [string, string, string];
  agentReplies: [string, string, string];
}

const en: EarnVisualCopy = {
  human: 'Human',
  agent: 'Venus AI Agent',
  agentName: 'Venus AI Agent',
  hub: 'XVS Vault',
  screens: ['Stake', 'Rank', 'Boost'],
  pause: 'Pause',
  resume: 'Play',
  replay: 'Replay',
  stakeTitle: 'Stake in the XVS Vault',
  votingPower: 'Voting power',
  votes: 'votes',
  cutoff: 'Top {seats} starts at',
  votingNote: 'Staked XVS is also your vote on Venus governance.',
  cycle: 'Prime cycle {cycle}',
  endsIn: 'Ends in {days} days',
  yourRank: 'Your rank',
  topSeats: 'Top {seats}',
  daysStaked: 'Days staked',
  scoreRule: 'Prime score = XVS staked × time staked',
  rankNote: 'Be in the top {seats} when the cycle ends to earn Prime in the next one.',
  marketTitle: 'Core Pool · USDT supply',
  supplyApy: 'Supply APY',
  primeBoost: 'Prime boost',
  estimated: 'estimated average',
  pool: 'Prime rewards this cycle',
  poolNote: 'Shared by the top {seats} as boosted rates on Core Pool markets.',
  boostNote:
    'Your boost depends on your XVS stake and what you supply. The Prime calculator shows yours.',
  agentPrompts: [
    'How can I earn more on Venus?',
    'How do I get into Prime?',
    'What does Prime give me?',
  ],
  agentReplies: [
    'Stake XVS in the vault. You get voting power and a Prime score. Today the top {seats} starts at about {min} XVS.',
    'Your score is XVS staked × time staked, so it grows every day. Cycle {cycle} ends in {days} days; be in the top {seats} by then.',
    'About {pool} in Prime rewards this cycle, shared by the top {seats} as boosted rates on Core Pool markets.',
  ],
};

const zhHant: EarnVisualCopy = {
  human: '親自操作',
  agent: 'Venus AI 代理',
  agentName: 'Venus AI 代理',
  hub: 'XVS 金庫',
  screens: ['質押', '排名', '加成'],
  pause: '暫停',
  resume: '播放',
  replay: '重播',
  stakeTitle: '在 XVS 金庫質押',
  votingPower: '投票權',
  votes: '票',
  cutoff: '前 {seats} 名門檻',
  votingNote: '質押的 XVS 同時是你在 Venus 治理中的投票權。',
  cycle: 'Prime 第 {cycle} 週期',
  endsIn: '{days} 天後結束',
  yourRank: '你的排名',
  topSeats: '前 {seats} 名',
  daysStaked: '已質押天數',
  scoreRule: 'Prime 分數 = 質押 XVS × 質押時間',
  rankNote: '週期結束時排在前 {seats} 名，下一個週期就能賺取 Prime 獎勵。',
  marketTitle: 'Core Pool · USDT 存款',
  supplyApy: '存款 APY',
  primeBoost: 'Prime 加成',
  estimated: '平均估算',
  pool: '本週期 Prime 獎勵',
  poolNote: '由前 {seats} 名分享，以 Core Pool 市場的加成收益發放。',
  boostNote: '你的加成取決於 XVS 質押量和存款金額，可用 Prime 計算器查看。',
  agentPrompts: ['我怎樣可以在 Venus 賺更多？', '怎樣才能拿到 Prime？', 'Prime 會給我甚麼？'],
  agentReplies: [
    '在金庫質押 XVS，你會得到投票權和 Prime 分數。目前前 {seats} 名的門檻約 {min} XVS。',
    '分數是「質押 XVS × 質押時間」，所以每天都會增加。第 {cycle} 週期還有 {days} 天結束，在那之前排進前 {seats} 名就可以。',
    '本週期約有 {pool} 的 Prime 獎勵，由前 {seats} 名以 Core Pool 市場加成收益的形式分享。',
  ],
};

const zhHans: EarnVisualCopy = {
  human: '亲自操作',
  agent: 'Venus AI 代理',
  agentName: 'Venus AI 代理',
  hub: 'XVS 金库',
  screens: ['质押', '排名', '加成'],
  pause: '暂停',
  resume: '播放',
  replay: '重播',
  stakeTitle: '在 XVS 金库质押',
  votingPower: '投票权',
  votes: '票',
  cutoff: '前 {seats} 名门槛',
  votingNote: '质押的 XVS 同时是你在 Venus 治理中的投票权。',
  cycle: 'Prime 第 {cycle} 周期',
  endsIn: '{days} 天后结束',
  yourRank: '你的排名',
  topSeats: '前 {seats} 名',
  daysStaked: '已质押天数',
  scoreRule: 'Prime 分数 = 质押 XVS × 质押时间',
  rankNote: '周期结束时排在前 {seats} 名，下一个周期就能赚取 Prime 奖励。',
  marketTitle: 'Core Pool · USDT 存款',
  supplyApy: '存款 APY',
  primeBoost: 'Prime 加成',
  estimated: '平均估算',
  pool: '本周期 Prime 奖励',
  poolNote: '由前 {seats} 名分享，以 Core Pool 市场的加成收益发放。',
  boostNote: '你的加成取决于 XVS 质押量和存款金额，可用 Prime 计算器查看。',
  agentPrompts: ['我怎样可以在 Venus 赚更多？', '怎样才能拿到 Prime？', 'Prime 会给我什么？'],
  agentReplies: [
    '在金库质押 XVS，你会获得投票权和 Prime 分数。目前前 {seats} 名的门槛约 {min} XVS。',
    '分数是「质押 XVS × 质押时间」，所以每天都会增加。第 {cycle} 周期还有 {days} 天结束，在那之前排进前 {seats} 名就可以。',
    '本周期约有 {pool} 的 Prime 奖励，由前 {seats} 名以 Core Pool 市场加成收益的形式分享。',
  ],
};

export const earnCopyByLanguage: Record<string, EarnVisualCopy> = {
  en,
  'zh-Hant': zhHant,
  'zh-Hans': zhHans,
};
