import { ChainId, getToken } from '@venusprotocol/chains';
import venusLogo from 'assets/img/venusLogo.svg';
import { Icon } from 'components';
import { Link } from 'containers/Link';
import { isExplorerMode, useGlassPreview } from 'demo/GlassVersions/store';
import { useLiquidityLightPreview } from 'demo/useLiquidityLightPreview';
import { useTranslation } from 'libs/translations';
import { useState } from 'react';
import { orbitBrandMarks } from '../LandingMockup/orbitBrands';
import { getOrbitSatellites, orbitCoreRadius } from '../LandingMockup/orbitScene';
import { OrbitAssetTargets } from './OrbitAssetTargets';
import { ProofMetrics } from './ProofMetrics';
import { RippleField } from './RippleField';
import './styles.css';

// These rates describe the interaction only; they are deliberately not API data.
const assets = [
  { symbol: 'USDC', rate: '5.24%', tone: 'blue' },
  { symbol: 'USDT', rate: '4.86%', tone: 'green' },
  { symbol: 'U', rate: '6.12%', tone: 'silver' },
  { symbol: 'ETH', rate: '2.38%', tone: 'indigo' },
] as const;

const copyByLanguage = {
  en: {
    title: 'Put your assets to work.',
    body: 'Explore assets and yields through Venus.',
    instruction: 'Choose an asset to explore',
    example: 'Example Supply APY',
    action: 'Explore Liquidity Hub',
    mock: 'Layout preview value',
    asOf: 'Official data as of 7 Oct 2026',
    stats: ['Operating since', 'Active markets', 'Executed proposals', 'Published audit reports'],
    // New (split layout): accent units after each figure; labels then add the context.
    units: ['', 'markets', 'VIPs', 'audits'],
    splitStats: [
      'Operating since',
      'Open on 8 chains',
      'Executed by governance',
      'Published reports',
    ],
    eyebrow: 'By the numbers',
    openHint: 'Double-click to open',
    close: 'Close asset details',
    select: 'Show example yield for',
  },
  'zh-Hant': {
    title: '讓你的資產發揮價值。',
    body: '透過 Venus，探索資產與收益機會。',
    instruction: '選擇資產，探索收益',
    example: '存款 APY 示意',
    action: '探索 Liquidity Hub',
    mock: '版面示意數值',
    asOf: '官方資料，截至 2026 年 10 月 7 日',
    stats: ['開始營運年份', '活躍市場', '已執行治理提案', '已發布審計報告'],
    units: ['', '個市場', '項提案', '份審計'],
    splitStats: ['開始營運', '分布於 8 條鏈', '經治理執行', '已發布報告'],
    eyebrow: '數據一覽',
    openHint: '按兩下開啟',
    close: '關閉資產詳情',
    select: '查看收益示意：',
  },
  'zh-Hans': {
    title: '让你的资产发挥价值。',
    body: '通过 Venus，探索资产与收益机会。',
    instruction: '选择资产，探索收益',
    example: '存款 APY 示意',
    action: '探索 Liquidity Hub',
    mock: '版面示意数值',
    asOf: '官方数据，截至 2026 年 10 月 7 日',
    stats: ['开始运营年份', '活跃市场', '已执行治理提案', '已发布审计报告'],
    units: ['', '个市场', '项提案', '份审计'],
    splitStats: ['开始运营', '分布于 8 条链', '经治理执行', '已发布报告'],
    eyebrow: '数据一览',
    openHint: '双击打开',
    close: '关闭资产详情',
    select: '查看收益示意：',
  },
};

