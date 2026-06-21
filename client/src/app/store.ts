import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./slice/authSlice";
import { themeReducer } from "./slice/themeSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
