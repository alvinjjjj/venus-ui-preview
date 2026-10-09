/** Explorer Section 5 copy. */
export interface CommunityCopy {
  joinTitle: string;
  joinBody: string;
  joinCta: string;
  channel: string;
  now: string;
  msgVote: string;
  msgPrime: string;
  msgHub: string;
  bountyTitle: string;
  bountyBody: string;
  found: string;
  reported: string;
  rewarded: string;
  terminal: { review: string; finding: string; report: string; reward: string };
  govTitle: string;
  govBody: string;
  proposals: string;
  latest: string;
  forLabel: string;
  againstLabel: string;
  passed: string;
  voting: string;
  closed: string;
  since: string;
  executedCount: string;
  left: string;
  timelock: string;
  executed: string;
}

const en: CommunityCopy = {
  joinTitle: 'Join the Venus community.',
  joinBody:
    'New proposals, Prime cycles and markets land here first. Talk them through with the people building Venus.',
  joinCta: 'Join Telegram',
  channel: 'Venus Protocol',
  now: 'now',
  msgVote: 'VIP-{id} is open for voting: {title}. {time} left.',
  msgPrime:
    'Prime cycle {cycle} ends in {days} days. The top {seats} stakers earn boosted rates next cycle.',
  msgHub: 'Liquidity Hub: {sym} is earning {apy} APY right now.',
  bountyTitle: 'Challenge our code and be rewarded.',
  bountyBody: 'Every contract is open source. Find a vulnerability, report it and earn a bounty.',
  found: 'Found',
  reported: 'Reported',
  rewarded: 'Rewarded',
  terminal: {
    review: 'review {file}',
    finding: '1 finding · line {line}',
    report: 'report submitted',
    reward: 'bounty paid',
  },
  govTitle: 'Money markets governed by community.',
  govBody: 'Every change is proposed, voted on by XVS holders and timelocked before it runs.',
  proposals: 'Venus Improvement Proposals',
  latest: 'Latest',
  forLabel: 'For',
  againstLabel: 'Against',
  passed: 'Passed',
  voting: 'Voting now',
  closed: 'Not passed',
  since: 'One square per proposal, since 2021',
  executedCount: '{n} executed',
  left: '{time} left',
  timelock: 'Timelock',
  executed: 'Executed',
};

const zhHant: CommunityCopy = {
  joinTitle: '加入 Venus 社群。',
  joinBody: '新提案、Prime 週期和新市場都會第一時間在這裡公布，也可以直接跟打造 Venus 的人討論。',
  joinCta: '加入 Telegram',
  channel: 'Venus Protocol',
  now: '剛剛',
  msgVote: 'VIP-{id} 開放投票：{title}。剩 {time}。',
  msgPrime: 'Prime 第 {cycle} 週期 {days} 天後結束，前 {seats} 名質押者下個週期享有加成收益。',
  msgHub: 'Liquidity Hub：{sym} 目前 APY {apy}。',
  bountyTitle: '挑戰我們的程式碼，贏取獎勵。',
  bountyBody: '所有合約都是開源的。找到漏洞、提交報告，就能獲得獎金。',
  found: '發現',
  reported: '已回報',
  rewarded: '已獎勵',
  terminal: {
    review: 'review {file}',
    finding: '1 finding · line {line}',
    report: 'report submitted',
    reward: 'bounty paid',
  },
  govTitle: '由社群治理的貨幣市場。',
  govBody: '每一項變更都經過提案、XVS 持有者投票和時間鎖，才會執行。',
  proposals: '個 Venus 改進提案',
  latest: '最新',
  forLabel: '贊成',
  againstLabel: '反對',
  passed: '已通過',
  voting: '投票中',
  closed: '未通過',
  since: '每一格是一個提案，自 2021 年起',
  executedCount: '已執行 {n} 個',
  left: '剩 {time}',
  timelock: '時間鎖',
  executed: '已執行',
};

const zhHans: CommunityCopy = {
  ...zhHant,
  joinTitle: '加入 Venus 社区。',
  joinBody: '新提案、Prime 周期和新市场都会第一时间在这里公布，也可以直接跟打造 Venus 的人讨论。',
  joinCta: '加入 Telegram',
  now: '刚刚',
  msgVote: 'VIP-{id} 开放投票：{title}。剩 {time}。',
  msgPrime: 'Prime 第 {cycle} 周期 {days} 天后结束，前 {seats} 名质押者下个周期享有加成收益。',
  msgHub: 'Liquidity Hub：{sym} 目前 APY {apy}。',
  bountyTitle: '挑战我们的代码，赢取奖励。',
  bountyBody: '所有合约都是开源的。找到漏洞、提交报告，就能获得奖金。',
  found: '发现',
  reported: '已报告',
  rewarded: '已奖励',
  govTitle: '由社区治理的货币市场。',
  govBody: '每一项变更都经过提案、XVS 持有者投票和时间锁，才会执行。',
  proposals: '个 Venus 改进提案',
  forLabel: '赞成',
  againstLabel: '反对',
  passed: '已通过',
  voting: '投票中',
  closed: '未通过',
  since: '每一格是一个提案，自 2021 年起',
  executedCount: '已执行 {n} 个',
  left: '剩 {time}',
  timelock: '时间锁',
  executed: '已执行',
};

export const communityCopyByLanguage: Record<string, CommunityCopy> = {
  en,
  'zh-Hant': zhHant,
  'zh-Hans': zhHans,
};