export const AssetOrbit: React.FC<{
  transitionProgress?: number;
  study?: boolean;
  abstractAssets?: boolean;
}> = ({ transitionProgress, study = false, abstractAssets = false }) => {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const copy = copyByLanguage[language as keyof typeof copyByLanguage] ?? copyByLanguage.en;
  const light = useLiquidityLightPreview();
  const explorer = useGlassPreview(state => isExplorerMode(state.mode));
  // New: orbit on the left, title and figures on the right (desktop flow only).
  const split = useGlassPreview(state => state.mode === 'v5') && abstractAssets;
  const [selected, setSelected] = useState<string | null>(
    transitionProgress === undefined ? 'USDC' : null,
  );
  const asset = assets.find(item => item.symbol === selected);

  return (
    <section
      className="asset-orbit"
      data-light={light}
      data-abstract={abstractAssets}
      data-layout={split ? 'split' : undefined}
      aria-labelledby="asset-orbit-title"
      id="asset-yields"
      inert={study || (transitionProgress !== undefined && transitionProgress < 0.99)}
      aria-hidden={study || (transitionProgress !== undefined && transitionProgress < 0.99)}
    >
      <div className="asset-orbit__inner">
        <header className="asset-orbit__header">
          <h2 id="asset-orbit-title">{copy.title}</h2>
          <p>{copy.body}</p>
        </header>

        <div className="asset-orbit__scene" data-selected={selected ?? ''}>
          {transitionProgress === undefined && <RippleField light={light} />}
          <div
            className="asset-orbit__core"
            role={abstractAssets ? 'img' : undefined}
            aria-label={
              abstractAssets ? 'Venus Liquidity Hub with USDC, USDT, U and BNB' : undefined
            }
          >
            <div className="asset-orbit__core-disc">
              <img src={venusLogo} alt="Venus" />
            </div>
            {!abstractAssets && <span>Venus Liquidity Hub</span>}
          </div>

          {abstractAssets ? (
            <div className="asset-orbit__spheres" aria-hidden="true">
              {getOrbitSatellites(explorer).map(item => (
                <div
                  key={item.symbol}
                  className="asset-orbit__sphere"
                  data-tone={item.color}
                  style={{
                    width: `calc(var(--flow-core-diameter) * ${item.radius / orbitCoreRadius})`,
                  }}
                >
                  <img src={orbitBrandMarks[item.symbol]} alt={item.symbol} />
                </div>
              ))}
            </div>
          ) : (
            <div className="asset-orbit__assets" role="group" aria-label={copy.instruction}>
              {assets.map(item => {
                const token = getToken({ chainId: ChainId.BSC_MAINNET, symbol: item.symbol });
                return (
                  <button
                    key={item.symbol}
                    type="button"
                    className="asset-orbit__asset"
                    data-asset={item.symbol}
                    data-tone={item.tone}
                    aria-label={`${copy.select} ${item.symbol}`}
                    aria-pressed={selected === item.symbol}
                    aria-controls="asset-orbit-details"
                    onMouseEnter={() => setSelected(item.symbol)}
                    onFocus={() => setSelected(item.symbol)}
                    onClick={() => setSelected(item.symbol)}
                    onKeyDown={event => {
                      if (event.key === 'Escape') setSelected(null);
                    }}
                  >
                    <span className="asset-orbit__asset-disc">
                      {token ? (
                        <img src={token.iconSrc} alt={item.symbol} />
                      ) : (
                        <span>{item.symbol}</span>
                      )}
                    </span>
                    <span className="asset-orbit__asset-name">{item.symbol}</span>
                  </button>
                );
              })}
            </div>
          )}

          {abstractAssets && (
            <OrbitAssetTargets
              selectLabel={copy.select}
              rateLabel={copy.example}
              hintLabel={copy.openHint}
              ready={!study && (transitionProgress ?? 1) >= 0.99}
            />
          )}

          {!abstractAssets && (
            <div
              id="asset-orbit-details"
              className="asset-orbit__details"
              aria-live="polite"
              onKeyDown={event => {
                if (event.key === 'Escape') setSelected(null);
              }}
            >
              {asset ? (
                <>
                  <div className="asset-orbit__details-heading">
                    <strong>{asset.symbol}</strong>
                    <button type="button" aria-label={copy.close} onClick={() => setSelected(null)}>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m7 7 10 10M17 7 7 17" />
                      </svg>
                    </button>
                  </div>
                  <span className="asset-orbit__rate-label">{copy.example}</span>
                  <div className="asset-orbit__rate">{asset.rate}</div>
                  <Link to="/liquidity-hubs" className="asset-orbit__link">
                    {copy.action}
                    <Icon name="arrowRight" className="asset-orbit__link-icon" />
                  </Link>
                </>
              ) : (
                <p className="asset-orbit__choose">{copy.instruction}</p>
              )}
            </div>
          )}
        </div>

        <ProofMetrics
          labels={split ? copy.splitStats : copy.stats}
          units={split ? copy.units : undefined}
          eyebrow={split ? copy.eyebrow : undefined}
          // Explorer shows checked values (see ProofMetrics); New keeps the layout draft.
          placeholderLabel={explorer ? copy.asOf : copy.mock}
          ready={!study && (transitionProgress === undefined || transitionProgress >= 0.995)}
        />
      </div>
    </section>
  );
};
