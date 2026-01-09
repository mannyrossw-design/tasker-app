
export enum ItemType {
    Task = 'Tarea',
    Annotation = 'Anotación',
}

export interface TaskItem {
    id: string;
    text: string;
    type: ItemType;
}

export interface DashboardChecklistItem {
    id: string;
    label: string;
    completed: boolean;
}

export interface DashboardTextItem {
    id: string;
    label: string;
    content: string;
}

export interface EisenhowerMatrix {
    urgentImportant: TaskItem[];
    notUrgentImportant: TaskItem[];
    urgentNotImportant: TaskItem[];
    notUrgentNotImportant: TaskItem[];
}

export interface MonthlyData {
    dashboardChecklist: DashboardChecklistItem[];
    dashboardTextItems: DashboardTextItem[];
    tasks: TaskItem[];
    prioritizedTasks: EisenhowerMatrix | null;
    minutes: string;
    dashboardSummary: string;
    // State for the Brain component
    brainTasks: TaskItem[];
    brainPrioritizedTasks: EisenhowerMatrix | null;
    brainMinutes: string;
}

export interface Snapshot {
    id: string;
    timestamp: string;
    month: string;
    data: MonthlyData;
}

export interface AppState {
    currentData: MonthlyData;
    history: Snapshot[];
}