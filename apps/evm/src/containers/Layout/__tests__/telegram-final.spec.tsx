import { cleanup, render, screen } from '@testing-library/react';
import { useGlassPreview } from 'demo/GlassVersions/store';
import { TelegramMascot } from '../TelegramMascot';

vi.unmock('zustand');

afterEach(() => {
  cleanup();
  useGlassPreview.getState().setMode('v1');
});

it('removes the Telegram floating widget from Final', () => {
  useGlassPreview.getState().setMode('lite-experiment-v2');
  const { container } = render(<TelegramMascot />);
  expect(container).toBeEmptyDOMElement();
});

it('retains the widget for archived previews', () => {
  useGlassPreview.getState().setMode('v1');
  render(<TelegramMascot />);
  expect(screen.getByRole('button', { name: 'Open Telegram community popup' })).toBeInTheDocument();
});
