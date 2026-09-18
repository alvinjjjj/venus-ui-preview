import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router';
import { create } from 'zustand';

export const useDemoTheme = create<{ theme: string; setTheme: (theme: string) => void }>(set => ({
  theme: localStorage.getItem('venus-demo-theme') === 'light' ? 'light' : 'dark',
  setTheme: theme => {
    localStorage.setItem('venus-demo-theme', theme);
    set({ theme });
  },
}));

export const useLiquidityLightPreview = () => {
  const { search } = useLocation();
  const { theme, setTheme } = useDemoTheme();
  const requestedTheme = new URLSearchParams(search).get('theme');
  const validOverride = requestedTheme === 'light' || requestedTheme === 'dark';
  useLayoutEffect(() => {
    if (validOverride) setTheme(requestedTheme);
  }, [requestedTheme, validOverride, setTheme]);
  return (validOverride ? requestedTheme : theme) === 'light';
};
