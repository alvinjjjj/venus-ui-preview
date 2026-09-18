import { create } from 'zustand';
export type DemoProfile = 'normal' | 'prime';
export const demoAddresses = {
  normal: '0x000000000000000000000000000000000000dEaD',
  prime: '0x0000000000000000000000000000000000000001',
} as const;
export const useDemo = create<{
  loggedIn: boolean;
  profile: DemoProfile;
  loginOpen: boolean;
  setLoginOpen: (open: boolean) => void;
  login: (profile?: DemoProfile) => void;
  logout: () => void;
}>(set => ({
  loggedIn: ['active', 'normal', 'prime'].includes(
    sessionStorage.getItem('venus-demo-session') ?? '',
  ),
  profile: sessionStorage.getItem('venus-demo-session') === 'prime' ? 'prime' : 'normal',
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
