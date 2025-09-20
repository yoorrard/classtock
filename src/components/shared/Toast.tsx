import React, { useEffect } from 'react';
import { ToastMessage } from '../../types';

const Toast: React.FC<{ message: ToastMessage; onDismiss: (id: number) => void; }> = ({ message, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(message.id);
        }, 3000); // Auto-dismiss after 3 seconds
        return () => clearTimeout(timer);
    }, [message, onDismiss]);

    return (
        <div className={`toast toast-${message.type}`}>
            {message.message}
            <button onClick={() => onDismiss(message.id)} className="toast-close-button">&times;</button>
        </div>
    );
};

export const ToastContainer: React.FC<{ toasts: ToastMessage[]; onDismiss: (id: number) => void; }> = ({ toasts, onDismiss }) => {
    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <Toast key={toast.id} message={toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
};
