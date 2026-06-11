import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import type { User } from "../../modules/user/user.types";

interface authState {
  isAuthenticated: boolean;
  user?: User;
}

const initialState: authState = {
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearAuthenticated: (state) => {
      state.user = undefined;
      state.isAuthenticated = false;
    },
  },
});

export const { setAuthenticated, clearAuthenticated } = authSlice.actions;

export const authReducer = authSlice.reducer;
