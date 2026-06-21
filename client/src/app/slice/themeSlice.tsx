import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../modules/user/user.types";

interface themeState {
  theme: "light" | "dark";
}

const initialState: themeState = {
  theme: localStorage.getItem("theme") === "dark" ? "dark" : "light",
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", state.theme);
    },
  },
});

export const { toggleTheme } = themeSlice.actions;

export const themeReducer = themeSlice.reducer;
