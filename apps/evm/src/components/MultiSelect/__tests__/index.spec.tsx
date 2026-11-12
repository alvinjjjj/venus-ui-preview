import { fireEvent, screen, within } from '@testing-library/react';
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

    // Keep the scrollable options inside the framed surface, so the scrollbar cannot
    // cover its border or rounded corners.
    const menu = screen.getAllByText('Last option')[0].closest('.border-blue');

    expect(menu).toHaveClass('overflow-hidden');
    expect(menu).not.toHaveClass('overflow-visible');
    expect(menu?.querySelector('.venus-dropdown-scroll-area')).toHaveClass('overflow-y-auto');
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

  it('keeps the floating menu attached when filtering changes the layout or the page scrolls', () => {
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
    const trigger = screen.getByRole('button', { name: 'All options' });
    const anchor = trigger.parentElement;
    if (!anchor) throw new Error('Dropdown anchor is required');
    let top = 100;
    const rectSpy = vi.spyOn(anchor, 'getBoundingClientRect').mockImplementation(() => ({
      x: 300,
      y: top,
      left: 300,
      right: 540,
      top,
      bottom: top + 40,
      width: 240,
      height: 40,
      toJSON: () => ({}),
    }));
    fireEvent.click(trigger);
    const floatingMenu = document.querySelector('.venus-multiselect-panel')?.parentElement;
    expect(floatingMenu).toHaveStyle({ top: '148px', left: '300px' });
    top = 150;
    fireEvent.click(screen.getByRole('button', { name: 'First option', pressed: false }));
    expect(floatingMenu).toHaveStyle({ top: '198px' });
    top = 200;
    fireEvent.scroll(window);
    expect(floatingMenu).toHaveStyle({ top: '248px' });
    rectSpy.mockRestore();
  });
});

describe('MultiSelect search and scroll', () => {
  const symbols = ['QQQB', 'AMDB', 'MRNAB', 'MSFTB', 'METAB', 'MSTRB', 'TSMB', 'TSLAB'];
  const Harness = ({ count = symbols.length }: { count?: number }) => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <MultiSelect
        options={symbols.slice(0, count).map(symbol => ({ value: symbol, label: symbol }))}
        value={value}
        onChange={setValue}
        placeholder="All collaterals"
        title="Select collaterals"
        searchPlaceholder="Search collateral"
        resetLabel="Reset"
        renderCount={count => `${count} collaterals`}
      />
    );
  };
  const open = () => fireEvent.click(screen.getByRole('button', { name: 'All collaterals' }));
  const list = () => {
    const node = document.querySelector<HTMLElement>('.venus-multiselect-options');
    if (!node) throw new Error('Expected scrollable option list');
    return node;
  };

  it('preserves the short panel through six options', () => {
    renderComponent(<Harness count={6} />);
    open();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(document.querySelector('.venus-multiselect-options')).not.toBeInTheDocument();
  });

  it('focuses desktop search and ranks starts-with results ahead of contains, preserving order', () => {
    renderComponent(<Harness />);
    open();
    const input = screen.getByRole('textbox', { name: 'Search collateral' });
    expect(input).toHaveFocus();
    fireEvent.change(input, { target: { value: ' m ' } });
    expect(
      within(list())
        .getAllByRole('button')
        .map(button => button.textContent),
    ).toEqual(['MRNAB', 'MSFTB', 'METAB', 'MSTRB', 'AMDB', 'TSMB']);
    expect(list()).not.toHaveAttribute('data-multiselect-scroll');
    expect(input).toBeInTheDocument();
  });

  it('keeps hidden selections, applies ticks immediately, and resets every selection without clearing search', () => {
    renderComponent(<Harness />);
    open();
    fireEvent.click(screen.getByRole('button', { name: 'QQQB', pressed: false }));
    const input = screen.getByRole('textbox', { name: 'Search collateral' });
    fireEvent.change(input, { target: { value: 'MS' } });
    fireEvent.click(screen.getByRole('button', { name: 'MSFTB', pressed: false }));
    expect(screen.getByRole('button', { name: '2 collaterals' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(input).toHaveValue('MS');
    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(screen.getByRole('button', { name: 'QQQB', pressed: false })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'MSFTB', pressed: false })).toBeInTheDocument();
  });

  it('shows an empty-result message and restores options with the clear button', () => {
    renderComponent(<Harness />);
    open();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'XYZ' } });
    expect(screen.getByRole('status')).toHaveTextContent('No results found');
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(within(list()).getAllByRole('button')).toHaveLength(8);
    expect(list()).toHaveAttribute('data-multiselect-scroll', 'true');
  });

  it('clears the query on close while preserving selected values', () => {
    renderComponent(<Harness />);
    open();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'MS' } });
    fireEvent.click(screen.getByRole('button', { name: 'MSFTB', pressed: false }));
    fireEvent.click(screen.getByRole('button', { name: 'MSFTB', expanded: true }));
    fireEvent.click(screen.getByRole('button', { name: 'MSFTB', expanded: false }));
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'MSFTB', pressed: true })).toBeInTheDocument();
  });

  it('returns to the pre-search scroll position when the query is cleared', () => {
    renderComponent(<Harness />);
    open();
    list().scrollTop = 96;
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'MS' } });
    expect(list().scrollTop).toBe(0);
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(list().scrollTop).toBe(96);
  });
});
