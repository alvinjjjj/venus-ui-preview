import { landingDesignByMode, previewDesignByMode, useGlassPreview } from '../store';
import {
  beforeVersions,
  currentVersions,
  getPreviewStudy,
  isLiteExperimentMode,
  resolveSavedPreviewMode,
} from '../variants';

vi.unmock('zustand');

it('keeps current E revisions separate from the preserved older designs', () => {
  expect(currentVersions.map(version => version.label)).toEqual(['Final']);
  expect(beforeVersions.map(version => version.label)).toEqual(['O', 'E2', 'E3']);
});

it.each(['lite-experiment', 'lite-experiment-v2', 'lite-experiment-v3'] as const)(
  '%s starts from the same E materials and landing composition',
  mode => {
    expect(isLiteExperimentMode(mode)).toBe(true);
    expect(getPreviewStudy(mode)).toBe('lite-experiment');
    expect(previewDesignByMode[mode]).toBe('v1');
    expect(landingDesignByMode[mode]).toBe('v1');
  },
);

it.each(['v1', 'v5', 'explorer'] as const)('does not opt %s into the E layout', mode => {
  expect(isLiteExperimentMode(mode)).toBe(false);
  expect(getPreviewStudy(mode)).toBe(mode);
});

it.each([
  ['lite-experiment', 'lite-experiment-v2'],
  ['lite-experiment-v2', 'lite-experiment-v2'],
  ['lite-experiment-v3', 'lite-experiment-v3'],
  ['v1', 'v1'],
  ['v5', 'lite-experiment-v2'],
  ['o2', 'v1'],
  ['explorer', 'lite-experiment-v2'],
  ['v3', 'lite-experiment-v2'],
  ['v6', 'lite-experiment-v2'],
  ['unknown', 'v1'],
  [null, 'v1'],
] as const)('restores saved %s as %s without conflating the E revisions', (saved, expected) => {
  expect(resolveSavedPreviewMode(saved)).toBe(expected);
});

it('stores retained revisions distinctly and redirects retired E/Explorer to Final', () => {
  const previous = useGlassPreview.getState().mode;
  try {
    useGlassPreview.getState().setMode('lite-experiment-v3');
    expect(useGlassPreview.getState().mode).toBe('lite-experiment-v3');
    useGlassPreview.getState().setMode('lite-experiment-v2');
    expect(useGlassPreview.getState().mode).toBe('lite-experiment-v2');
    useGlassPreview.getState().setMode('lite-experiment');
    expect(useGlassPreview.getState().mode).toBe('lite-experiment-v2');
    useGlassPreview.getState().setMode('explorer');
    expect(useGlassPreview.getState().mode).toBe('lite-experiment-v2');
  } finally {
    useGlassPreview.getState().setMode(previous);
  }
});
