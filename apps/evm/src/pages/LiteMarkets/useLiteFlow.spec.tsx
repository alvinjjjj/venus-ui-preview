import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router';
import { expect, it } from 'vitest';
import { useLiteFlow } from './useLiteFlow';
function Flow() {
  const navigate = useNavigate();
  const [asset, setAsset] = useLiteFlow('earnAsset');
  const [source, setSource] = useLiteFlow('earnSource');
  return (
    <>
      <span>{asset ? (source ? 'Supply form' : 'Source list') : 'Assets'}</span>
      <button onClick={() => setAsset('USDT')} type="button">
        Asset
      </button>
      <button type="button" onClick={() => setSource('hub')}>
        Source
      </button>
      <button type="button" onClick={() => setSource(undefined)}>
        Close form
      </button>
      <button type="button" onClick={() => navigate(-1)}>
        Back
      </button>
      <button type="button" onClick={() => navigate(1)}>
        Forward
      </button>
    </>
  );
}
it('replays modal → sources → assets with browser Back and restores Forward', async () => {
  render(
    <MemoryRouter initialEntries={['/?chainId=56&tab=markets']}>
      <Flow />
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Asset' }));
  fireEvent.click(screen.getByRole('button', { name: 'Source' }));
  expect(screen.getByText('Supply form')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  expect(screen.getByText('Source list')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  expect(screen.getByText('Assets')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Forward' }));
  expect(screen.getByText('Source list')).toBeInTheDocument();
});
