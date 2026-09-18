import { useDemo } from 'demo/state';
export const useAuthModal = () => {
  const { loginOpen, setLoginOpen } = useDemo();
  return {
    isAuthModalOpen: loginOpen,
    openAuthModal: (_options?: { analyticVariant?: string }) => setLoginOpen(true),
  };
};
