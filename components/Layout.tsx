import React, { useState } from 'react';
import { MenuIcon, SaveIcon, NewFileIcon } from './Icons';
import { useCurrentData } from '../context/AppStateContext';
import { ActionButton } from './common/Page';
import ConfirmationModal from './common/ConfirmationModal';
import Notification from './common/Notification';

interface NavItem {
    id: string;
    label: string;
    icon: React.FC<{ className?: string }>;
}

interface LayoutProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    contentRef: React.RefObject<HTMLDivElement>;
    children: React.ReactNode;
    navItems: NavItem[];
}

export const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, children, navItems }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isConfirmNewOpen, setConfirmNewOpen] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const { data, dispatch } = useCurrentData();

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleGlobalSave = () => {
        dispatch({ type: 'SAVE_SNAPSHOT', payload: { data } });
        showNotification('Avances guardados en el historial.');
    };

    const handleNewLog = () => {
        dispatch({ type: 'RESET_DATA' });
        showNotification('Bitácora reiniciada exitosamente.');
        setConfirmNewOpen(false);
    };

    const NavContent = () => (
        <nav className="mt-8 space-y-2">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 group ${
                        activeTab === item.id
                            ? 'bg-brand-primary text-white'
                            : 'text-brand-text-secondary hover:bg-white/10 hover:text-brand-text-primary'
                    }`}
                >
                    <item.icon className={`w-6 h-6 mr-4 transition-colors ${activeTab === item.id ? 'text-white' : 'text-brand-text-secondary group-hover:text-brand-primary'}`} />
                    <span>{item.label}</span>
                </button>
            ))}
        </nav>
    );

    return (
        <div className="flex h-screen bg-brand-bg">
            {/* Mobile Sidebar */}
            <div
                className={`fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity lg:hidden ${
                    isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setSidebarOpen(false)}
            ></div>
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-brand-surface border-r border-brand-border transform transition-transform lg:hidden ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="p-4">
                    <h1 className="text-2xl font-bold text-brand-text-primary">TASKER</h1>
                    <NavContent />
                </div>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 bg-brand-surface border-r border-brand-border flex-shrink-0">
                <div className="p-6">
                    <h1 className="text-3xl font-bold text-brand-text-primary">TASKER</h1>
                    <NavContent />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-y-auto">
                <header className="flex items-center justify-between p-4 bg-brand-surface/80 backdrop-blur-sm sticky top-0 z-30 border-b border-brand-border">
                    <button className="lg:hidden text-brand-text-primary" onClick={() => setSidebarOpen(true)}>
                        <MenuIcon className="w-6 h-6" />
                    </button>
                    <div className="flex-1 flex justify-center lg:justify-end items-center gap-4">
                       <ActionButton onClick={() => setConfirmNewOpen(true)} className="bg-brand-surface hover:bg-white/10 text-brand-text-primary border border-brand-border shadow-sm">
                          <NewFileIcon className="w-5 h-5" />
                          Nuevo
                       </ActionButton>
                       <ActionButton onClick={handleGlobalSave}>
                          <SaveIcon className="w-5 h-5" />
                          Guardar
                       </ActionButton>
                    </div>
                </header>
                <div className="flex-1">{children}</div>
            </main>
            
            <ConfirmationModal
                isOpen={isConfirmNewOpen}
                onClose={() => setConfirmNewOpen(false)}
                onConfirm={handleNewLog}
                title="Confirmar Acción"
                message="¿Estás seguro de que quieres reiniciar todos los datos? Esta acción borrará el trabajo no guardado."
            />

            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
};