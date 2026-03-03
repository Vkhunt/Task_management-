import { configureStore } from "@reduxjs/toolkit";
import tasksReducer from "./features/tasksSlice";
import authReducer from "./features/authSlice";

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    auth: authReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
