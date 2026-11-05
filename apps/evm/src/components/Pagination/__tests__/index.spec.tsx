import { fireEvent, screen } from '@testing-library/react';
import { useSearchParams } from 'react-router';

import { en } from 'libs/translations';
import { renderComponent } from 'testUtils/render';
import { Pagination } from '..';

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
afterAll(() => vi.unstubAllGlobals());

const HistoryPages = ({ itemsCount }: { itemsCount: number }) => {
  const [, setSearchParams] = useSearchParams();
  return (
    <Pagination
      itemsCount={itemsCount}
      itemsPerPageCount={20}
      initialPageIndex={1}
      showSinglePage
      onChange={page => setSearchParams({ page: String(page) })}
    />
  );
};

it('shows the count and current page for a single populated page', () => {
  renderComponent(<HistoryPages itemsCount={6} />);
  expect(screen.getByText('Items 1 - 6 out of 6')).toBeVisible();
  expect(screen.getByLabelText(en.pagination.currentPage)).toHaveValue('1');
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('keeps empty and default single-page pagination hidden', () => {
  const { rerender } = renderComponent(<Pagination itemsCount={6} onChange={() => {}} />);
  expect(screen.queryByLabelText(en.pagination.currentPage)).not.toBeInTheDocument();
  rerender(<Pagination itemsCount={0} showSinglePage onChange={() => {}} />);
  expect(screen.queryByLabelText(en.pagination.currentPage)).not.toBeInTheDocument();
});

it('navigates 20-item pages and clamps manual page entry to the last page', () => {
  renderComponent(<HistoryPages itemsCount={45} />);
  fireEvent.click(screen.getByRole('button', { name: en.pagination.goToNextPage }));
  expect(screen.getByText('Items 21 - 40 out of 45')).toBeVisible();
  const input = screen.getByLabelText(en.pagination.currentPage);
  fireEvent.change(input, { target: { value: '100' } });
  fireEvent.blur(input);
  expect(screen.getByText('Items 41 - 45 out of 45')).toBeVisible();
  expect(input).toHaveValue('3');
  expect(screen.queryByRole('button', { name: en.pagination.goToNextPage })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: en.pagination.goToFirstPage }));
  expect(screen.getByText('Items 1 - 20 out of 45')).toBeVisible();
});
