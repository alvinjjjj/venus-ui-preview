import { cleanup, render, waitFor } from '@testing-library/react';
import { GhostBackground } from './GhostBackground';

const preview = vi.hoisted(() => ({
  mode: 'lite-experiment',
  light: true,
  compact: false,
  reducedMotion: false,
}));

vi.mock('demo/GlassVersions/store', () => ({
  useGlassPreview: (selector: (state: { mode: string }) => unknown) => selector(preview),
}));
vi.mock('demo/useLiquidityLightPreview', () => ({
  useLiquidityLightPreview: () => preview.light,
}));
vi.mock('hooks/responsive', () => ({ useIsMdDown: () => preview.compact }));
vi.mock('motion/react', () => ({ useReducedMotion: () => preview.reducedMotion }));
vi.mock('../Landing/LandingMockup/FlowFieldThree', () => ({
  FlowFieldThree: ({
    ambientLight,
    settings,
  }: { ambientLight?: boolean; settings: { lines: number } }) => (
    <div
      data-testid="flow"
      data-ambient-light={Boolean(ambientLight)}
      data-lines={settings.lines}
    />
  ),
}));

beforeEach(() => {
  Object.assign(preview, {
    mode: 'lite-experiment',
    light: true,
    compact: false,
    reducedMotion: false,
  });
});
afterEach(cleanup);

it('uses sparse static dust and just the existing line renderer for E Light', async () => {
  const { container, getAllByTestId } = render(<GhostBackground shared layeredLines />);
  expect(container.querySelector('.lite-ghost--light-ambient')).not.toBeNull();
  expect(container.querySelectorAll('.lite-ghost__light-dust circle')).toHaveLength(367);
  expect(container.querySelector('.lite-ghost__motion')).toBeNull();
  await waitFor(() => expect(getAllByTestId('flow')).toHaveLength(1));
  expect(getAllByTestId('flow')[0]).toHaveAttribute('data-ambient-light', 'true');
  expect(getAllByTestId('flow')[0]).toHaveAttribute('data-lines', '20');
});

it.each(['compact', 'reducedMotion'] as const)('keeps E Light static for %s', key => {
  preview[key] = true;
  const { container, queryByTestId } = render(<GhostBackground shared layeredLines />);
  expect(container.querySelectorAll('.lite-ghost__light-dust circle')).toHaveLength(367);
  expect(queryByTestId('flow')).toBeNull();
});

it.each([
  { mode: 'lite-experiment', light: false },
  { mode: 'v1', light: true },
  { mode: 'v5', light: true },
])('preserves the original sky in $mode / light=$light', async state => {
  Object.assign(preview, state);
  const { container, getAllByTestId } = render(<GhostBackground shared layeredLines />);
  expect(container.querySelector('.lite-ghost--light-ambient')).toBeNull();
  expect(container.querySelector('.lite-ghost__light-dust')).toBeNull();
  expect(container.querySelector('.lite-ghost__motion')).not.toBeNull();
  await waitFor(() => expect(getAllByTestId('flow')).toHaveLength(2));
  for (const renderer of getAllByTestId('flow')) {
    expect(renderer).toHaveAttribute('data-ambient-light', 'false');
  }
});

it('does not opt a non-layered preview into the E Light background', () => {
  const { container } = render(<GhostBackground shared />);
  expect(container.querySelector('.lite-ghost--light-ambient')).toBeNull();
});
