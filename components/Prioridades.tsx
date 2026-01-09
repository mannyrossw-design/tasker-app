
import React, { useState, useRef, useCallback } from 'react';
import { useCurrentData } from '../context/AppStateContext';
import { getPrioritizedTasks } from '../services/geminiService';
import { ItemType, TaskItem, EisenhowerMatrix } from '../types';
import { PageHeader, PageActions, ActionButton } from './common/Page';
import { SparklesIcon } from './Icons';

const Quadrant: React.FC<{ title: string; subtitle: string; tasks: TaskItem[]; className: string }> = ({ title, subtitle, tasks, className }) => (
    <div className={`rounded-xl p-4 border ${className}`}>
        <h3 className="font-bold text-lg text-brand-text-primary">{title}</h3>
        <p className="text-sm text-brand-text-secondary mb-3">{subtitle}</p>
        <div className="space-y-2">
            {tasks.length > 0 ? tasks.map(task => (
                <div key={task.id} className="bg-white/10 p-3 rounded-lg text-sm shadow-sm text-brand-text-primary">
                    {task.text}
                </div>
            )) : <p className="text-sm text-brand-text-secondary italic">Sin tareas</p>}
        </div>
    </div>
);

const Prioridades: React.FC = () => {
    const { data, dispatch } = useCurrentData();
    const [isLoading, setIsLoading] = useState(false);
    const pageRef = useRef<HTMLDivElement>(null);

    const tasksOnly = data.tasks.filter(item => item.type === ItemType.Task);

    const handlePrioritize = useCallback(async () => {
        if (tasksOnly.length === 0) return;
        setIsLoading(true);
        try {
            const priorities = await getPrioritizedTasks(tasksOnly);
            dispatch({ type: 'UPDATE_PRIORITIES', payload: { priorities } });
        } catch (error) {
            console.error(error);
            alert("Hubo un error al priorizar las tareas. Por favor, revisa la consola.");
        } finally {
            setIsLoading(false);
        }
    }, [tasksOnly, dispatch]);

    const priorities = data.prioritizedTasks;

    return (
        <div ref={pageRef} className="max-w-7xl mx-auto">
            <PageHeader title="Prioridades" description="Usa la IA para clasificar tus tareas con la Matriz de Eisenhower." />
            
            <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold mb-2 text-brand-text-primary">Tareas a Priorizar</h2>
                <p className="text-brand-text-secondary mb-4">
                    Solo los elementos marcados como "Tarea" en la pestaña anterior se mostrarán aquí.
                </p>
                {tasksOnly.length > 0 ? (
                    <ul className="list-disc list-inside mb-4 space-y-1 text-brand-text-primary">
                        {tasksOnly.map(task => <li key={task.id}>{task.text}</li>)}
                    </ul>
                ) : (
                    <p className="text-brand-text-secondary italic">No hay tareas para priorizar.</p>
                )}

                <ActionButton onClick={handlePrioritize} disabled={isLoading || tasksOnly.length === 0}>
                    <SparklesIcon className="w-5 h-5" />
                    {isLoading ? 'Priorizando con IA...' : 'Priorizar Tareas'}
                </ActionButton>
            </div>
            
            {isLoading && <div className="text-center py-8 text-brand-text-secondary">La IA está analizando tus tareas...</div>}

            {priorities && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4 text-center text-brand-text-primary">Matriz de Eisenhower</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Quadrant title="Hacer" subtitle="Urgente e Importante" tasks={priorities.urgentImportant} className="bg-red-500/15 border-red-500/30" />
                        <Quadrant title="Planificar" subtitle="No Urgente e Importante" tasks={priorities.notUrgentImportant} className="bg-blue-500/15 border-blue-500/30" />
                        <Quadrant title="Delegar" subtitle="Urgente y No Importante" tasks={priorities.urgentNotImportant} className="bg-yellow-500/15 border-yellow-500/30" />
                        <Quadrant title="Eliminar" subtitle="No Urgente y No Importante" tasks={priorities.notUrgentImportant} className="bg-gray-500/15 border-gray-500/30" />
                    </div>
                </div>
            )}
            
            <PageActions pageRef={pageRef} pageTitle={`Prioridades`} />
        </div>
    );
};

export default Prioridades;