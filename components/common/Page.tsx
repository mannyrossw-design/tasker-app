
import React, { useRef } from 'react';
import { DownloadIcon } from '../Icons';

declare const html2canvas: any;
declare const jspdf: any;

interface PageHeaderProps {
    title: string;
    description: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description }) => (
    <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-brand-text-primary">{title}</h1>
        <p className="mt-2 text-lg text-brand-text-secondary">{description}</p>
    </div>
);

interface ActionButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
}

export const ActionButton: React.FC<ActionButtonProps> = ({ onClick, children, className = '', disabled=false, type="button" }) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-primary ${
            disabled 
                ? 'bg-brand-surface text-brand-text-secondary cursor-not-allowed'
                : 'bg-brand-primary text-white hover:bg-opacity-90 active:scale-95'
        } ${className}`}
    >
        {children}
    </button>
);

interface PageActionsProps {
    pageRef: React.RefObject<HTMLDivElement>;
    pageTitle: string;
}

export const PageActions: React.FC<PageActionsProps> = ({ pageRef, pageTitle }) => {
    const handleDownloadPdf = () => {
        if (pageRef.current) {
            html2canvas(pageRef.current, { backgroundColor: '#1D1D1F', scale: 2 }).then((canvas: any) => {
                const imgData = canvas.toDataURL('image/png');
                const { jsPDF } = jspdf;
                const pdf = new jsPDF({
                    orientation: 'p',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                });
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save(`${pageTitle.toLowerCase().replace(/\s/g, '_')}.pdf`);
            });
        }
    };
    
    return (
        <div className="mt-8 flex flex-wrap gap-4">
            <ActionButton onClick={handleDownloadPdf} className="bg-brand-surface hover:bg-white/10 text-brand-text-primary border border-brand-border">
                <DownloadIcon className="w-5 h-5" />
                Descargar PDF
            </ActionButton>
        </div>
    );
};