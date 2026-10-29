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
