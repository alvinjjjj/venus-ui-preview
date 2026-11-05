import { fireEvent, screen } from '@testing-library/react';

import { renderComponent } from 'testUtils/render';

import { Modal } from '..';
import { MODAL_BACKDROP_TEST_ID } from '../testIds';

describe('components/Modal', () => {
  it('closes with Escape and returns focus to the trigger', () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    const close = vi.fn();
    const { unmount } = renderComponent(
      <Modal isOpen title="Keyboard dialog" handleClose={close} />,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveFocus();
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(close).toHaveBeenCalledTimes(1);
    unmount();
    expect(trigger).toHaveFocus();
    trigger.remove();
  });

  it('keeps Tab and Shift Tab inside the dialog', () => {
    renderComponent(
      <Modal isOpen title="Keyboard dialog" handleClose={vi.fn()}>
        <input aria-label="Amount" />
        <button type="button">Save</button>
      </Modal>,
    );
    const close = screen.getByRole('button', { name: 'Close' });
    const save = screen.getByRole('button', { name: 'Save' });
    save.focus();
    fireEvent.keyDown(save, { key: 'Tab' });
    expect(close).toHaveFocus();
    fireEvent.keyDown(close, { key: 'Tab', shiftKey: true });
    expect(save).toHaveFocus();
  });

  it('renders a dialog with a backdrop and closes when the backdrop is clicked', () => {
    const handleCloseMock = vi.fn();

    renderComponent(
      <Modal isOpen handleClose={handleCloseMock} title="Modal title">
        <div>Modal content</div>
      </Modal>,
    );

    const backdrop = screen.getByTestId(MODAL_BACKDROP_TEST_ID);
    const dialog = screen.getByRole('dialog', { name: 'Modal title' });
    const modalContent = screen.getByText('Modal content');
    const closeButton = screen.getByRole('button', { name: 'Close' });

    expect(backdrop).toBeInstanceOf(HTMLDivElement);
    expect(dialog).toBeInstanceOf(HTMLDivElement);
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toContainElement(modalContent);
    expect(modalContent).toBeInTheDocument();

    fireEvent.click(backdrop);
    fireEvent.click(closeButton);

    expect(handleCloseMock).toHaveBeenCalledTimes(2);
  });

  it('unmounts children when closed', () => {
    const { rerender } = renderComponent(
      <Modal isOpen title="Modal title">
        <input aria-label="Delegate address" defaultValue="" />
      </Modal>,
    );

    fireEvent.change(screen.getByLabelText('Delegate address'), {
      target: { value: '0x123' },
    });

    expect(screen.getByLabelText('Delegate address')).toHaveValue('0x123');

    rerender(
      <Modal isOpen={false} title="Modal title">
        <input aria-label="Delegate address" defaultValue="" />
      </Modal>,
    );

    expect(screen.queryByLabelText('Delegate address')).not.toBeInTheDocument();

    rerender(
      <Modal isOpen title="Modal title">
        <input aria-label="Delegate address" defaultValue="" />
      </Modal>,
    );

    expect(screen.getByLabelText('Delegate address')).toHaveValue('');
  });
});
