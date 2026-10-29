import { ProgressCircle } from 'components';
import { useHealthFactor } from 'hooks/useHealthFactor';
import { useTranslation } from 'libs/translations';
import { formatHealthFactorToReadableValue } from 'utilities';

/** The existing progress circle, using the same risk thresholds as the summary pill. */
export function PositionHealthIndicator({ factor }: { factor: number }) {
  const { color, label } = useHealthFactor({ value: factor });
  const { t } = useTranslation();
  const description = `${t(
    'account.summary.cellGroup.healthFactor',
  )}: ${formatHealthFactorToReadableValue({ value: factor })} · ${label}`;

  return (
    <span className="inline-flex shrink-0" title={description}>
      <ProgressCircle
        role="img"
        aria-label={description}
        value={factor > 0 ? Math.min(100, 100 / factor) : 100}
        sizePx={20}
        strokeWidthPx={2}
        fillColor={color}
        className="size-5 shrink-0 [&>circle:first-of-type]:stroke-light-grey/30"
      />
    </span>
  );
}
