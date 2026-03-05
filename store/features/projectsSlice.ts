import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Project } from "@/types/task";

interface ProjectsState {
  items: Project[];
}

const initialState: ProjectsState = {
  items: [],
};

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.items = action.payload;
    },
    addProject: (state, action: PayloadAction<Project>) => {
      state.items.unshift(action.payload);
    },
    removeProject: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((p) => p.id !== action.payload);
    },
  },
});

export const { setProjects, addProject, removeProject } = projectsSlice.actions;
export default projectsSlice.reducer;
