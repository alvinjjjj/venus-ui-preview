import type { ReactNode } from 'react';

/** Group the E2 totals and current market step without changing other revisions' DOM. */
export function LiteMarketStage({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  return enabled ? <div className="lite-e2-market-stage">{children}</div> : <>{children}</>;
}
