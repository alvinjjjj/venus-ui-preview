import { useLayoutEffect } from 'react';
import { useLiquidityLightPreview } from '../useLiquidityLightPreview';
import './preview.css';

export const LiquidityLightPreview = () => {
  const enabled = useLiquidityLightPreview();

  useLayoutEffect(() => {
    if (enabled) {
      document.documentElement.dataset.liquidityTheme = 'light';
    }
    return () => {
      delete document.documentElement.dataset.liquidityTheme;
    };
  }, [enabled]);

  return <></>;
};
