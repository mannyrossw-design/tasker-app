
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, MonthlyData, TaskItem, DashboardChecklistItem, DashboardTextItem, EisenhowerMatrix, Snapshot } from '../types';

const LOCAL_STORAGE_KEY = 'marketing-app-state';

type AppAction =
    | { type: 'SET_STATE'; payload: AppState }
    | { type: 'UPDATE_CHECKLIST_ITEM'; payload: { item: DashboardChecklistItem } }
    | { type: 'UPDATE_TEXT_ITEM'; payload: { item: DashboardTextItem } }
    | { type: 'ADD_TASK'; payload: { task: TaskItem } }
    | { type: 'REMOVE_TASK'; payload: { taskId: string } }
    | { type: 'UPDATE_PRIORITIES'; payload: { priorities: EisenhowerMatrix } }
    | { type: 'UPDATE_MINUTES'; payload: { minutes: string } }
    | { type: 'UPDATE_DASHBOARD_SUMMARY'; payload: { summary: string } }
    | { type: 'SAVE_SNAPSHOT'; payload: { data: MonthlyData } }
    | { type: 'DELETE_SNAPSHOT'; payload: { snapshotId: string } }
    | { type: 'LOAD_SNAPSHOT'; payload: { snapshotId: string } }
    | { type: 'RESET_DATA' }
    // Actions for Brain component state
    | { type: 'ADD_BRAIN_TASK'; payload: { task: TaskItem } }
    | { type: 'REMOVE_BRAIN_TASK'; payload: { taskId: string } }
    | { type: 'UPDATE_BRAIN_PRIORITIES'; payload: { priorities: EisenhowerMatrix } }
    | { type: 'UPDATE_BRAIN_MINUTES'; payload: { minutes: string } }
    | { type: 'RESET_BRAIN_DATA' };

const AppStateContext = createContext<{ state: AppState; dispatch: React.Dispatch<AppAction> } | undefined>(undefined);

const initialDashboardChecklist: DashboardChecklistItem[] = [
    { id: 'email', label: 'Email marketing - envío de 1 correo', completed: false },
    { id: 'fb-static', label: 'Facebook - publicación de 2 contenidos estáticos', completed: false },
    { id: 'fb-story', label: 'Facebook - 1 story', completed: false },
    { id: 'fb-reel', label: 'Facebook - 1 reel', completed: false },
    { id: 'ig-static', label: 'Instagram - publicación de 2 contenidos estáticos', completed: false },
    { id: 'ig-story', label: 'Instagram - 1 story', completed: false },
    { id: 'ig-reel', label: 'Instagram - 1 reel', completed: false },
    { id: 'tiktok', label: 'Tiktok - Publicación de 1 video', completed: false },
    { id: 'linkedin', label: 'LinkedIn - Publicación de 2 contenidos estáticos', completed: false },
    { id: 'youtube', label: 'Youtube - Publicación de 1 video', completed: false },
    { id: 'monday', label: 'Monday - se actualizó?', completed: false },
    { id: 'blog', label: 'Blog - Publicación de 1 contenido', completed: false },
];

const initialDashboardTextItems: DashboardTextItem[] = [
    { id: 'ads', label: 'Puntos importantes de la reunión con Ads', content: '' },
    { id: 'seo', label: 'Acciones más importantes de SEO', content: '' },
];

const getInitialMonthlyData = (): MonthlyData => ({
    dashboardChecklist: JSON.parse(JSON.stringify(initialDashboardChecklist)),
    dashboardTextItems: JSON.parse(JSON.stringify(initialDashboardTextItems)),
    tasks: [],
    prioritizedTasks: null,
    minutes: '',
    dashboardSummary: '',
    brainTasks: [],
    brainPrioritizedTasks: null,
    brainMinutes: '',
});

const getInitialState = (): AppState => ({
    currentData: getInitialMonthlyData(),
    history: []
});

