import { cn } from '@venusprotocol/ui';
import { useLocation, useNavigate } from 'react-router';
import { useGlassPreview } from '../GlassVersions/store';
import { useDemoTheme, useLiquidityLightPreview } from '../useLiquidityLightPreview';
import lightIcon from './dark.svg';
import darkIcon from './light.svg';

export const ThemeSetting = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLight = useLiquidityLightPreview();
  const saveTheme = useDemoTheme(state => state.setTheme);
  // New and E: same glass segmented buttons as 30D / 6M / 1Y. O keeps the flat switch.
  const glass = useGlassPreview(state => state.mode !== 'v1');
  const setTheme = (theme: 'light' | 'dark') => {
    const params = new URLSearchParams(location.search);
    params.delete('theme');
    saveTheme(theme);
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  };
  return (
    <div className="flex items-center justify-between">
      <span className="text-light-grey">Theme</span>
      <div
        className={cn(
          'flex h-10 rounded-lg',
          glass ? 'gap-1' : 'border border-dark-blue-hover bg-dark-blue',
        )}
        role="group"
        aria-label="Theme"
      >
        {(['dark', 'light'] as const).map(theme => (
          <button
            key={theme}
            type="button"
            aria-label={`${theme === 'light' ? 'Light' : 'Dark'} mode`}
            aria-pressed={isLight === (theme === 'light')}
            onClick={() => setTheme(theme)}
            {...(glass
              ? {
                  'data-venus-button-material': 'glass',
                  'data-venus-button-variant': 'secondary',
                  'data-venus-button-size': 'md',
                  ...(isLight === (theme === 'light') ? { 'data-venus-button-active': 'true' } : {}),
                }
              : {})}
            className={cn(
              'flex items-center justify-center rounded-lg px-3 py-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue',
              glass
                ? 'relative border'
                : isLight === (theme === 'light')
                  ? 'bg-blue'
                  : 'hover:bg-dark-blue-hover',
            )}
          >
            <img
              src={theme === 'light' ? lightIcon : darkIcon}
              alt=""
              className={cn('size-5', isLight && theme === 'dark' && 'brightness-0 opacity-70')}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
