import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { LiquidityLightPreview } from '..';
import { useDemoTheme } from '../../useLiquidityLightPreview';
vi.unmock('zustand');
beforeEach(() => useDemoTheme.getState().setTheme('dark'));

it('applies light mode and restores the original theme on unmount', () => {
  const { unmount } = render(
    <MemoryRouter initialEntries={['/liquidity-hubs?chainId=56&theme=light']}>
      <LiquidityLightPreview />
    </MemoryRouter>,
  );
  expect(document.documentElement.dataset.liquidityTheme).toBe('light');
  unmount();
  expect(document.documentElement.dataset.liquidityTheme).toBeUndefined();
});

it('activates light mode on dashboard too', () => {
  const { unmount } = render(
    <MemoryRouter initialEntries={['/dashboard?chainId=56&theme=light']}>
      <LiquidityLightPreview />
    </MemoryRouter>,
  );
  expect(document.documentElement.dataset.liquidityTheme).toBe('light');
  unmount();
});

it('retains the selected theme when navigating without a theme query', () => {
  useDemoTheme.getState().setTheme('light');
  const { unmount } = render(
    <MemoryRouter initialEntries={['/?chainId=56']}>
      <LiquidityLightPreview />
    </MemoryRouter>,
  );
  expect(document.documentElement.dataset.liquidityTheme).toBe('light');
  expect(localStorage.getItem('venus-demo-theme')).toBe('light');
  unmount();
});
