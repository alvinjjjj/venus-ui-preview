import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from 'clients/api/queryClient';
import { DemoActionNotice } from 'demo/DemoActionNotice';
import { DemoLogin } from 'demo/DemoLogin';
import { LiquidityLightPreview } from 'demo/LiquidityLightPreview';
import { AnalyticProvider } from 'libs/analytics';
import { ErrorBoundary } from 'libs/errors';
import { Web3Wrapper } from 'libs/wallet';
import { HashRouter } from 'react-router';
import { MuiThemeProvider } from './MuiThemeProvider';
import AppRoutes from './Routes';
const App = () => (
  <HashRouter>
    <MuiThemeProvider>
      <LiquidityLightPreview />
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <Web3Wrapper>
            <AnalyticProvider>
              <AppRoutes />
              <DemoLogin />
              <DemoActionNotice />
            </AnalyticProvider>
          </Web3Wrapper>
        </ErrorBoundary>
      </QueryClientProvider>
    </MuiThemeProvider>
  </HashRouter>
);
export default App;
