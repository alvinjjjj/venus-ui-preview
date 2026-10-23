import { liquidityHubs } from '__mocks__/models/liquidityHubs';
import { demoAddresses } from '../state';
import { withDemoLiquidityHubBalance } from '../withDemoLiquidityHubBalance';

const usdtHub = liquidityHubs.find(hub => hub.vhToken.underlyingToken.symbol === 'USDT')!;

it.each(Object.values(demoAddresses))(
  'gives demo account %s 2,000 USDT without changing the snapshot',
  address => {
    const originalBalance = usdtHub.userWalletBalanceTokens?.toFixed();
    const result = withDemoLiquidityHubBalance(usdtHub, address);
    expect(result.userWalletBalanceTokens?.toFixed()).toBe('2000');
    expect(result.userWalletBalanceCents?.toFixed()).toBe('200000');
    expect(result.userSupplyCapTokens?.toFixed()).toBe('2000');
    expect(result.userSupplyBalanceTokens).toBe(usdtHub.userSupplyBalanceTokens);
    expect(usdtHub.userWalletBalanceTokens?.toFixed()).toBe(originalBalance);
  },
);

it('does not override real or disconnected accounts', () => {
  expect(withDemoLiquidityHubBalance(usdtHub)).toBe(usdtHub);
  expect(withDemoLiquidityHubBalance(usdtHub, '0x1234567890123456789012345678901234567890')).toBe(
    usdtHub,
  );
});

it('does not change other assets', () => {
  expect(withDemoLiquidityHubBalance(liquidityHubs[0], demoAddresses.normal)).toBe(
    liquidityHubs[0],
  );
});
