
import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XIcon } from '../Icons';

interface NotificationProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
            // Allow animation to finish before calling onClose
            setTimeout(onClose, 300); 
        }, 2700);

        return () => clearTimeout(timer);
    }, [message, onClose]);

    const bgColor = type === 'success' ? 'bg-brand-success' : 'bg-brand-danger';
    const Icon = type === 'success' ? CheckCircleIcon : XIcon;

    return (
        <div
            className={`fixed bottom-5 left-1/2 -translate-x-1/2 flex items-center w-full max-w-xs p-4 text-white ${bgColor} rounded-xl shadow-lg transition-all duration-300 ease-in-out z-50 ${
                visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
            role="alert"
        >
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-black/20">
                <Icon className="w-5 h-5" />
            </div>
            <div className="ml-3 text-sm font-medium">{message}</div>
            <button
                type="button"
                className="ml-auto -mx-1.5 -my-1.5 p-1.5 inline-flex h-8 w-8 rounded-lg hover:bg-black/20 focus:ring-2 focus:ring-gray-300"
                onClick={onClose}
                aria-label="Close"
            >
                <XIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default Notification;
