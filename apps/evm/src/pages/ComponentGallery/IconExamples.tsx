import { RewardStars } from 'components/Apy/BoostTooltip/RewardStars';
import { Icon, Select, TextField } from 'components';
import HubIcon from 'assets/img/liquidityHubIcon.svg?react';
import VaultIcon from 'assets/img/vaultsIcon.svg?react';
import 'containers/Layout/NavBar/MenuItem/SubMenuContent/SubMenuItem/governance-motion.css';
import { useState } from 'react';
import allIcons from './figma-icons/manifest.json';
import './icons.css';

const icons = allIcons.filter(icon => icon.group !== 'vTokens');
const groups = [...new Set(icons.map(icon => icon.group))];
const animatedIcons = [
  { name: 'APY reward', group: 'Rewards', motion: 'apy', icon: null },
  { name: 'Governance', group: 'Navigation', motion: 'governance', icon: 'market' },
  { name: 'VAI', group: 'Navigation', motion: 'vai', icon: 'vaiOutline' },
  { name: 'Bridge', group: 'Navigation', motion: 'bridge', icon: 'bridge' },
  { name: 'Stats', group: 'Navigation', motion: 'stats', icon: 'stats' },
  { name: 'Trade', group: 'Navigation', motion: 'trade', icon: 'trade' },
  { name: 'Liquidity Hub', group: 'Navigation', motion: 'hub', icon: null },
  { name: 'Vaults', group: 'Navigation', motion: 'vault', icon: null },
] as const;
const sources = import.meta.glob('./figma-icons/*.svg', { query: '?url', import: 'default', eager: true }) as Record<string, string>;

export function IconExamples() {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');
  const [mode, setMode] = useState('All');
  const filtered = icons.filter(icon => mode !== 'Animated' && (group === 'all' || icon.group === group) &&
    `${icon.name} ${icon.group} ${icon.width}px ${icon.id}`.toLowerCase().includes(query.toLowerCase()));
  const animated = animatedIcons.filter(icon => mode !== 'Static' && (group === 'all' || icon.group === group) &&
    `${icon.name} ${icon.group}`.toLowerCase().includes(query.toLowerCase()));
  const availableGroups = [...new Set([
    ...(mode !== 'Animated' ? groups : []),
    ...(mode !== 'Static' ? animatedIcons.map(icon => icon.group) : []),
  ])];
  return (
    <div className="space-y-8">
    <div className="flex flex-wrap gap-4 items-center">
      <TextField aria-label="Search icons" placeholder="Search icons" size="sm" leftIconSrc="magnifier" value={query} onChange={event => setQuery(event.target.value)} className="max-w-75" />
      <Select
        className="w-75 max-w-full"
        size="medium"
        value={group}
        onChange={value => setGroup(String(value))}
        menuTitle="Icon category"
        dropdownClassName="max-h-80 overflow-y-auto"
        options={[{ value: 'all', label: 'All Categories' }, ...availableGroups.map(name => ({ value: name, label: name }))]}
      />
      <span className="text-sm text-grey" role="status">{filtered.length + animated.length} / {mode === 'Animated' ? animatedIcons.length : mode === 'Static' ? icons.length : icons.length + animatedIcons.length}</span>
    </div>
    <div className="icon-library-modes" role="group" aria-label="Icon motion">
      {['All', 'Static', 'Animated'].map(value => (
        <button key={value} type="button" aria-pressed={mode === value} onClick={() => { setMode(value); setGroup('all'); }}>{value}</button>
      ))}
    </div>
    {animated.length > 0 && <section className="space-y-4" aria-label="Animated icons">
      <h3 className="text-p2s">Animated</h3>
      <div className="icon-library-grid">
        {animated.map(item => <figure className="icon-library-item" key={item.motion}>
          <button type="button" aria-label={`${item.name} animation preview`}
            className="icon-library-stage icon-motion-preview venus-apy-boost"
            data-governance-preview={item.motion === 'governance' || undefined}
            data-menu-motion={['vai', 'bridge', 'stats', 'trade'].includes(item.motion) ? item.motion : undefined}
            data-earn-motion={item.motion === 'hub' || item.motion === 'vault' ? item.motion : undefined}>
            {item.motion === 'apy' ? <RewardStars /> : <span className="venus-submenu-icon">
              {item.icon ? <Icon name={item.icon} className="size-6" /> : item.motion === 'hub' ?
                <HubIcon className="size-12 venus-earn-icon" aria-hidden="true" /> :
                <VaultIcon className="size-12 venus-earn-icon" aria-hidden="true" />}
            </span>}
          </button>
          <figcaption className="text-xs">{item.name}<span className="block text-grey">Animated</span></figcaption>
        </figure>)}
      </div>
    </section>}
    {groups.filter(name => filtered.some(icon => icon.group === name)).map(name => (
      <section key={name} className="space-y-4" aria-label={name}>
        <h3 className="text-p2s">{name}</h3>
        <div className="icon-library-grid">
          {filtered.filter(icon => icon.group === name).map(icon => (
            <figure className="icon-library-item" key={icon.id}>
              <div className="icon-library-stage">
                {icon.filename ? <img src={sources[`./figma-icons/${icon.filename}`]} alt={icon.name} loading="lazy"
                  style={{ width: icon.width, height: icon.height }} /> : <span className="text-xs text-grey">No visible artwork</span>}
              </div>
              <figcaption className="text-xs">
                <a href={`https://www.figma.com/design/ffh5VFqviRERdBN5rhJkgv/Venus-UI-Kits_new?node-id=${icon.id.replace(':', '-')}`} target="_blank" rel="noreferrer">{icon.name}</a>
                <span className="block text-grey">{Math.round(icon.width)} × {Math.round(icon.height)}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    ))}
    {!filtered.length && !animated.length && <p role="status" className="text-grey">No matching icons</p>}
    </div>
  );
}
