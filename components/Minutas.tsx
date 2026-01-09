
import React, { useState, useRef, useCallback } from 'react';
import { useCurrentData } from '../context/AppStateContext';
import { getMeetingMinutes } from '../services/geminiService';
import { PageHeader, PageActions, ActionButton } from './common/Page';
import { SparklesIcon, ShareIcon } from './Icons';

const Minutas: React.FC = () => {
    const { data, dispatch } = useCurrentData();
    const [isLoading, setIsLoading] = useState(false);
    const pageRef = useRef<HTMLDivElement>(null);

    const handleGenerateMinutes = useCallback(async () => {
        if (data.tasks.length === 0) return;
        setIsLoading(true);
        try {
            const result = await getMeetingMinutes(data.tasks);
            dispatch({ type: 'UPDATE_MINUTES', payload: { minutes: result } });
        } catch (error) {
            dispatch({ type: 'UPDATE_MINUTES', payload: { minutes: 'Error al generar la minuta.' } });
        } finally {
            setIsLoading(false);
        }
    }, [data.tasks, dispatch]);
    
    const handleShareToWhatsApp = () => {
        if (data.minutes) {
            const encodedText = encodeURIComponent(data.minutes);
            window.open(`https://wa.me/?text=${encodedText}`, '_blank');
        }
    };

    return (
        <div ref={pageRef} className="max-w-4xl mx-auto">
            <PageHeader title="Minuta de Reunión" description="Genera un resumen de la reunión semanal listo para compartir." />

            <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-lg">
                 <ActionButton onClick={handleGenerateMinutes} disabled={isLoading || data.tasks.length === 0}>
                    <SparklesIcon className="w-5 h-5" />
                    {isLoading ? 'Generando Minuta...' : 'Generar Minuta con IA'}
                </ActionButton>
                {data.tasks.length === 0 && <p className="text-sm text-brand-warning mt-2">Añade tareas y anotaciones en la pestaña 'Tareas' para poder generar una minuta.</p>}
            </div>
            
            {isLoading && <div className="mt-4 text-center text-brand-text-secondary">Creando resumen...</div>}

            {data.minutes && (
                <div className="mt-8 bg-brand-surface border border-brand-border rounded-xl p-6 shadow-lg">
                    <h2 className="text-2xl font-bold mb-4 text-brand-text-primary">Resumen de la Reunión</h2>
                    <div className="p-4 bg-brand-bg rounded-lg whitespace-pre-wrap prose prose-invert max-w-none text-brand-text-primary">
                       {data.minutes}
                    </div>
                    <ActionButton onClick={handleShareToWhatsApp} className="mt-4 bg-green-600 hover:bg-green-500">
                        <ShareIcon className="w-5 h-5" />
                        Compartir en WhatsApp
                    </ActionButton>
                </div>
            )}
            
            <PageActions pageRef={pageRef} pageTitle={`Minutas`} />
        </div>
    );
};

export default Minutas;