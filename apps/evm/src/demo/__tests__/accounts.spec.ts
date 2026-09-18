vi.unmock('zustand');
import { getIsUserPrimeV2 } from 'clients/api/queries/getIsUserPrimeV2';
import { getPrimeToken } from 'clients/api/queries/getPrimeToken';
import type { PublicClient } from 'viem';
import { demoAddresses, useDemo } from '../state';

describe('demo accounts', () => {
  afterEach(() => useDemo.getState().logout());
  it('switches profiles, persists the selection and signs out', () => {
    useDemo.getState().login('normal');
    expect(useDemo.getState().profile).toBe('normal');
    useDemo.getState().login('prime');
    expect(useDemo.getState().loggedIn).toBe(true);
    expect(sessionStorage.getItem('venus-demo-session')).toBe('prime');
    expect(demoAddresses.normal).not.toBe(demoAddresses.prime);
    useDemo.getState().logout();
    expect(useDemo.getState().loggedIn).toBe(false);
    expect(sessionStorage.getItem('venus-demo-session')).toBeNull();
  });
  it('provides distinct Prime membership without calling the network', async () => {
    const readContract = vi.fn();
    const publicClient = { readContract } as unknown as PublicClient;
    for (const profile of ['normal', 'prime'] as const) {
      const accountAddress = demoAddresses[profile];
      expect(
        await getPrimeToken({
          accountAddress,
          publicClient,
          primeContractAddress: demoAddresses.normal,
        }),
      ).toEqual({ exists: profile === 'prime', isIrrevocable: false });
      expect(
        await getIsUserPrimeV2({
          accountAddress,
          publicClient,
          primeV2ContractAddress: demoAddresses.normal,
        }),
      ).toEqual({ isPrimeHolder: profile === 'prime' });
    }
    expect(readContract).not.toHaveBeenCalled();
  });
});
