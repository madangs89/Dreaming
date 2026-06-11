import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { store } from "./app/store.ts";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <App />

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#ffffff",
              color: "#111827",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "12px 16px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
            },

            success: {
              iconTheme: {
                primary: "#111827",
                secondary: "#ffffff",
              },
            },

            error: {
              iconTheme: {
                primary: "#111827",
                secondary: "#ffffff",
              },
            },
          }}
        />
      </Provider>
    </QueryClientProvider>
  </BrowserRouter>,
);
