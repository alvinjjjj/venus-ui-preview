// Five evenly spaced, rounded monetary ticks, like the Dashboard design.
// Derive the scale from the account history rather than its illustrative labels.
export const getLineChartYAxis = (values: number[]) => {
  const finiteValues = values.filter(Number.isFinite);
  if (finiteValues.length === 0) return undefined;

  const minimum = Math.min(...finiteValues);
  const maximum = Math.max(...finiteValues);
  const extent = maximum - minimum || Math.max(Math.abs(maximum) * 0.2, 100);
  const rawStep = extent / 3;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step = ([1, 2, 2.5, 5, 10].find(value => value * magnitude >= rawStep) ?? 10) * magnitude;
  let lower = (Math.floor(minimum / step) - 1) * step;
  if (lower + 4 * step < maximum) lower = Math.ceil(maximum / step) * step - 4 * step;

  const ticks = Array.from({ length: 5 }, (_, index) =>
    Number((lower + index * step).toPrecision(12)),
  );
  return { domain: [ticks[0], ticks[4]] as [number, number], ticks };
};
