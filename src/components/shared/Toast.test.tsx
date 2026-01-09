import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/utils';
import { ToastContainer } from './Toast';

describe('ToastContainer', () => {
    it('should render toast message', () => {
        const toasts = [{ id: 1, message: 'Test message', type: 'info' as const }];
        const onDismiss = vi.fn();

        render(<ToastContainer toasts={toasts} onDismiss={onDismiss} />);

        expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('should call onDismiss when close button is clicked', () => {
        const toasts = [{ id: 1, message: 'Test message', type: 'info' as const }];
        const onDismiss = vi.fn();

        render(<ToastContainer toasts={toasts} onDismiss={onDismiss} />);

        const closeButton = screen.getByRole('button');
        fireEvent.click(closeButton);

        expect(onDismiss).toHaveBeenCalledWith(1);
    });

    it('should apply correct class for success type', () => {
        const toasts = [{ id: 1, message: 'Success', type: 'success' as const }];
        const onDismiss = vi.fn();

        const { container } = render(<ToastContainer toasts={toasts} onDismiss={onDismiss} />);

        expect(container.querySelector('.toast-success')).toBeInTheDocument();
    });

    it('should apply correct class for error type', () => {
        const toasts = [{ id: 1, message: 'Error', type: 'error' as const }];
        const onDismiss = vi.fn();

        const { container } = render(<ToastContainer toasts={toasts} onDismiss={onDismiss} />);

        expect(container.querySelector('.toast-error')).toBeInTheDocument();
    });

    it('should render multiple toasts', () => {
        const toasts = [
            { id: 1, message: 'First toast', type: 'info' as const },
            { id: 2, message: 'Second toast', type: 'success' as const },
        ];
        const onDismiss = vi.fn();

        render(<ToastContainer toasts={toasts} onDismiss={onDismiss} />);

        expect(screen.getByText('First toast')).toBeInTheDocument();
        expect(screen.getByText('Second toast')).toBeInTheDocument();
    });

    it('should render empty container when no toasts', () => {
        const onDismiss = vi.fn();

        const { container } = render(<ToastContainer toasts={[]} onDismiss={onDismiss} />);

        expect(container.querySelector('.toast-container')?.children.length).toBe(0);
    });
});
