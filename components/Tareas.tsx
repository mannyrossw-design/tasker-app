
import React, { useState, useRef } from 'react';
import { useCurrentData } from '../context/AppStateContext';
import { ItemType, TaskItem } from '../types';
import { PageHeader, PageActions, ActionButton } from './common/Page';
import { PlusIcon, TrashIcon, CopyIcon, CheckIcon } from './Icons';

const Tareas: React.FC = () => {
    const { data, dispatch } = useCurrentData();
    const [newItemText, setNewItemText] = useState('');
    const [newItemType, setNewItemType] = useState<ItemType>(ItemType.Task);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const pageRef = useRef<HTMLDivElement>(null);

    const handleAddItem = () => {
        if (newItemText.trim() === '') return;
        
        const newItem: TaskItem = {
            id: `task-${Date.now()}`,
            text: newItemText.trim(),
            type: newItemType,
        };

        dispatch({ type: 'ADD_TASK', payload: { task: newItem } });
        setNewItemText('');
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddItem();
        }
    };

    const handleRemoveItem = (id: string) => {
        dispatch({ type: 'REMOVE_TASK', payload: { taskId: id } });
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div ref={pageRef} className="max-w-4xl mx-auto">
            <PageHeader title="Tareas y Anotaciones" description="Registra todas las acciones y notas importantes de la semana." />
            
            <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-lg">
                <div className="space-y-4">
                    <textarea
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-brand-bg border border-brand-border rounded-lg p-3 focus:ring-brand-primary focus:border-brand-primary text-brand-text-primary placeholder-brand-text-secondary"
                        rows={3}
                        placeholder="Escribe una nueva tarea o anotación..."
                    />
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
            </div>

            <div className="mt-8 space-y-4">
                {data.tasks.length === 0 ? (
                    <p className="text-center text-brand-text-secondary py-8">No hay tareas ni anotaciones.</p>
                ) : (
                    data.tasks.map(item => (
                        <div key={item.id} className="bg-brand-surface border border-brand-border rounded-xl p-4 flex items-start justify-between gap-4 shadow-md transition-shadow hover:shadow-lg">
                            <div className="flex-1">
                                <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full mb-2 ${item.type === ItemType.Task ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}`}>
                                    {item.type}
                                </span>
                                <p className="text-brand-text-primary whitespace-pre-wrap">{item.text}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleCopy(item.text, item.id)} className="p-2 text-brand-text-secondary hover:text-brand-text-primary transition-colors rounded-full hover:bg-white/10">
                                    {copiedId === item.id ? <CheckIcon className="w-5 h-5 text-brand-success" /> : <CopyIcon className="w-5 h-5" />}
                                </button>
                                <button onClick={() => handleRemoveItem(item.id)} className="p-2 text-brand-text-secondary hover:text-brand-danger transition-colors rounded-full hover:bg-red-500/10">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <PageActions pageRef={pageRef} pageTitle={`Tareas`} />
        </div>
    );
};

export default Tareas;