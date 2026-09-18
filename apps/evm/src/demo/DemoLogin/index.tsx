import primeLogoSrc from 'assets/img/primeLogo.svg';
import { Button, Modal } from 'components';
import { useDemo } from '../state';
export const DemoLogin = () => {
  const { loginOpen, setLoginOpen, login } = useDemo();
  return (
    <Modal isOpen={loginOpen} handleClose={() => setLoginOpen(false)} title="Choose a demo account">
      <div className="space-y-5">
        <p className="text-light-grey">
          Explore Venus with simulated balances. No wallet or real transactions are required.
        </p>
        <div className="rounded-lg bg-background-active p-5 space-y-3">
          <h3 className="text-b1s">Normal account</h3>
          <p className="text-light-grey">Standard account with demo supply and borrow positions.</p>
          <Button className="w-full" onClick={() => login('normal')}>
            Enter Normal demo
          </Button>
        </div>
        <div className="rounded-lg bg-background-active p-5 space-y-3">
          <img src={primeLogoSrc} alt="Venus Prime" className="h-5" />
          <h3 className="text-b1s">Prime account</h3>
          <p className="text-light-grey">
            Preview Prime membership, the Prime badge and an illustrative Prime ranking.
          </p>
          <Button className="w-full" onClick={() => login('prime')}>
            Enter Prime demo
          </Button>
        </div>
        <p className="text-light-grey text-sm">
          Switch accounts anytime from the account menu. All account data is for demonstration.
        </p>
      </div>
    </Modal>
  );
};
