import { screen } from '@testing-library/react';
import { useAccountAddress } from 'libs/wallet';
import { Route, useLocation } from 'react-router';
import { renderComponent } from 'testUtils/render';
import type { Mock } from 'vitest';
import { Dashboard } from '..';

const Landing = () => {
  const location = useLocation();
  return (
    <p>
      Landing {location.pathname}
      {location.search}
    </p>
  );
};

it.each(['lite', 'pro'])(
  'redirects a disconnected %s dashboard, preserving mode and chain only',
  async mode => {
    (useAccountAddress as Mock).mockReturnValue({ accountAddress: undefined });
    renderComponent(<Dashboard />, {
      routerInitialEntries: [`/dashboard?interface=${mode}&chainId=56&page=3&txType=borrow`],
      routePath: '/dashboard',
      otherRoutes: <Route path="/" element={<Landing />} />,
    });
    expect(await screen.findByText(`Landing /?interface=${mode}&chainId=56`)).toBeTruthy();
    expect(screen.queryByText('Connect wallet to view performance')).toBeNull();
  },
);
