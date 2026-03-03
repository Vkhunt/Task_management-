import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthSession: (
      state,
      action: PayloadAction<{
        isAuthenticated: boolean;
        user: AuthState["user"];
      }>,
    ) => {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.user = action.payload.user;
    },
    clearAuthSession: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

export const { setAuthSession, clearAuthSession } = authSlice.actions;
export default authSlice.reducer;
