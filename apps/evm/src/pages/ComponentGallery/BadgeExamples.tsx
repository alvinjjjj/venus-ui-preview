import { useGetTokens } from 'libs/tokens/hooks/useGetTokens';
import { RewardBadgePreview } from 'demo/RewardBadgePreview';

export function BadgeExamples() {
  const tokens = useGetTokens({ chainId: 56 });
  const token = tokens.find(token => token.symbol === 'USDT');
  if (!token) return null;
  return (
    <div className="flex flex-wrap gap-8">
      <section className="space-y-3">
        <h3 className="text-b1s">Supply / Prime simulation</h3>
        <RewardBadgePreview token={token} type="supply" />
      </section>
      <section className="space-y-3">
        <h3 className="text-b1s">Borrow / Not eligible</h3>
        <RewardBadgePreview token={token} type="borrow" />
      </section>
    </div>
  );
}
