import { Button, Modal } from 'components';
import { useEffect, useState } from 'react';
export const DemoActionNotice = () => {
  const [message, setMessage] = useState('');
  useEffect(() => {
    const listener = (event: Event) => setMessage((event as CustomEvent<string>).detail);
    window.addEventListener('venus-demo-action', listener);
    return () => window.removeEventListener('venus-demo-action', listener);
  }, []);
  return (
    <Modal isOpen={!!message} handleClose={() => setMessage('')} title="Demo preview">
      <div className="space-y-5">
        <p>{message}</p>
        <Button onClick={() => setMessage('')}>Done</Button>
      </div>
    </Modal>
  );
};
