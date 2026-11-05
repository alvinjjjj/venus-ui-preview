import { create } from 'zustand';
export type DemoProfile = 'normal' | 'prime' | 'empty';
export const demoAddresses = {
  normal: '0x000000000000000000000000000000000000dEaD',
  prime: '0x0000000000000000000000000000000000000001',
  empty: '0x0000000000000000000000000000000000000002',
} as const;
export const isDemoAddress = (accountAddress?: string) =>
  !!accountAddress &&
  Object.values(demoAddresses).some(
    demoAddress => demoAddress.toLowerCase() === accountAddress.toLowerCase(),
  );

export const isEmptyDemoAddress = (address?: string) =>
  address?.toLowerCase() === demoAddresses.empty.toLowerCase();
export const isFundedDemoAddress = (address?: string) =>
  isDemoAddress(address) && !isEmptyDemoAddress(address);

export const useDemo = create<{
  loggedIn: boolean;
  profile: DemoProfile;
  loginOpen: boolean;
  setLoginOpen: (open: boolean) => void;
  login: (profile?: DemoProfile) => void;
  logout: () => void;
}>(set => ({
  loggedIn: ['active', 'normal', 'prime', 'empty'].includes(
    sessionStorage.getItem('venus-demo-session') ?? '',
  ),
  profile:
    sessionStorage.getItem('venus-demo-session') === 'empty'
      ? 'empty'
      : sessionStorage.getItem('venus-demo-session') === 'prime'
        ? 'prime'
        : 'normal',
  loginOpen: false,
  setLoginOpen: loginOpen => set({ loginOpen }),
  login: (profile = 'normal') => {
    sessionStorage.setItem('venus-demo-session', profile);
    set({ loggedIn: true, profile, loginOpen: false });
  },
  logout: () => {
    sessionStorage.removeItem('venus-demo-session');
    set({ loggedIn: false, profile: 'normal', loginOpen: false });
  },
}));
