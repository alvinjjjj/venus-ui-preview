import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { ThemeSetting } from '.';

const themeState = vi.hoisted(() => ({ isLight: false, save: vi.fn() }));
vi.mock('../GlassVersions/store', () => ({
  useGlassPreview: (select: (state: { mode: string }) => unknown) =>
    select({ mode: 'lite-experiment-v2' }),
}));
vi.mock('../useLiquidityLightPreview', () => ({
  useLiquidityLightPreview: () => themeState.isLight,
  useDemoTheme: (select: (state: { setTheme: typeof themeState.save }) => unknown) =>
    select({ setTheme: themeState.save }),
}));

function LocationProbe() {
  const location = useLocation();
  return <output>{location.pathname + location.search}</output>;
}

beforeEach(() => {
  themeState.isLight = false;
  themeState.save.mockReset().mockImplementation(theme => {
    themeState.isLight = theme === 'light';
  });
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => vi.unstubAllGlobals());

it('selects either theme using named controls without changing the current page or filters', () => {
  render(
    <MemoryRouter initialEntries={['/dashboard?chainId=56&tab=pools&theme=dark']}>
      <ThemeSetting />
      <LocationProbe />
    </MemoryRouter>,
  );

  expect(screen.getByRole('button', { name: 'Dark mode' })).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Light mode' }));
  expect(themeState.save).toHaveBeenLastCalledWith('light');
  expect(screen.getByRole('button', { name: 'Light mode' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(screen.getByRole('status')).toHaveTextContent('/dashboard?chainId=56&tab=pools');

  fireEvent.click(screen.getByRole('button', { name: 'Dark mode' }));
  expect(themeState.save).toHaveBeenLastCalledWith('dark');
  expect(screen.getByRole('button', { name: 'Dark mode' })).toHaveAttribute('aria-pressed', 'true');
});
