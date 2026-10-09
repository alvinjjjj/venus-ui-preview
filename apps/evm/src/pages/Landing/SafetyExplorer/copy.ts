/** Explorer Section 4 copy. Audit counts are static until FE serves them from an API. */
export interface SafetyCopy {
  title: string;
  body: string;
  audit: string;
  audits: string;
  more: string;
  scoreLabel: string;
  rank: string;
  source: string;
}

const en: SafetyCopy = {
  title: 'Safety before all.',
  body: '{audits} audits by {firms} security firms, and a public score anyone can check.',
  audit: 'Audit',
  audits: 'Audits',
  more: '+{count} audits by Fairyproof, Hacken and HashEx',
  scoreLabel: 'Security score',
  rank: '#3 lending protocol on BNB Chain',
  source: 'CertiK Skynet · Oct 2026',
};

const zhHant: SafetyCopy = {
  title: '安全，永遠優先。',
  body: '{firms} 家安全公司、{audits} 份審計，安全評分公開可查。',
  audit: '份審計',
  audits: '份審計',
  more: '另有 {count} 份審計，來自 Fairyproof、Hacken 和 HashEx',
  scoreLabel: '安全評分',
  rank: 'BNB Chain 借貸協議第 3 名',
  source: 'CertiK Skynet · 2026 年 10 月',
};

const zhHans: SafetyCopy = {
  title: '安全，永远优先。',
  body: '{firms} 家安全公司、{audits} 份审计，安全评分公开可查。',
  audit: '份审计',
  audits: '份审计',
  more: '另有 {count} 份审计，来自 Fairyproof、Hacken 和 HashEx',
  scoreLabel: '安全评分',
  rank: 'BNB Chain 借贷协议第 3 名',
  source: 'CertiK Skynet · 2026 年 10 月',
};

export const safetyCopyByLanguage: Record<string, SafetyCopy> = {
  en,
  'zh-Hant': zhHant,
  'zh-Hans': zhHans,
};
