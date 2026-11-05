import { ButtonWrapper, Card } from 'components';
import { Link } from 'containers/Link';

/** Shared empty-state frame from Dashboard Figma 3536:190052 / 3536:190065. */
export const DashboardEmptyState = ({ message, to }: { message: string; to?: string }) => (
  <Card className="dashboard-empty-state flex flex-col items-center justify-center gap-3 p-3 text-center text-sm">
    <p>{message}</p>
    {to && (
      <ButtonWrapper asChild>
        <Link noStyle to={to}>
          Explore markets
        </Link>
      </ButtonWrapper>
    )}
  </Card>
);
