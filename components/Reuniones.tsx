
import React, { useState, useCallback } from 'react';
import { useCurrentData } from '../context/AppStateContext';
import { ItemType, TaskItem, EisenhowerMatrix } from '../types';
import { getPrioritizedTasks, getBrainDumpSummary } from '../services/geminiService';
import { PageHeader, ActionButton } from './common/Page';
import { PlusIcon, TrashIcon, CopyIcon, CheckIcon, SparklesIcon, ShareIcon } from './Icons';
import ConfirmationModal from './common/ConfirmationModal';
import Notification from './common/Notification';

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


const Brain: React.FC = () => {
    const { data, dispatch } = useCurrentData();
    const { brainTasks: tasks, brainPrioritizedTasks: prioritizedTasks, brainMinutes: minutes } = data;

    const [isLoadingPriorities, setIsLoadingPriorities] = useState(false);
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);
    const [newItemText, setNewItemText] = useState('');
    const [newItemType, setNewItemType] = useState<ItemType>(ItemType.Task);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isConfirmClearOpen, setConfirmClearOpen] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    
    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAddItem = () => {
        if (newItemText.trim() === '') return;
        const newItem: TaskItem = { id: `brain-task-${Date.now()}`, text: newItemText.trim(), type: newItemType };
        dispatch({ type: 'ADD_BRAIN_TASK', payload: { task: newItem } });
        setNewItemText('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddItem();
        }
    };
    
    const handleRemoveItem = (id: string) => {
        dispatch({ type: 'REMOVE_BRAIN_TASK', payload: { taskId: id } });
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handlePrioritize = useCallback(async () => {
        const tasksOnly = tasks.filter(item => item.type === ItemType.Task);
        if (tasksOnly.length === 0) return;
        setIsLoadingPriorities(true);
        try {
            const priorities = await getPrioritizedTasks(tasksOnly);
            dispatch({ type: 'UPDATE_BRAIN_PRIORITIES', payload: { priorities } });
        } catch (error) {
            console.error(error);
            showNotification("Hubo un error al priorizar las tareas.", 'error');
        } finally {
            setIsLoadingPriorities(false);
        }
    }, [tasks, dispatch]);

    const handleGenerateSummary = useCallback(async () => {
        if (tasks.length === 0) return;
        setIsLoadingSummary(true);
        try {
            const result = await getBrainDumpSummary(tasks);
            dispatch({ type: 'UPDATE_BRAIN_MINUTES', payload: { minutes: result } });
        } catch (error) {
            dispatch({ type: 'UPDATE_BRAIN_MINUTES', payload: { minutes: 'Error al generar el resumen.' } });
        } finally {
            setIsLoadingSummary(false);
        }
    }, [tasks, dispatch]);

    const handleShareToWhatsApp = () => {
        if (minutes) {
            const encodedText = encodeURIComponent(minutes);
            window.open(`https://wa.me/?text=${encodedText}`, '_blank');
        }
    };
    
    const handleClearBrain = () => {
        dispatch({ type: 'RESET_BRAIN_DATA' });
        showNotification('Datos de Brain limpiados.', 'success');
        setConfirmClearOpen(false);
    };

    const tasksOnly = tasks.filter(item => item.type === ItemType.Task);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-wrap justify-between items-start gap-4">
                <PageHeader title="Brain" description="Registra ideas, priorízalas con IA y genera resúmenes al instante." />
                <ActionButton onClick={() => setConfirmClearOpen(true)} className="bg-brand-surface hover:bg-white/10 text-brand-text-primary border border-brand-border shadow-sm">
                    <TrashIcon className="w-5 h-5" />
                    Limpiar Brain
                </ActionButton>
            </div>
            
            {/* 1. Task Input */}
            <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-brand-text-primary">1. Registrar Ideas y Notas</h2>
                <div className="space-y-4">
                    <textarea value={newItemText} onChange={(e) => setNewItemText(e.target.value)} onKeyDown={handleKeyDown} className="w-full bg-brand-bg border border-brand-border rounded-lg p-3 focus:ring-brand-primary focus:border-brand-primary text-brand-text-primary placeholder-brand-text-secondary" rows={3} placeholder="Escribe una nueva idea o nota..."/>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <span className="text-brand-text-secondary">Etiquetar como:</span>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setNewItemType(ItemType.Task)} className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${newItemType === ItemType.Task ? 'bg-brand-primary text-white' : 'bg-white/10 text-brand-text-primary hover:bg-white/20'}`}>Tarea</button>
                                <button type="button" onClick={() => setNewItemType(ItemType.Annotation)} className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${newItemType === ItemType.Annotation ? 'bg-brand-secondary text-white' : 'bg-white/10 text-brand-text-primary hover:bg-white/20'}`}>Anotación</button>
                            </div>
                        </div>
                        <ActionButton onClick={handleAddItem}>
                            <PlusIcon className="w-5 h-5" />
                            Agregar
                        </ActionButton>
                    </div>
                </div>
                <div className="mt-6 space-y-3">
                    {tasks.map(item => (
                        <div key={item.id} className="bg-brand-bg/50 border border-brand-border/50 rounded-lg p-3 flex items-start justify-between gap-4">
                             <div className="flex-1">
                                <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full mb-2 ${item.type === ItemType.Task ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}`}>{item.type}</span>
                                <p className="text-brand-text-primary whitespace-pre-wrap">{item.text}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => handleCopy(item.text, item.id)} className="p-2 text-brand-text-secondary hover:text-brand-text-primary transition-colors rounded-full hover:bg-white/10">{copiedId === item.id ? <CheckIcon className="w-5 h-5 text-brand-success" /> : <CopyIcon className="w-5 h-5" />}</button>
                                <button onClick={() => handleRemoveItem(item.id)} className="p-2 text-brand-text-secondary hover:text-brand-danger transition-colors rounded-full hover:bg-red-500/10"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Priorities */}
            <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-brand-text-primary">2. Priorizar Ideas con IA</h2>
                <ActionButton onClick={handlePrioritize} disabled={isLoadingPriorities || tasksOnly.length === 0}>
                    <SparklesIcon className="w-5 h-5" />
                    {isLoadingPriorities ? 'Priorizando...' : 'Priorizar Tareas'}
                </ActionButton>
                 {tasksOnly.length === 0 && <p className="text-sm text-brand-warning mt-2">Añade al menos una "Tarea" para poder priorizar.</p>}

                {isLoadingPriorities && <div className="text-center py-4 text-brand-text-secondary">La IA está analizando tus tareas...</div>}
                {prioritizedTasks && (
                    <div className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Quadrant title="Hacer" subtitle="Urgente e Importante" tasks={prioritizedTasks.urgentImportant} className="bg-red-500/15 border-red-500/30" />
                            <Quadrant title="Planificar" subtitle="No Urgente e Importante" tasks={prioritizedTasks.notUrgentImportant} className="bg-blue-500/15 border-blue-500/30" />
                            <Quadrant title="Delegar" subtitle="Urgente y No Importante" tasks={prioritizedTasks.urgentNotImportant} className="bg-yellow-500/15 border-yellow-500/30" />
                            <Quadrant title="Eliminar" subtitle="No Urgente y No Importante" tasks={prioritizedTasks.notUrgentImportant} className="bg-gray-500/15 border-gray-500/30" />
                        </div>
                    </div>
                )}
            </div>

            {/* 3. Minutes */}
            <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-brand-text-primary">3. Generar Resumen con IA</h2>
                 <ActionButton onClick={handleGenerateSummary} disabled={isLoadingSummary || tasks.length === 0}>
                    <SparklesIcon className="w-5 h-5" />
                    {isLoadingSummary ? 'Generando...' : 'Generar Resumen'}
                </ActionButton>
                {tasks.length === 0 && <p className="text-sm text-brand-warning mt-2">Añade tareas o anotaciones para poder generar un resumen.</p>}

                {isLoadingSummary && <div className="mt-4 text-center text-brand-text-secondary">Creando resumen...</div>}
                {minutes && (
                    <div className="mt-6">
                        <div className="p-4 bg-brand-bg rounded-lg whitespace-pre-wrap prose prose-invert max-w-none text-brand-text-primary">{minutes}</div>
                        <ActionButton onClick={handleShareToWhatsApp} className="mt-4 bg-green-600 hover:bg-green-500">
                            <ShareIcon className="w-5 h-5" />
                            Compartir en WhatsApp
                        </ActionButton>
                    </div>
                )}
            </div>
            
            <ConfirmationModal
                isOpen={isConfirmClearOpen}
                onClose={() => setConfirmClearOpen(false)}
                onConfirm={handleClearBrain}
                title="Limpiar Brain"
                message="¿Estás seguro? Se borrarán todas las ideas, prioridades y el resumen generado en esta sección."
                confirmButtonText="Limpiar"
                confirmButtonClassName="bg-brand-danger hover:bg-red-500"
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

export default Brain;