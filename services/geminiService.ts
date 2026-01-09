
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { TaskItem, DashboardChecklistItem, DashboardTextItem, EisenhowerMatrix, ItemType } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.warn("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getDashboardSummary = async (checklist: DashboardChecklistItem[], textItems: DashboardTextItem[]): Promise<string> => {
    const completedCount = checklist.filter(item => item.completed).length;
    const totalCount = checklist.length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const checklistString = checklist.map(item => `- ${item.label}: ${item.completed ? 'Logrado' : 'No Logrado'}`).join('\n');
    const notesString = textItems.map(item => `Notas sobre ${item.label}:\n${item.content}`).join('\n\n');

    const prompt = `
      Eres un asistente de marketing analítico. A continuación se presenta el estado de las tareas de publicación y notas adicionales para un período.
      
      **Tareas de Publicación:**
      ${checklistString}

      **Notas Adicionales:**
      ${notesString}

      **Resumen General:**
      - Total de tareas de publicación: ${totalCount}
      - Tareas completadas: ${completedCount}
      - Porcentaje de logro: ${percentage}%

      Por favor, genera un breve resumen ejecutivo sobre el cumplimiento de los objetivos de publicación. Menciona si se lograron los objetivos, el porcentaje de logro, y una breve conclusión basada en las tareas y notas.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating dashboard summary:", error);
        return "Error al generar el resumen. Por favor, inténtelo de nuevo.";
    }
};

export const getPrioritizedTasks = async (tasks: TaskItem[]): Promise<EisenhowerMatrix> => {
    const taskListString = tasks.map((task, index) => `${index + 1}. ${task.text}`).join('\n');
    
    const prompt = `
      Analiza la siguiente lista de tareas y clasifícalas según la Matriz de Eisenhower (Urgente/Importante).
      Considera la complejidad implícita, el impacto potencial y el esfuerzo requerido para cada tarea.
      
      Lista de Tareas:
      ${taskListString}

      Devuelve la respuesta en formato JSON con la siguiente estructura:
      {
        "urgentImportant": ["texto de la tarea 1", "texto de la tarea 2"],
        "notUrgentImportant": ["texto de la tarea 3"],
        "urgentNotImportant": ["texto de la tarea 4"],
        "notUrgentNotImportant": ["texto de la tarea 5"]
      }
      Asegúrate de que cada tarea de la lista original aparezca en una y solo una de las categorías.
      Si una categoría no tiene tareas, devuelve un array vacío.
    `;
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 },
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        urgentImportant: { type: Type.ARRAY, items: { type: Type.STRING } },
                        notUrgentImportant: { type: Type.ARRAY, items: { type: Type.STRING } },
                        urgentNotImportant: { type: Type.ARRAY, items: { type: Type.STRING } },
                        notUrgentNotImportant: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['urgentImportant', 'notUrgentImportant', 'urgentNotImportant', 'notUrgentNotImportant'],
                },
            }
        });

        const jsonResponse = JSON.parse(response.text);
        
        const mapTextToTask = (textArray: string[]): TaskItem[] => {
            return textArray.map(text => {
                const originalTask = tasks.find(t => t.text.trim() === text.trim());
                return originalTask || { id: `ai-${Math.random()}`, text, type: ItemType.Task };
            });
        };

        return {
            urgentImportant: mapTextToTask(jsonResponse.urgentImportant || []),
            notUrgentImportant: mapTextToTask(jsonResponse.notUrgentImportant || []),
            urgentNotImportant: mapTextToTask(jsonResponse.notUrgentImportant || []),
            notUrgentNotImportant: mapTextToTask(jsonResponse.notUrgentNotImportant || []),
        };

    } catch (error) {
        console.error("Error prioritizing tasks:", error);
        throw new Error("No se pudieron priorizar las tareas.");
    }
};

export const getMeetingMinutes = async (items: TaskItem[]): Promise<string> => {
    const tasks = items.filter(item => item.type === ItemType.Task);
    const annotations = items.filter(item => item.type === ItemType.Annotation);

    const prompt = `
      Genera una minuta simple y concisa de una reunión semanal a partir de la siguiente lista de tareas y anotaciones.
      Utiliza una redacción amigable y directa, lista para ser compartida. No utilices emojis en tu respuesta.
      
      **Tareas (Acciones a realizar):**
      ${tasks.map(t => `- ${t.text}`).join('\n')}

      **Anotaciones (Puntos clave de la discusión):**
      ${annotations.map(a => `- ${a.text}`).join('\n')}

      El resumen debe tener dos secciones claras: "Puntos Clave" y "Próximos Pasos".
      Sé breve y ve al grano.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating minutes:", error);
        return "Error al generar la minuta.";
    }
};

export const getBrainDumpSummary = async (items: TaskItem[]): Promise<string> => {
    const tasks = items.filter(item => item.type === ItemType.Task);
    const annotations = items.filter(item => item.type === ItemType.Annotation);

    const prompt = `
      Genera un resumen ejecutivo y conciso a partir de la siguiente lista de ideas (tareas) y anotaciones.
      Utiliza una redacción profesional y directa. No utilices emojis en tu respuesta.

      **Ideas Accionables (Tareas):**
      ${tasks.map(t => `- ${t.text}`).join('\n')}

      **Anotaciones (Notas de apoyo):**
      ${annotations.map(a => `- ${a.text}`).join('\n')}

      El resumen debe tener dos secciones claras: "Puntos Clave" y "Próximos Pasos".
      Sé breve y ve al grano.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating brain dump summary:", error);
        return "Error al generar el resumen.";
    }
};
