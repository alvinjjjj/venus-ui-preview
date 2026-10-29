export type GlassPreviewMode =
  | 'v1'
  | 'v5'
  | 'explorer'
  | 'lite-experiment'
  | 'lite-experiment-v2-legacy'
  | 'lite-experiment-v2'
  | 'lite-experiment-v3';

interface PreviewVersion {
  id: GlassPreviewMode;
  label: string;
  description: string;
}

export const currentVersions: PreviewVersion[] = [
  { id: 'lite-experiment-v2', label: 'Final', description: 'Final' },
];

export const beforeVersions: PreviewVersion[] = [
  { id: 'v1', label: 'O', description: 'Original' },
  { id: 'lite-experiment-v2-legacy', label: 'E2', description: 'E2 original experiment' },
  { id: 'lite-experiment-v3', label: 'E3', description: 'Lite experiment 3' },
];

export const previewVersions = [...currentVersions, ...beforeVersions];

export const isLiteExperimentMode = (mode: GlassPreviewMode) =>
  mode === 'lite-experiment-v2-legacy' || mode === 'lite-experiment' || mode === 'lite-experiment-v2' || mode === 'lite-experiment-v3';

// All revisions start from the approved E material. The exact revision stays
// available separately on data-glass-revision for revision-only design changes.
export const getPreviewStudy = (mode: GlassPreviewMode) =>
  isLiteExperimentMode(mode) ? 'lite-experiment' : mode;

export const resolveSavedPreviewMode = (saved: string | null): GlassPreviewMode => {
  if (saved === 'o2') return 'v1';
  if (saved === 'lite-experiment' || saved === 'v5' || saved === 'explorer' || saved === 'v3' || saved === 'v6') return 'lite-experiment-v2';
  return previewVersions.some(version => version.id === saved) ? (saved as GlassPreviewMode) : 'v1';
};
