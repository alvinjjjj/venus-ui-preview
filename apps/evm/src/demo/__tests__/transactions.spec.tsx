import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { useSendTransaction as UseSendTransaction } from 'hooks/useSendTransaction';
import type { PropsWithChildren } from 'react';

const { useSendTransaction }: { useSendTransaction: typeof UseSendTransaction } =
  await vi.importActual('hooks/useSendTransaction');

it('acknowledges a demo action without preparing, signing or confirming a transaction', async () => {
  const fn = vi.fn(() => {
    throw new Error('Real transaction path must not execute');
  });
  const onSigned = vi.fn();
  const onConfirmed = vi.fn();
  const listener = vi.fn();
  window.addEventListener('venus-demo-action', listener);
  const client = new QueryClient();
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const { result, unmount } = renderHook(() => useSendTransaction({ fn, onSigned, onConfirmed }), {
    wrapper,
  });
  await act(async () => {
    await result.current.mutateAsync({});
  });
  expect(fn).not.toHaveBeenCalled();
  expect(onSigned).not.toHaveBeenCalled();
  expect(onConfirmed).not.toHaveBeenCalled();
  expect(listener).toHaveBeenCalledOnce();
  window.removeEventListener('venus-demo-action', listener);
  unmount();
  client.clear();
});
