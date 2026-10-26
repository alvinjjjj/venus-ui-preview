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
    starTuning,
  }: {
    ambientLight?: boolean;
    settings: { lines: number };
    starTuning?: { warmth: number; brightness: number };
  }) => (
    <div
      data-testid="flow"
      data-ambient-light={Boolean(ambientLight)}
      data-lines={settings.lines}
      data-star-warmth={starTuning?.warmth}
      data-star-brightness={starTuning?.brightness}
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

it.each(['lite-experiment', 'lite-experiment-v2', 'lite-experiment-v3'])(
  'preserves sparse dust and the existing renderer choice for %s Light',
  async mode => {
    preview.mode = mode;
    const { container, queryAllByTestId } = render(<GhostBackground shared layeredLines />);
    expect(container.querySelector('.lite-ghost--light-ambient')).not.toBeNull();
    expect(container.querySelectorAll('.lite-ghost__light-dust circle')).toHaveLength(367);
    expect(container.querySelector('.lite-ghost__motion')).toBeNull();
    const count = mode === 'lite-experiment-v3' ? 0 : 1;
    await waitFor(() => expect(queryAllByTestId('flow')).toHaveLength(count));
    for (const renderer of queryAllByTestId('flow')) {
      expect(renderer).toHaveAttribute('data-ambient-light', 'true');
      expect(renderer).toHaveAttribute('data-lines', '20');
    }
    if (count === 0) expect(container.querySelector('.lite-ghost__hero-field')).toBeNull();
  },
);

it.each(['compact', 'reducedMotion'] as const)('keeps E Light static for %s', key => {
  preview[key] = true;
  const { container, queryByTestId } = render(<GhostBackground shared layeredLines />);
  expect(container.querySelectorAll('.lite-ghost__light-dust circle')).toHaveLength(367);
  expect(queryByTestId('flow')).toBeNull();
});

it.each([
  { mode: 'lite-experiment', light: false },
  { mode: 'lite-experiment-v2', light: false },
  { mode: 'lite-experiment-v3', light: false },
  { mode: 'v1', light: true },
  { mode: 'v5', light: true },
])('preserves the original sky in $mode / light=$light', async state => {
  Object.assign(preview, state);
  const { container, getAllByTestId } = render(<GhostBackground shared layeredLines />);
  expect(container.querySelector('.lite-ghost--light-ambient')).toBeNull();
  expect(container.querySelector('.lite-ghost__light-dust')).toBeNull();
  expect(container.querySelector('.lite-ghost__motion')).not.toBeNull();
  const count = ['lite-experiment-v2', 'lite-experiment-v3'].includes(state.mode) ? 1 : 2;
  await waitFor(() => expect(getAllByTestId('flow')).toHaveLength(count));
  for (const renderer of getAllByTestId('flow')) {
    expect(renderer).toHaveAttribute('data-ambient-light', 'false');
  }
});

it('gives Final the E2 horizon with shared E3 meteors', async () => {
  preview.mode = 'lite-experiment-v2';
  preview.light = false;
  const { container, getByTestId } = render(<GhostBackground shared layeredLines />);
  expect(container.querySelector('.lite-ghost--e2-horizon')).not.toBeNull();
  expect(container.querySelector('.lite-ghost--e3')).toBeNull();
  expect(container.querySelector('.lite-ghost__hero-field')).toBeNull();
  expect(container.querySelectorAll('.lite-ghost__meteor')).toHaveLength(3);
  await waitFor(() => expect(getByTestId('flow')).toBeVisible());
  expect(getByTestId('flow')).toHaveAttribute('data-lines', '0');
  expect(getByTestId('flow')).toHaveAttribute('data-star-warmth', '0.02');
  expect(getByTestId('flow')).toHaveAttribute('data-star-brightness', '1.8');
});

it.each(['compact', 'reducedMotion'] as const)('keeps the E2 horizon static for %s', key => {
  preview.mode = 'lite-experiment-v2';
  preview.light = false;
  preview[key] = true;
  const { container, queryByTestId } = render(<GhostBackground shared layeredLines />);
  expect(container.querySelector('.lite-ghost--e2-horizon')).not.toBeNull();
  expect(container.querySelector('.lite-ghost__still-layer')).not.toBeNull();
  expect(queryByTestId('flow')).toBeNull();
});

it('keeps E3 near stars and meteors without opting it into the E2 horizon', () => {
  preview.mode = 'lite-experiment-v3';
  preview.light = false;
  const { container } = render(<GhostBackground shared layeredLines />);
  expect(container.querySelector('.lite-ghost--e2-horizon')).toBeNull();
  expect(container.querySelector('.lite-ghost--e3')).not.toBeNull();
  expect(container.querySelector('.lite-ghost__near-stars')).not.toBeNull();
  expect(container.querySelectorAll('.lite-ghost__meteor')).toHaveLength(3);
});

it('does not opt a non-layered preview into the E Light background', () => {
  const { container } = render(<GhostBackground shared />);
  expect(container.querySelector('.lite-ghost--light-ambient')).toBeNull();
});
