import { demoAddresses, useDemo } from 'demo/state';
export const useAccountAddress = () => {
  const { loggedIn, profile } = useDemo();
  return { accountAddress: loggedIn ? demoAddresses[profile] : undefined };
};
