
import React, { useState, useMemo, useRef } from 'react';
import { AppStateProvider } from './context/AppStateContext';
import Dashboard from './components/Dashboard';
import Tareas from './components/Tareas';
import Prioridades from './components/Prioridades';
import Minutas from './components/Minutas';
import Historial from './components/Historial';
import Brain from './components/Reuniones';
import { Layout } from './components/Layout';
import { DashboardIcon, TasksIcon, PriorityIcon, MinutesIcon, HistoryIcon, BrainIcon } from './components/Icons';

type Tab = 'Dashboard' | 'Tareas' | 'Prioridades' | 'Minutas' | 'Brain' | 'Historial';

const App = () => {
    const [activeTab, setActiveTab] = useState<Tab>('Dashboard');
    const contentRef = useRef<HTMLDivElement>(null);

    const renderContent = () => {
        switch (activeTab) {
            case 'Dashboard':
                return <Dashboard />;
            case 'Tareas':
                return <Tareas />;
            case 'Prioridades':
                return <Prioridades />;
            case 'Minutas':
                return <Minutas />;
            case 'Brain':
                return <Brain />;
            case 'Historial':
                return <Historial setActiveTab={setActiveTab} />;
            default:
                return <Dashboard />;
        }
    };
    
    const navItems = useMemo(() => [
        { id: 'Dashboard', label: 'Dashboard', icon: DashboardIcon },
        { id: 'Tareas', label: 'Tareas', icon: TasksIcon },
        { id: 'Prioridades', label: 'Prioridades', icon: PriorityIcon },
        { id: 'Minutas', label: 'Minutas', icon: MinutesIcon },
        { id: 'Brain', label: 'Brain', icon: BrainIcon },
        { id: 'Historial', label: 'Historial', icon: HistoryIcon },
    ], []);

    return (
        <AppStateProvider>
            <div className="min-h-screen bg-brand-bg text-brand-text-primary">
                <Layout
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    contentRef={contentRef}
                    navItems={navItems}
                >
                    <div ref={contentRef} className="p-4 sm:p-6 lg:p-8">
                        {renderContent()}
                    </div>
                </Layout>
            </div>
        </AppStateProvider>
    );
};

export default App;