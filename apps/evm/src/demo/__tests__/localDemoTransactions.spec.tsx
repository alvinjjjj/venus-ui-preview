import { act } from '@testing-library/react';
import { useRealSendTransaction } from 'hooks/useSendTransaction/useRealSendTransaction';
import { sendTransaction } from 'hooks/useSendTransaction/sendTransaction';
import { renderHook } from 'testUtils/render';
import { demoAddresses } from '../state';

vi.mock('hooks/useSendTransaction/sendTransaction');
vi.mock('hooks/useSendTransaction/useTrackTransaction');
vi.mock('wagmi', async () => ({
  ...(await vi.importActual('wagmi')),
  useWalletClient: vi.fn(() => ({ data: undefined })),
}));

it.each(Object.values(demoAddresses))(
  'never prepares or sends a real transaction for demo account %s',
  async accountAddress => {
    const fn = vi.fn(() => {
      throw new Error('Must not prepare a real transaction');
    });
    const onSigned = vi.fn();
    const onConfirmed = vi.fn();
    const listener = vi.fn();
    window.addEventListener('venus-demo-action', listener);
    const { result, unmount } = renderHook(
      () => useRealSendTransaction({ fn, onSigned, onConfirmed }),
      { accountAddress },
    );

    try {
      await act(async () => {
        await result.current.mutateAsync({});
      });
      expect(fn).not.toHaveBeenCalled();
      expect(sendTransaction).not.toHaveBeenCalled();
      expect(onSigned).not.toHaveBeenCalled();
      expect(onConfirmed).not.toHaveBeenCalled();
      expect(listener).toHaveBeenCalledOnce();
    } finally {
      unmount();
      window.removeEventListener('venus-demo-action', listener);
    }
  },
);
