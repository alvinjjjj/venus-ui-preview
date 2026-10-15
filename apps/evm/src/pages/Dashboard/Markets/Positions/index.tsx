import type { Pool } from 'types';

import { Summary } from './Summary';
import Tables from './Tables';
import { useStyles } from './styles';

export interface PositionsProps {
  pools: Pool[];
  className?: string;
  previewInteractions?: boolean;
}

export const Positions: React.FC<PositionsProps> = ({ pools, className, previewInteractions }) => {
  const styles = useStyles();
  const selectedPool = pools.find(pool => pool.name === 'Core Pool') || pools[0];

  const hasBorrowBalance = selectedPool?.userBorrowBalanceCents?.isGreaterThan(0);

  return (
    <div className={className}>
      <Summary
        pool={selectedPool}
        displayHealthFactor={hasBorrowBalance}
        displayAccountHealth={hasBorrowBalance}
        css={styles.summary}
      />

      <Tables pool={selectedPool} previewInteractions={previewInteractions} />
    </div>
  );
};
