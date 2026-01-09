import React from 'react';
import { ActionButton } from './Page';
import { XIcon, InfoIcon } from '../Icons';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    confirmButtonClassName?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmButtonText = 'Confirmar',
    cancelButtonText = 'Cancelar',
    confirmButtonClassName = '',
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-brand-surface rounded-xl shadow-2xl border border-brand-border w-full max-w-md mx-auto transform transition-all animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-brand-primary/10 sm:mx-0 sm:h-10 sm:w-10">
                            <InfoIcon className="h-6 w-6 text-brand-primary" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 className="text-lg leading-6 font-bold text-brand-text-primary" id="modal-title">
                                {title}
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-brand-text-secondary">
                                    {message}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-brand-surface/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-xl">
                    <ActionButton
                        onClick={onConfirm}
                        className={confirmButtonClassName}
                    >
                        {confirmButtonText}
                    </ActionButton>
                    <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-brand-border shadow-sm px-4 py-2 bg-brand-bg text-base font-medium text-brand-text-primary hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-brand-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm mr-2"
                        onClick={onClose}
                    >
                        {cancelButtonText}
                    </button>
                </div>
            </div>
            {/* Fix: The `jsx` prop on `<style>` is a Next.js feature (styled-jsx) and not valid in a standard React setup, causing a TypeScript error. Removing it makes it a standard style tag, resolving the error while keeping the animation styles. */}
            <style>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default ConfirmationModal;
