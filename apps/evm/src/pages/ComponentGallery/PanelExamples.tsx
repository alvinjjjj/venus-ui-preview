import { useState } from 'react';
import { Card, TextField } from 'components';
import '../Markets/Tabs/Markets/panel-preview.css';

const assets = [
  { name: 'USDT', supply: '$4.25M', apy: '2.98%', liquidity: '$3.4M' },
  { name: 'USDC', supply: '$300.83K', apy: '2.62%', liquidity: '$300.83K' },
  { name: 'U', supply: '$849.97K', apy: '2.60%', liquidity: '$649.95K' },
];

export function PanelExamples() {
  const [query, setQuery] = useState('');
  const filtered = assets.filter(asset => asset.name.toLowerCase().includes(query.toLowerCase()));
  return <section className="venus-panels-preview space-y-6" aria-label="Panels">
    <div className="flex items-center gap-3"><h2 className="text-p1s">Panels</h2><span className="text-sm text-light-grey">Preview</span></div>
    <Card className="venus-v5-market-panel p-0!">
      <div className="p-4 sm:p-6 venus-table-controls">
        <TextField size="sm" className="max-w-75" placeholder="Search asset" value={query} onChange={event => setQuery(event.target.value)} leftIconSrc="magnifier" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-120 text-sm text-left">
          <caption className="sr-only">Sample assets</caption>
          <thead><tr className="border-b border-dark-blue-hover">{['Asset', 'Total supply', 'Supply APY', 'Liquidity'].map(label => <th key={label} scope="col" className="px-4 py-4 sm:px-6 font-normal text-light-grey">{label}</th>)}</tr></thead>
          <tbody>{filtered.map(asset => <tr key={asset.name}><th scope="row" className="px-4 py-6 sm:px-6 font-semibold">{asset.name}</th><td className="px-4 py-6 sm:px-6">{asset.supply}</td><td className="px-4 py-6 sm:px-6">{asset.apy}</td><td className="px-4 py-6 sm:px-6">{asset.liquidity}</td></tr>)}</tbody>
        </table>
        {!filtered.length && <p className="p-6 text-light-grey" role="status">No matching assets</p>}
      </div>
    </Card>
  </section>;
}
