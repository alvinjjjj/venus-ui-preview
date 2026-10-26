import { fireEvent, screen } from '@testing-library/react';
import { useState } from 'react';

import { renderComponent } from 'testUtils/render';

import { MultiSelect } from '..';

vi.mock('hooks/responsive', async importOriginal => ({
  ...(await importOriginal<typeof import('hooks/responsive')>()),
  useBreakpointUp: () => true,
}));

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

describe('MultiSelect', () => {
  const options = [
    { value: 'first', label: 'First option' },
    { value: 'last', label: 'Last option' },
  ];

  const renderMultiSelect = () =>
    renderComponent(
      <MultiSelect
        options={options}
        value={[]}
        onChange={vi.fn()}
        placeholder="All options"
        renderCount={count => `${count} options`}
        title="Select options"
        resetLabel="Reset"
      />,
    );

  it('clips the options to the menu edge, so the highlight of the last option stays within its border', () => {
    renderMultiSelect();

    fireEvent.click(screen.getByRole('button', { name: 'All options' }));

    // An open dropdown renders its options in both the desktop menu and the mobile modal;
    // the desktop menu comes first, and is the element the accent border is passed to
    const menu = screen.getAllByText('Last option')[0].closest('.border-blue');

    expect(menu).toHaveClass('overflow-hidden');
    expect(menu).not.toHaveClass('overflow-visible');
  });

  it('exposes selected options and clears both selection feedback and the trigger on reset', () => {
    const ControlledSelect = () => {
      const [value, setValue] = useState<string[]>([]);
      return (
        <MultiSelect
          options={options}
          value={value}
          onChange={setValue}
          placeholder="All options"
          renderCount={count => `${count} options`}
          title="Select options"
          resetLabel="Reset"
        />
      );
    };
    renderComponent(<ControlledSelect />);
    fireEvent.click(screen.getByRole('button', { name: 'All options' }));
    const option = screen.getAllByRole('button', { name: 'First option', pressed: false })[0];
    fireEvent.click(option);
    expect(option).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getAllByRole('button', { name: 'Reset' })[0]);
    expect(option).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'All options' })).toHaveAttribute(
      'data-multiselect-has-value',
      'false',
    );
  });
});
