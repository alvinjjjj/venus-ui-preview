import { Card, Notice, Page, Tabs } from 'components';
import { VENUS_DOC_URL } from 'constants/production';
import { Link } from 'containers/Link';
import { useGlassPreview } from 'demo/GlassVersions/store';
import { useTranslation } from 'libs/translations';
import { Borrow } from './Borrow';
import { Repay } from './Repay';
import './vai.css';

const VAI_DOC_URL = `${VENUS_DOC_URL}/guides/borrowing-vai`;

const Vai: React.FC = () => {
  const { t, Trans } = useTranslation();
  // Final rule: single-level Borrow / Repay form → underline tabs.
  const isFinal = useGlassPreview(state => state.mode === 'lite-experiment-v2');

  const tabsContent = [
    { id: 'borrow', title: t('vai.borrow.tabTitle'), content: <Borrow /> },
    { id: 'repay', title: t('vai.repay.tabTitle'), content: <Repay /> },
  ];

  return (
    <Page>
      <div className="mx-auto w-full max-w-[544px]">
        <Notice
          className="mb-4 sm:mb-6"
          description={
            <Trans
              i18nKey="vai.headerMessage"
              components={{
                Link: <Link href={VAI_DOC_URL} />,
              }}
            />
          }
        />

        <Card className="vai-action-card">
          <Tabs
            tabs={tabsContent}
            navType="searchParam"
            variant={isFinal ? 'secondary' : undefined}
            className={isFinal ? 'space-y-4' : undefined}
          />
        </Card>
      </div>
    </Page>
  );
};

export default Vai;
