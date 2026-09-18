import { cn } from '@venusprotocol/ui';
import { useLocation, useNavigate } from 'react-router';
import { useDemoTheme, useLiquidityLightPreview } from '../useLiquidityLightPreview';
import lightIcon from './dark.svg';
import darkIcon from './light.svg';

export const ThemeSetting = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLight = useLiquidityLightPreview();
  const saveTheme = useDemoTheme(state => state.setTheme);
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
        className="flex h-10 rounded-lg border border-dark-blue-hover bg-dark-blue"
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
            className={cn(
              'flex items-center justify-center rounded-lg px-3 py-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue',
              isLight === (theme === 'light') ? 'bg-blue' : 'hover:bg-dark-blue-hover',
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
