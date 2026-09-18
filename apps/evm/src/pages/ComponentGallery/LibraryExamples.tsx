import { chains as chainMetadata } from '@venusprotocol/chains';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import {
  Button,
  Card,
  Select,
  Tabs,
  Pagination,
  Notice,
  Tooltip,
  AreaChart,
  ProgressBar,
} from 'components';
import { DropdownStates } from './DropdownStates';
import { Footer } from 'containers/Layout/Footer';
import { UserButton } from 'containers/Layout/NavBar/ConnectButton/UserButton';

const assets = ['USDT', 'USDC', 'BNB'].map(value => ({ value, label: value }));
const series = [2.1, 2.4, 2.2, 2.8, 2.6, 3.1, 2.98].map((apy, index) => ({
  day: `Sep ${index + 1}`,
  apy,
}));
export function LibraryExamples({ category }: { category: string }) {
  const [previewChain, setPreviewChain] = useState<string | number>(56);
  const [asset, setAsset] = useState<string | number>('USDT');
  const [params, setParams] = useSearchParams();
  const page = Math.max(0, Math.min(12, (Number(params.get('componentPage')) || 1) - 1));
  const setPage = (index: number) =>
    setParams(current => {
      const next = new URLSearchParams(current);
      next.set('componentPage', String(index + 1));
      return next;
    });
  const [account, setAccount] = useState<string | number>('Disconnected');
  const [dismissed, setDismissed] = useState(false);
  if (category === 'dropdown')
    return (
      <div className="grid gap-6 md:grid-cols-3">
        <DropdownStates />
        <Card className="space-y-6 p-6 md:col-span-3">
          <h3 className="text-p2s">Chain dropdown / Interactive study</h3>
          <p className="text-light-grey text-b1r">
            Open the menu and hover over options. A checkmark indicates the selection. This preview
            does not change the site network.
          </p>
          <div className="max-w-80">
            <Select
              label="Preview chain"
              menuTitle="Select chain"
              value={previewChain}
              onChange={setPreviewChain}
              options={[56, 1, 42161].map(id => ({
                value: id,
                label: (
                  <span className="flex items-center gap-3">
                    <img
                      src={chainMetadata[id as keyof typeof chainMetadata].iconSrc}
                      alt=""
                      className="size-6"
                    />
                    {chainMetadata[id as keyof typeof chainMetadata].name}
                  </span>
                ),
              }))}
            />
          </div>
          <p className="text-light-grey text-b1r" role="status">
            Selected: {chainMetadata[previewChain as keyof typeof chainMetadata].name}
          </p>
        </Card>
        {(['small', 'medium', 'large'] as const).map(size => (
          <Card key={size} className="space-y-6 p-6">
            <h3 className="text-p2s capitalize">{size}</h3>
            <Select label="Asset" options={assets} value={asset} onChange={setAsset} size={size} />
            <Select
              label="Disabled"
              options={assets}
              value="USDT"
              onChange={() => {}}
              size={size}
              disabled
            />
            <p className="text-light-grey text-b1r">Selected: {asset}</p>
          </Card>
        ))}
      </div>
    );
  if (category === 'chart')
    return (
      <div className="space-y-6">
        <Card className="space-y-6 p-6">
          <h3 className="text-p2s">Borrow limit</h3>
          {[0, 30, 80, 95].map(value => (
            <div key={value} className="space-y-3">
              <p className="text-light-grey">{value}% used</p>
              <ProgressBar
                min={0}
                max={100}
                progressBars={[{ value, className: value >= 80 ? 'bg-red' : 'bg-green' }]}
                marks={[{ value: 80 }]}
              />
            </div>
          ))}
        </Card>
        <Card className="space-y-6 p-6">
          <h3 className="text-p2s">Supply APY · Demo data</h3>
          <AreaChart
            data={series}
            xAxisDataKey="day"
            yAxisDataKey="apy"
            chartColor="var(--color-blue)"
            formatXAxisValue={String}
            formatYAxisValue={v => `${v}%`}
            formatTooltipItems={v => [{ label: v.day, value: `${v.apy}%` }]}
          />
        </Card>
      </div>
    );
  if (category === 'tooltips')
    return (
      <Card className="space-y-6 p-6">
        <p className="text-light-grey">Hover or focus to view tooltips. Tap to open on mobile.</p>
        <div className="flex flex-wrap gap-6">
          {['Supply APY', 'Borrow limit', 'Prime rewards'].map(label => (
            <Tooltip
              key={label}
              content={
                <div className="max-w-64 space-y-2">
                  <p className="font-semibold">{label}</p>
                  <p className="text-b1r">Sample tooltip: data updates with market conditions.</p>
                </div>
              }
            >
              <Button variant="secondary">{label}</Button>
            </Tooltip>
          ))}
        </div>
      </Card>
    );
  if (category === 'notice')
    return (
      <div className="space-y-6">
        {(['info', 'warning', 'success', 'error', 'loading'] as const).map(variant => (
          <section key={variant} className="space-y-3">
            <h3 className="text-p2s capitalize">{variant}</h3>
            <Notice
              variant={variant}
              title={`${variant.charAt(0).toUpperCase() + variant.slice(1)} notice`}
              description="Explain the current status, risks or next steps."
            />
            <Notice variant={variant} size="sm" description="Compact notice · Without title" />
          </section>
        ))}
        {!dismissed ? (
          <Notice
            title="Action notice"
            description={
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span>You can dismiss this sample notification.</span>
                <Button size="xs" variant="secondary" onClick={() => setDismissed(true)}>
                  Dismiss
                </Button>
              </div>
            }
          />
        ) : (
          <Button variant="text" onClick={() => setDismissed(false)}>
            Reset notice
          </Button>
        )}
      </div>
    );
  if (category === 'tabs')
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {(['primary', 'secondary', 'tertiary'] as const).map(variant => (
          <Card key={variant} className="space-y-6 p-6">
            <h3 className="text-p2s capitalize">{variant}</h3>
            <Tabs
              variant={variant}
              tabs={['Supply', 'Borrow', 'History'].map(title => ({
                id: title,
                title,
                content: <p className="text-light-grey">{title} · Selected panel</p>,
              }))}
            />
          </Card>
        ))}
      </div>
    );
  if (category === 'pagination')
    return (
      <Card className="space-y-6 p-6">
        <h3 className="text-p2s">125 items · 10 per page</h3>
        <p className="text-light-grey">
          Use the arrows or enter a page number to test first, next and last page navigation.
        </p>
        <div className="divide-y divide-dark-blue-hover">
          {Array.from({ length: Math.min(10, 125 - page * 10) }, (_, i) => (
            <div key={i} className="flex justify-between py-4">
              <span>Demo asset {page * 10 + i + 1}</span>
              <span className="text-light-grey">USDT</span>
            </div>
          ))}
        </div>
        <Pagination
          itemsCount={125}
          itemsPerPageCount={10}
          paramKey="componentPage"
          onChange={setPage}
        />
      </Card>
    );
  if (category === 'footer')
    return (
      <div className="space-y-6">
        <p className="text-light-grey">
          The site footer includes links, social channels and the O / V3 / V4 style switcher.
        </p>
        <div className="overflow-hidden rounded-lg border border-dark-blue-hover">
          <Footer />
        </div>
      </div>
    );
  return (
    <div className="space-y-6">
      <p className="text-light-grey">
        Preview header account states. Use the page header for navigation and settings; these
        controls only affect the preview.
      </p>
      <Card className="space-y-6 p-6">
        <Select
          label="Preview account state"
          options={['Disconnected', 'Normal account', 'Prime account'].map(value => ({
            value,
            label: value,
          }))}
          value={account}
          onChange={setAccount}
        />
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-lg border border-dark-blue-hover p-6">
          <span className="text-p1s font-semibold">VENUS</span>
          <div className="flex flex-wrap gap-4">
            {['Earn', 'Borrow', 'Prime'].map(label => (
              <Button
                key={label}
                variant="text"
                onClick={() => setAccount(label === 'Prime' ? 'Prime account' : account)}
              >
                {label}
              </Button>
            ))}
          </div>
          {account === 'Prime account' ? (
            <UserButton
              address="0x0000000000000000000000000000000000000001"
              isPrime
              isVip={false}
              onClick={() => setAccount('Disconnected')}
            />
          ) : <Button
            variant="secondary"
            onClick={() =>
              setAccount(account === 'Disconnected' ? 'Normal account' : 'Disconnected')
            }
          >
            {account === 'Disconnected' ? 'Demo login' : account}
          </Button>}
        </div>
        <Notice
          title={
            account === 'Prime account'
              ? 'Prime member'
              : account === 'Normal account'
                ? 'Connected'
                : 'Not connected'
          }
          description={
            account === 'Prime account'
              ? 'Prime rewards are available · Demo state'
              : 'Select an account state above to compare the header.'
          }
        />
      </Card>
    </div>
  );
}
