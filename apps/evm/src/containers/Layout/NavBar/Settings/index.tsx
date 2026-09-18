import { ThemeSetting } from 'demo/ThemeSetting';
import { featureFlags } from 'hooks/useIsFeatureEnabled';
import { chains } from 'libs/wallet/chains';
import { GaslessTransactionSetting } from './GaslessTransactionSetting';
import { LanguageSetting } from './LanguageSetting';

const gasLessTransactionsChainIds = featureFlags.gaslessTransactions.filter(chain =>
  chains.some(c => c.id === chain),
);

export const Settings: React.FC = () => (
  <div className="venus-settings space-y-6">
    <ThemeSetting />
    <LanguageSetting />

    {gasLessTransactionsChainIds.map(chainId => (
      <GaslessTransactionSetting chainId={chainId} />
    ))}
  </div>
);
