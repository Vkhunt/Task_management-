import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import type { Task, TaskFilters } from "@/types/task";
import { BUILT_IN_COLUMNS } from "@/types/task";

export type SortKey = "title" | "priority" | "dueDate";
export type SortDirection = "asc" | "desc";
export type ColumnSort = { key: SortKey; direction: SortDirection };

export interface KanbanColumn {
  id: string; // used as task.status value
  label: string; // display name
}

interface TasksState {
  items: Task[];
  filters: TaskFilters;
  sortConfig: Record<string, ColumnSort>;
  columns: KanbanColumn[];
}

const DEFAULT_SORT: ColumnSort = { key: "dueDate", direction: "asc" };

const initialState: TasksState = {
  items: [],
  filters: {
    search: "",
    status: "all",
    priority: "all",
    date: "",
  },
  sortConfig: {
    todo: { key: "dueDate", direction: "asc" },
    "in-progress": { key: "dueDate", direction: "asc" },
    done: { key: "dueDate", direction: "desc" },
  },
  columns: BUILT_IN_COLUMNS,
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.items = action.payload;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.items.unshift(action.payload);
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.items.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    updateTaskStatus: (
      state,
      action: PayloadAction<{ id: string; status: string }>,
    ) => {
      const task = state.items.find((t) => t.id === action.payload.id);
      if (task) {
        task.status = action.payload.status;
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
    // Swap a temp-id optimistic task with the real server task once create resolves
    replaceTask: (
      state,
      action: PayloadAction<{ oldId: string; newTask: Task }>,
    ) => {
      const index = state.items.findIndex((t) => t.id === action.payload.oldId);
      if (index !== -1) {
        state.items[index] = action.payload.newTask;
      }
    },
    // Optimistically remove all tasks belonging to a deleted column
    removeTasksByStatus: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((t) => t.status !== action.payload);
    },
    setFilters: (state, action: PayloadAction<TaskFilters>) => {
      state.filters = action.payload;
    },
    setSortConfig: (
      state,
      action: PayloadAction<{ column: string; config: ColumnSort }>,
    ) => {
      state.sortConfig[action.payload.column] = action.payload.config;
    },
    // Column management
    addColumn: (state, action: PayloadAction<KanbanColumn>) => {
      const exists = state.columns.some((c) => c.id === action.payload.id);
      if (!exists) {
        state.columns.push(action.payload);
        state.sortConfig[action.payload.id] = { ...DEFAULT_SORT };
      }
    },
    removeColumn: (state, action: PayloadAction<string>) => {
      // Only allow removing custom (non-built-in) columns
      const builtInIds = BUILT_IN_COLUMNS.map((c) => c.id);
      if (!builtInIds.includes(action.payload)) {
        state.columns = state.columns.filter((c) => c.id !== action.payload);
        delete state.sortConfig[action.payload];
      }
    },
    setColumns: (state, action: PayloadAction<KanbanColumn[]>) => {
      state.columns = action.payload;
      // Ensure sortConfig exists for all columns
      action.payload.forEach((col) => {
        if (!state.sortConfig[col.id]) {
          state.sortConfig[col.id] = { ...DEFAULT_SORT };
        }
      });
    },
  },
});

export const {
  setTasks,
  addTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  replaceTask,
  removeTasksByStatus,
  setFilters,
  setSortConfig,
  addColumn,
  removeColumn,
  setColumns,
} = tasksSlice.actions;

// ─── Memoized Selectors ───────────────────────────────────────────────────────

const selectTasksItems = (state: { tasks: TasksState }) => state.tasks.items;
const selectTasksFilters = (state: { tasks: TasksState }) =>
  state.tasks.filters;
const selectTasksSortConfig = (state: { tasks: TasksState }) =>
  state.tasks.sortConfig;
export const selectColumns = (state: { tasks: TasksState }) =>
  state.tasks.columns;

export const selectFilteredTasks = createSelector(
  [selectTasksItems, selectTasksFilters],
  (items: Task[], filters: TaskFilters) => {
    return items.filter((task: Task) => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        task.title.toLowerCase().includes(searchLower) ||
        (task.description &&
          task.description.toLowerCase().includes(searchLower));

      const matchesStatus =
        filters.status === "all" || task.status === filters.status;

      const matchesPriority =
        filters.priority === "all" || task.priority === filters.priority;

      let matchesDate = true;
      if (filters.date) {
        if (!task.dueDate) {
          matchesDate = false;
        } else {
          const taskDate = new Date(task.dueDate).toISOString().split("T")[0];
          matchesDate = taskDate === filters.date;
        }
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesDate;
    });
  },
);

export const selectSortedTasksByColumn = createSelector(
  [
    selectFilteredTasks,
    selectTasksSortConfig,
    (_state: { tasks: TasksState }, column: string) => column,
  ],
  (
    filteredTasks: Task[],
    sortConfigs: Record<string, ColumnSort>,
    column: string,
  ) => {
    const config = sortConfigs[column] ?? DEFAULT_SORT;
    const columnTasks = filteredTasks.filter((t: Task) => t.status === column);

    return [...columnTasks].sort((a: Task, b: Task) => {
      let comparison = 0;
      switch (config.key) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "priority": {
          const priorityWeight: Record<Task["priority"], number> = {
            low: 1,
            medium: 2,
            high: 3,
          };
          comparison = priorityWeight[a.priority] - priorityWeight[b.priority];
          break;
        }
        case "dueDate": {
          const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          if (!a.dueDate && b.dueDate) comparison = 1;
          else if (a.dueDate && !b.dueDate) comparison = -1;
          else comparison = dateA - dateB;
          break;
        }
      }
      return config.direction === "asc" ? comparison : -comparison;
    });
  },
);

export default tasksSlice.reducer;
