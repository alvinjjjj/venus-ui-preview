import { useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { Button, Card, TextField, Toggle, InfoIcon } from 'components';
import '../LiquidityHubs/materials.css';
import './gallery.css';
import './button-texture.css';
import { categories, figmaNodes } from './categories';
import { LibraryExamples } from './LibraryExamples';
import { ButtonMotionStudy } from './ButtonMotionStudy';
import { LiquidGlassStudy } from './LiquidGlassStudy';
import { PanelExamples } from './PanelExamples';
import { BadgeExamples } from './BadgeExamples';
import { IconExamples } from './IconExamples';

export default function ComponentGallery() {
  const [enabled, setEnabled] = useState(true);
  const [query, setQuery] = useState('');
  const location = useLocation();
  const tab = location.pathname.split('/')[2] || 'buttons';
  return (
    <div className="component-gallery space-y-10 pb-10">
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-h6">Component</h1>
        </div>
      </header>
      <nav
        className="flex flex-wrap gap-6 border-b border-dark-blue-hover pb-4"
        aria-label="Component categories"
      >
        {categories.map(category => (
          <NavLink
            key={category === 'header-vip' ? 'Header & VIP' : category}
            className="text-light-grey capitalize"
            to={{ pathname: `/component/${category}`, search: location.search }}
          >
            {category === 'header-vip' ? 'Header & VIP' : category}
          </NavLink>
        ))}
      </nav>
      {figmaNodes[tab] && (
        <section className="space-y-6" aria-label={tab}>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="text-p1s capitalize">{tab === 'header-vip' ? 'Header & VIP' : tab}</h2>
            <a
              className="text-blue text-b1r"
              href={`https://www.figma.com/design/ffh5VFqviRERdBN5rhJkgv/Venus-UI-Kits_new?node-id=${figmaNodes[tab]}`}
              target="_blank"
              rel="noreferrer"
            >
              Figma reference ↗
            </a>
          </div>
          {tab === 'badges' ? <BadgeExamples /> : tab === 'icons' ? <IconExamples /> : <LibraryExamples key={tab} category={tab} />}
        </section>
      )}
      {tab === 'buttons' && (
        <div className="space-y-10">
          <ButtonMotionStudy />
          <LiquidGlassStudy />
          {(
            [
              {
                variant: 'primary',
                title: '01 / Primary',
                description: 'Primary actions · Button layer 1',
              },
              {
                variant: 'secondary',
                title: '02 / Secondary',
                description: 'Secondary actions · Button layer 2',
              },
              {
                variant: 'text',
                title: '03 / Text',
                description: 'Low-emphasis actions · Text links',
              },
            ] as const
          ).map(family => (
            <section
              key={family.variant}
              className="button-texture-family space-y-4"
              data-button-family={family.variant}
              aria-label={family.title}
            >
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                <h2 className="text-p1s">{family.title}</h2>
                <p className="text-b1r text-light-grey">{family.description}</p>
              </div>
              <div className="component-matrix-wrap">
                <table className="component-matrix">
                  <caption className="sr-only">{family.title} sizes and states</caption>
                  <thead>
                    <tr>
                      <th scope="col">Size</th>
                      <th scope="col">Default / Hover</th>
                      <th scope="col">Active</th>
                      <th scope="col">Disabled</th>
                      <th scope="col">Loading</th>
                      <th scope="col" className="highlight-column">
                        Highlight
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      [
                        { size: 'md', label: 'Middle' },
                        { size: 'sm', label: 'Small' },
                        { size: 'xs', label: 'XS' },
                      ] as const
                    ).map(row => (
                      <tr key={row.size}>
                        <th scope="row">{row.label}</th>
                        <td>
                          <Button
                            material={family.variant === 'primary' ? 'blue-glass' : 'glass'}
                            variant={family.variant}
                            size={row.size}
                          >
                            Button
                          </Button>
                        </td>
                        <td>
                          <Button
                            material={family.variant === 'primary' ? 'blue-glass' : 'glass'}
                            variant={family.variant}
                            size={row.size}
                            active
                          >
                            Button
                          </Button>
                        </td>
                        <td>
                          <Button
                            material={family.variant === 'primary' ? 'blue-glass' : 'glass'}
                            variant={family.variant}
                            size={row.size}
                            disabled
                          >
                            Button
                          </Button>
                        </td>
                        <td>
                          <Button
                            material={family.variant === 'primary' ? 'blue-glass' : 'glass'}
                            variant={family.variant}
                            size={row.size}
                            loading
                          >
                            Button
                          </Button>
                        </td>
                        <td className="highlight-column">
                          <Button
                            material={family.variant === 'primary' ? 'blue-glass' : 'glass'}
                            variant={family.variant}
                            size={row.size}
                            className="button-highlight"
                          >
                            Button
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
      {tab === 'panels' && <PanelExamples />}
      {tab === 'inputs' && (
        <section className="space-y-6" aria-label="Inputs">
          <h2 className="text-p1s">Inputs</h2>
          <p className="text-light-grey">
            Compare states. Select a field to test focus and text input.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="space-y-6 p-6">
              <h3 className="text-p2s">Default / Focus</h3>
              <TextField
                label="Search asset"
                placeholder="Search USDT, USDC…"
                leftIconSrc="magnifier"
                value={query}
                onChange={event => setQuery(event.target.value)}
              />
              <TextField
                label="Supply amount"
                placeholder="0.00"
                description="Available balance: 1,500 USDT"
              />
            </Card>
            <Card className="space-y-6 p-6">
              <h3 className="text-p2s">Error / Disabled / Read-only</h3>
              <TextField
                label="Error state"
                defaultValue="2,000"
                hasError
                description="Amount exceeds your available balance."
              />
              <TextField label="Disabled" placeholder="Unavailable" disabled />
              <TextField label="Read-only" value="1,500 USDT" readOnly />
            </Card>
          </div>
          <Card className="grid gap-6 p-6 md:grid-cols-3">
            {(['md', 'sm', 'xs'] as const).map(size => (
              <TextField
                key={size}
                size={size}
                label={`Size / ${size.toUpperCase()}`}
                placeholder="Enter value"
              />
            ))}
          </Card>
        </section>
      )}
      {tab === 'toggles' && (
        <section className="space-y-6" aria-label="Toggles">
          <h2 className="text-p1s">Toggles</h2>
          <Card className="flex flex-wrap gap-10 p-6">
            <Toggle
              label="Interactive"
              value={enabled}
              onChange={(_, checked) => setEnabled(checked)}
            />
            <Toggle label="Disabled / Off" value={false} disabled />
            <Toggle label="Disabled / On" value disabled />
          </Card>
        </section>
      )}
      {tab === 'cards' && (
        <section className="space-y-6" aria-label="Cards">
          <h2 className="text-p1s">Cards</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="space-y-4 p-6">
              <div className="flex items-center gap-2 text-light-grey">
                Total supply <InfoIcon tooltip="Sample data for comparing component designs." />
              </div>
              <p className="text-h6">$5.4M</p>
              <div className="flex justify-between border-t border-dark-blue-hover pt-4">
                <span className="text-light-grey">Supply APY</span>
                <span className="text-green">2.98%</span>
              </div>
            </Card>
            <Card className="space-y-4 p-6">
              <h3 className="text-p2s">Empty state</h3>
              <p className="text-light-grey">No supplied assets yet.</p>
              <Button>Supply</Button>
            </Card>
          </div>
        </section>
      )}
      {tab === 'notes' && (
        <section className="space-y-6 max-w-2xl" aria-label="Notes">
          <h2 className="text-p1s">Notes</h2>
          <Card className="space-y-6 p-6">
            <p className="text-b1r text-light-grey">A NOTE FROM VENUS</p>
            <h3 className="text-p1s">Clarity at every step.</h3>
            <p className="text-light-grey">
              Compare transparency, edges and spacing. All actions here are demonstrations; no
              transactions are submitted.
            </p>
            <Button variant="text">Got it</Button>
          </Card>
        </section>
      )}
    </div>
  );
}
