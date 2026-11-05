import { getLineChartYAxis } from './getLineChartYAxis';

it('matches the five-tick Figma scale when supplied its example values', () => {
  expect(getLineChartYAxis([100_000_00, 130_000_00])?.ticks).toEqual([
    90_000_00, 100_000_00, 110_000_00, 120_000_00, 130_000_00,
  ]);
});

it.each([
  [399_000, 413_000],
  [0, 0],
  [100, 100],
  [-25_000, -18_000],
  [-12_000, 8_000],
  [0.01, 0.04],
])('keeps all monetary values visible on a finite, increasing scale: %j', (minimum, maximum) => {
  const scale = getLineChartYAxis([minimum, maximum]);
  expect(scale?.ticks).toHaveLength(5);
  expect(scale?.domain[0]).toBeLessThanOrEqual(minimum);
  expect(scale?.domain[1]).toBeGreaterThanOrEqual(maximum);
  expect(scale?.ticks.every(Number.isFinite)).toBe(true);
  expect(scale?.ticks.every((value, index, ticks) => index === 0 || value > ticks[index - 1])).toBe(
    true,
  );
});

it('ignores non-finite values and has no scale for an empty history', () => {
  expect(getLineChartYAxis([])).toBeUndefined();
  expect(getLineChartYAxis([Number.NaN, Number.POSITIVE_INFINITY])).toBeUndefined();
  expect(getLineChartYAxis([399_000, Number.NaN, 413_000])).toEqual(
    getLineChartYAxis([399_000, 413_000]),
  );
});
