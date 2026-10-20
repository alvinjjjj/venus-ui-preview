import { Suspense } from 'react';

import { Spinner } from 'components';
import { useInterfaceMode } from 'demo/useInterfaceMode';

export interface PageSuspenseProps {
  children: React.ReactNode;
}

const PageSuspense: React.FC<PageSuspenseProps> = ({ children }) => {
  const { supportsModes } = useInterfaceMode();
  return (
    <Suspense
      fallback={
        supportsModes ? (
          <div
            className="min-h-[calc(100dvh-var(--spacing)*20)] flex items-center justify-center bg-background-active"
            role="status"
            aria-label="Loading page"
          >
            <Spinner />
          </div>
        ) : (
          <Spinner />
        )
      }
    >
      {children}
    </Suspense>
  );
};

export default PageSuspense;
