import { Page } from 'components';
import { HorizontalFlow } from 'pages/Landing/HorizontalFlow';
import { VenusSteps } from 'pages/Landing/VenusSteps';
import { SafetyExplorer } from 'pages/Landing/SafetyExplorer';
import { CommunityExplorer } from 'pages/Landing/CommunityExplorer';
import { LandingDesignContext } from 'pages/Landing/designContext';
import { useLiquidityLightPreview } from 'demo/useLiquidityLightPreview';

export default function AboutUs() {
  const light = useLiquidityLightPreview();
  return (
    <LandingDesignContext.Provider value>
      <div className="about-us-landing">
        <Page indexWithSearchEngines={false}>
          <HorizontalFlow key={String(light)} heroKey={`about-${light}`} />
          <VenusSteps />
          <SafetyExplorer />
          <CommunityExplorer />
        </Page>
      </div>
    </LandingDesignContext.Provider>
  );
}
