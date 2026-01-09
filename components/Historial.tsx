
import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { PageHeader } from './common/Page';
import { TrashIcon, LoadIcon } from './Icons';
import ConfirmationModal from './common/ConfirmationModal';
import Notification from './common/Notification';

interface HistorialProps {
    setActiveTab: (tab: any) => void;
}

const Historial: React.FC<HistorialProps> = ({ setActiveTab }) => {
    const { state, dispatch } = useAppState();
    const { history } = state;

    const [modalState, setModalState] = useState<{ type: 'delete' | 'load' | null, snapshotId: string | null }>({ type: null, snapshotId: null });
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleDeleteRequest = (snapshotId: string) => {
        setModalState({ type: 'delete', snapshotId });
    };

    const handleLoadRequest = (snapshotId: string) => {
        setModalState({ type: 'load', snapshotId });
    };

    const confirmDelete = () => {
        if (modalState.snapshotId) {
            dispatch({ type: 'DELETE_SNAPSHOT', payload: { snapshotId: modalState.snapshotId } });
            showNotification('Registro eliminado del historial.', 'success');
        }
        closeModal();
    };

    const confirmLoad = () => {
        if (modalState.snapshotId) {
            dispatch({ type: 'LOAD_SNAPSHOT', payload: { snapshotId: modalState.snapshotId } });
            setActiveTab('Dashboard');
            showNotification('Datos del registro cargados correctamente.', 'success');
        }
        closeModal();
    };

    const closeModal = () => {
        setModalState({ type: null, snapshotId: null });
    };

    return (
        <div className="max-w-4xl mx-auto">
            <PageHeader title="Historial de Avances" description="Aquí puedes ver, cargar o eliminar los avances que has guardado." />
            
            <div className="space-y-4">
                {history.length === 0 ? (
                    <div className="text-center py-12 bg-brand-surface border-2 border-dashed border-brand-border rounded-xl">
                        <p className="text-brand-text-secondary">No hay registros en el historial.</p>
                        <p className="text-sm text-brand-text-secondary mt-2">Usa el botón "Guardar" en la parte superior para crear un registro.</p>
                    </div>
                ) : (
                    history.map(snapshot => (
                        <div key={snapshot.id} className="bg-brand-surface rounded-lg shadow-md border border-brand-border flex flex-col sm:flex-row items-start sm:items-center p-5 relative overflow-hidden transition-all hover:shadow-lg hover:border-brand-primary gap-4">
                            <div className="absolute left-0 top-0 h-full w-1.5 bg-brand-primary"></div>
                            <div className="flex-1 pl-4">
                                <p className="font-bold text-lg text-brand-text-primary">Registro de {snapshot.month}</p>
                                <p className="text-sm text-brand-text-secondary">Guardado el: {snapshot.timestamp}</p>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto pl-4 sm:pl-0">
                                <button
                                    onClick={() => handleLoadRequest(snapshot.id)}
                                    className="flex flex-1 sm:flex-initial items-center justify-center gap-2 px-4 py-2 text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-full transition-colors font-semibold"
                                    title="Cargar este estado"
                                >
                                    <LoadIcon className="w-5 h-5" />
                                    <span>Cargar</span>
                                </button>
                                <button
                                    onClick={() => handleDeleteRequest(snapshot.id)}
                                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full transition-colors font-semibold"
                                    title="Eliminar registro"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <ConfirmationModal
                isOpen={modalState.type === 'delete'}
                onClose={closeModal}
                onConfirm={confirmDelete}
                title="Confirmar Eliminación"
                message="¿Estás seguro de que quieres eliminar este registro del historial? Esta acción no se puede deshacer."
                confirmButtonText="Eliminar"
                confirmButtonClassName="bg-brand-danger hover:bg-red-500"
            />

            <ConfirmationModal
                isOpen={modalState.type === 'load'}
                onClose={closeModal}
                onConfirm={confirmLoad}
                title="Confirmar Carga"
                message="Esto reemplazará todos los datos actuales con los datos guardados de este registro. ¿Deseas continuar?"
                confirmButtonText="Cargar"
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

export default Historial;