const appReducer = (state: AppState, action: AppAction): AppState => {
    switch (action.type) {
        case 'SET_STATE': {
            // Migration for old users who had monthlyData
            if ((action.payload as any).monthlyData) {
                const legacyState = action.payload as any;
                const months = Object.keys(legacyState.monthlyData).sort();
                const latestMonthData = months.length > 0 ? legacyState.monthlyData[months[months.length - 1]] : getInitialMonthlyData();
                return {
                    currentData: latestMonthData,
                    history: legacyState.history || []
                };
            }
            if(action.payload.currentData && action.payload.history) {
                 // Ensure new fields exist for users with old state
                const currentData = { ...getInitialMonthlyData(), ...action.payload.currentData };
                return { ...action.payload, currentData };
            }
            return state;
        }
        case 'SAVE_SNAPSHOT': {
            const date = new Date();
            const monthLabel = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            const newSnapshot: Snapshot = {
                id: `snap-${Date.now()}`,
                timestamp: date.toLocaleString('es-ES'),
                month: monthLabel, // For display purposes
                data: JSON.parse(JSON.stringify(action.payload.data)), // Deep copy
            };
            // Return new state object with updated history
            return { ...state, history: [newSnapshot, ...state.history] };
        }
        case 'DELETE_SNAPSHOT': {
            // Return new state object with filtered history
            return { ...state, history: state.history.filter(snap => snap.id !== action.payload.snapshotId) };
        }
        case 'LOAD_SNAPSHOT': {
            const snapshotToLoad = state.history.find(snap => snap.id === action.payload.snapshotId);
            // If snapshot not found, return current state to avoid errors
            if (!snapshotToLoad) return state;
            // Return new state object with loaded data
            return {
                ...state,
                currentData: JSON.parse(JSON.stringify(snapshotToLoad.data)), // Deep copy of data
            };
        }
        case 'RESET_DATA': {
            return {
                ...state,
                currentData: getInitialMonthlyData(),
            };
        }
        case 'UPDATE_CHECKLIST_ITEM': {
            const newChecklist = state.currentData.dashboardChecklist.map(item => item.id === action.payload.item.id ? action.payload.item : item);
            return { ...state, currentData: { ...state.currentData, dashboardChecklist: newChecklist } };
        }
        case 'UPDATE_TEXT_ITEM': {
             const newTextItems = state.currentData.dashboardTextItems.map(item => item.id === action.payload.item.id ? action.payload.item : item);
             return { ...state, currentData: { ...state.currentData, dashboardTextItems: newTextItems } };
        }
        case 'ADD_TASK': {
            const newTasks = [...state.currentData.tasks, action.payload.task];
            return { ...state, currentData: { ...state.currentData, tasks: newTasks } };
        }
        case 'REMOVE_TASK': {
            const newTasks = state.currentData.tasks.filter(task => task.id !== action.payload.taskId);
            return { ...state, currentData: { ...state.currentData, tasks: newTasks } };
        }
        case 'UPDATE_PRIORITIES': {
            return { ...state, currentData: { ...state.currentData, prioritizedTasks: action.payload.priorities } };
        }
        case 'UPDATE_MINUTES': {
            return { ...state, currentData: { ...state.currentData, minutes: action.payload.minutes } };
        }
        case 'UPDATE_DASHBOARD_SUMMARY': {
            return { ...state, currentData: { ...state.currentData, dashboardSummary: action.payload.summary } };
        }
        // Reducers for Brain component
        case 'ADD_BRAIN_TASK': {
            const newTasks = [...state.currentData.brainTasks, action.payload.task];
            return { ...state, currentData: { ...state.currentData, brainTasks: newTasks } };
        }
        case 'REMOVE_BRAIN_TASK': {
            const newTasks = state.currentData.brainTasks.filter(task => task.id !== action.payload.taskId);
            return { ...state, currentData: { ...state.currentData, brainTasks: newTasks } };
        }
        case 'UPDATE_BRAIN_PRIORITIES': {
            return { ...state, currentData: { ...state.currentData, brainPrioritizedTasks: action.payload.priorities } };
        }
        case 'UPDATE_BRAIN_MINUTES': {
            return { ...state, currentData: { ...state.currentData, brainMinutes: action.payload.minutes } };
        }
        case 'RESET_BRAIN_DATA': {
            return {
                ...state,
                currentData: {
                    ...state.currentData,
                    brainTasks: [],
                    brainPrioritizedTasks: null,
                    brainMinutes: '',
                }
            };
        }
        default:
            return state;
    }
};

interface AppStateProviderProps {
    children: ReactNode;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, getInitialState());

    useEffect(() => {
        try {
            const storedState = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedState) {
                dispatch({ type: 'SET_STATE', payload: JSON.parse(storedState) });
            }
        } catch (error) {
            console.error("Failed to load state from localStorage", error);
        }
    }, []);

    useEffect(() => {
        try {
            // Save state to localStorage whenever it changes
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
        } catch (error)
 {
            console.error("Failed to save state to localStorage", error);
        }
    }, [state]);

    return (
        <AppStateContext.Provider value={{ state, dispatch }}>
            {children}
        </AppStateContext.Provider>
    );
};

export const useAppState = () => {
    const context = useContext(AppStateContext);
    if (context === undefined) {
        throw new Error('useAppState must be used within an AppStateProvider');
    }
    return context;
};

export const useCurrentData = () => {
    const { state, dispatch } = useAppState();
    return { data: state.currentData, dispatch };
};