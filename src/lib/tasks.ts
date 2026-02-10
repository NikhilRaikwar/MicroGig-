export interface Task {
  id: string;
  title: string;
  description: string;
  category: "design" | "translation" | "testing" | "writing" | "development" | "other";
  reward: number; // in XLM
  posterAddress: string;
  workerAddress?: string;
  deadline?: string;
  status: "open" | "in_progress" | "completed" | "paid";
  createdAt: string;
  txHash?: string;
  submissionText?: string;
}

const STORAGE_KEY = "microgig_tasks";

export const loadTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveTasks = (tasks: Task[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

export const addTask = (task: Omit<Task, "id" | "createdAt" | "status">): Task => {
  const tasks = loadTasks();
  const newTask: Task = {
    ...task,
    id: crypto.randomUUID(),
    status: "open",
    createdAt: new Date().toISOString(),
  };
  tasks.unshift(newTask);
  saveTasks(tasks);
  return newTask;
};

export const updateTask = (id: string, updates: Partial<Task>): Task | null => {
  const tasks = loadTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;
  tasks[index] = { ...tasks[index], ...updates };
  saveTasks(tasks);
  return tasks[index];
};

export const CATEGORIES = [
  { value: "design", label: "Design", emoji: "🎨" },
  { value: "translation", label: "Translation", emoji: "🌍" },
  { value: "testing", label: "Testing", emoji: "🧪" },
  { value: "writing", label: "Writing", emoji: "✍️" },
  { value: "development", label: "Development", emoji: "💻" },
  { value: "other", label: "Other", emoji: "📋" },
] as const;
