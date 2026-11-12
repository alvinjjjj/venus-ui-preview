import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';

const children: Record<string, string[]> = {
  earnAsset: ['earnSource'],
  borrowAsset: ['borrowSource', 'borrowCollateral'],
  borrowSource: ['borrowCollateral'],
};

/** URL-backed steps allow browser Back/Forward to replay the same Lite screen. */
export function useLiteFlow(key: string): [string | undefined, (value?: string) => void] {
  const location = useLocation();
  const navigate = useNavigate();
  const value = new URLSearchParams(location.search).get(key) ?? undefined;
  const setValue = useCallback(
    (nextValue?: string) => {
      const params = new URLSearchParams(location.search);
      for (const child of children[key] ?? []) params.delete(child);
      if (key === 'earnAsset' && nextValue && params.get('tab') === 'borrow')
        params.set('tab', 'markets');
      if (nextValue === undefined) params.delete(key);
      else params.set(key, nextValue);
      const target = `${location.pathname}?${params.toString()}`;
      const current = `${location.pathname}${location.search}`;
      if (target === current) return;
      if (nextValue === undefined && location.state?.liteFlowParent === target) {
        navigate(-1);
      } else {
        navigate(target, {
          replace: nextValue === undefined,
          state: { ...location.state, liteFlowParent: current },
        });
      }
    },
    [key, location, navigate],
  );
  return [value, setValue];
}
