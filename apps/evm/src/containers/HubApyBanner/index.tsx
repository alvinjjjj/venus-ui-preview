import { ButtonWrapper, cn } from '@venusprotocol/ui';
import { Icon } from 'components';
import { routes } from 'constants/routing';
import { Link } from 'containers/Link';
import { previewDesignByMode, useGlassPreview } from 'demo/GlassVersions/store';
import { useTranslation } from 'libs/translations';
import { useHubAssets } from 'pages/Landing/VenusSteps/useTopHub';
import { useEffect, useState } from 'react';
import { formatPercentageToReadableValue } from 'utilities';
import './styles.css';

const COUNT_MS = 1400;
const CLOSE_MS = 320;
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);

/** Counts from 0 to target once (ease-in-out); returns the target straight away when off. */
const useCountUp = (target: number | undefined, enabled: boolean) => {
  const [value, setValue] = useState(enabled ? 0 : target);

  useEffect(() => {
    if (target === undefined) return;
    if (!enabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / COUNT_MS, 1);
      setValue(target * easeInOut(progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, enabled]);

  return value;
};

/**
 * Blue promo banner shared by the Liquidity Hub and Venus Spoke pages: the best live
 * Liquidity Hub APY, with a CTA straight to that Hub's supply page. Same look as the
 * Markets ad banner (Figma Liquidity-Hub 146:15890). In the New / Explorer previews it
 * also animates: the APY counts up, a light sweeps across, and closing collapses it.
 * Dismissal lasts for the visit (preview: no persisted setting).
 */
export const HubApyBanner: React.FC<{ className?: string }> = ({ className }) => {
  const { t, Trans } = useTranslation();
  const [closing, setClosing] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const top = useHubAssets().assets[0];
  const isAnimated = previewDesignByMode[useGlassPreview(state => state.mode)] === 'v5';
  const apy = useCountUp(top?.apy, isAnimated);

  if (dismissed || !top) {
    return undefined;
  }

  // Count-up frames use a plain two-decimal figure (the shared formatter would print "< 0.01%").
  const apyLabel =
    apy === undefined || apy >= top.apy
      ? formatPercentageToReadableValue(top.apy)
      : `${apy.toFixed(2)}%`;

  const ctaPath = top.vhToken
    ? routes.liquidityHub.path.replace(':vhTokenAddress', top.vhToken.address)
    : routes.liquidityHubs.path;

  const handleClose = () => {
    if (!isAnimated) {
      setDismissed(true);
      return;
    }
    setClosing(true);
    window.setTimeout(() => setDismissed(true), CLOSE_MS);
  };

  return (
    <div
      data-hub-apy-banner={isAnimated ? 'animated' : 'static'}
      data-closing={closing || undefined}
      className={cn('hub-apy-banner', className)}
    >
      <div className="hub-apy-banner__inner w-full min-h-[53px] px-5 py-2 bg-linear-to-r from-[#01193A] to-[#0D3CB1] flex items-center justify-center">
        <div className="flex items-center gap-x-3">
          <div className="flex flex-col gap-y-1 sm:gap-y-2 lg:flex-row lg:items-center lg:gap-x-3">
            <p className="text-base leading-6 font-normal text-center">
              <Trans
                i18nKey="hubApyBanner.title"
                values={{ apy: apyLabel, symbol: top.symbol }}
                components={{
                  Strong: <strong style={{ fontWeight: 600 }} />,
                  // Brand light blue (Liquidity Hub icon highlight) for the APY figure.
                  Apy: (
                    <strong
                      className="hub-apy-banner__apy"
                      style={{ fontWeight: 600, color: '#85ccff' }}
                    />
                  ),
                }}
              />
            </p>

            <ButtonWrapper asChild size="xs">
              <Link to={ctaPath} noStyle className="hub-apy-banner__cta">
                {t('hubApyBanner.buttonLabel')}
              </Link>
            </ButtonWrapper>
          </div>

          <button type="button" className="cursor-pointer" onClick={handleClose} aria-label="Close">
            <Icon name="close" className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
