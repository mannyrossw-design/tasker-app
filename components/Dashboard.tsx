
import React, { useState, useRef, useCallback } from 'react';
import { useCurrentData } from '../context/AppStateContext';
import { getDashboardSummary } from '../services/geminiService';
import { DashboardChecklistItem, DashboardTextItem } from '../types';
import { PageHeader, PageActions, ActionButton } from './common/Page';
import { SparklesIcon } from './Icons';

const Dashboard: React.FC = () => {
    const { data, dispatch } = useCurrentData();
    const [isLoading, setIsLoading] = useState(false);
    const pageRef = useRef<HTMLDivElement>(null);

    const handleChecklistChange = (item: DashboardChecklistItem) => {
        dispatch({ type: 'UPDATE_CHECKLIST_ITEM', payload: { item: { ...item, completed: !item.completed } } });
    };

    const handleTextChange = (item: DashboardTextItem, content: string) => {
        dispatch({ type: 'UPDATE_TEXT_ITEM', payload: { item: { ...item, content } } });
    };

    const handleGenerateSummary = useCallback(async () => {
        setIsLoading(true);
        dispatch({ type: 'UPDATE_DASHBOARD_SUMMARY', payload: { summary: '' } });
        try {
            const result = await getDashboardSummary(data.dashboardChecklist, data.dashboardTextItems);
            dispatch({ type: 'UPDATE_DASHBOARD_SUMMARY', payload: { summary: result } });
        } catch (error) {
            dispatch({ type: 'UPDATE_DASHBOARD_SUMMARY', payload: { summary: 'Error al generar el resumen.' } });
        } finally {
            setIsLoading(false);
        }
    }, [data.dashboardChecklist, data.dashboardTextItems, dispatch]);

    return (
        <div ref={pageRef} className="max-w-7xl mx-auto">
            <PageHeader title="Dashboard" description="Seguimiento de objetivos de publicación y acciones clave." />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-brand-surface border border-brand-border rounded-xl p-6 shadow-lg">
                    <h2 className="text-2xl font-bold mb-4 text-brand-text-primary">Checklist de Publicaciones</h2>
                    <div className="space-y-4">
                        {data.dashboardChecklist.map(item => (
                            <div key={item.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={item.id}
                                    checked={item.completed}
                                    onChange={() => handleChecklistChange(item)}
                                    className="w-5 h-5 rounded border-brand-border bg-brand-bg text-brand-primary focus:ring-brand-primary focus:ring-offset-brand-surface"
                                />
                                <label htmlFor={item.id} className="ml-3 text-brand-text-primary cursor-pointer">{item.label}</label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                    {data.dashboardTextItems.map(item => (
                        <div key={item.id} className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-lg">
                            <h2 className="text-xl font-bold mb-3 text-brand-text-primary">{item.label}</h2>
                            <textarea
                                value={item.content}
                                onChange={(e) => handleTextChange(item, e.target.value)}
                                rows={5}
                                className="w-full bg-brand-bg border border-brand-border rounded-lg p-2 focus:ring-brand-primary focus:border-brand-primary text-brand-text-primary placeholder-brand-text-secondary"
                                placeholder="Añade tus notas aquí..."
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 bg-brand-surface border border-brand-border rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-brand-text-primary">Resumen con IA</h2>
                <ActionButton onClick={handleGenerateSummary} disabled={isLoading}>
                    <SparklesIcon className="w-5 h-5" />
                    {isLoading ? 'Generando...' : 'Generar Resumen de Objetivos'}
                </ActionButton>
                {isLoading && <div className="mt-4 text-brand-text-secondary">Analizando datos...</div>}
                {data.dashboardSummary && (
                    <div className="mt-4 p-4 bg-brand-bg rounded-lg prose prose-invert max-w-none prose-p:text-brand-text-primary">
                        <p className="whitespace-pre-wrap">{data.dashboardSummary}</p>
                    </div>
                )}
            </div>

            <PageActions pageRef={pageRef} pageTitle={`Dashboard`} />
        </div>
    );
};

export default Dashboard;