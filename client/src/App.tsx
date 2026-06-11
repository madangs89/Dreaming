import React, { useEffect } from "react";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import { Route, Routes, useNavigate } from "react-router-dom";
import Protected from "./ProtectedRoutes/Protected";
import Topic from "./modules/topic/Topic";
import { useQuery } from "@tanstack/react-query";
import { me } from "./modules/auth/auth.api";
import type { AxiosError } from "axios";
import toast from "react-hot-toast";
import type { User } from "./modules/user/user.types";
import { useAppDispatch } from "./app/hook";
import { clearAuthenticated, setAuthenticated } from "./app/slice/authSlice";

const App = () => {
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const authQuery = useQuery({
    queryKey: ["auth"],
    queryFn: me,
    retry: 3,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (authQuery.isSuccess) {
      console.log("User data fetched successfully:", authQuery.data);
      dispatch(setAuthenticated(authQuery.data as User));
      navigate("/dashboard");
    } else if (authQuery.isError) {
      toast.error("Failed to Authenticate! Please Re login");
      dispatch(clearAuthenticated());
      navigate("/");
    }
  }, [authQuery.isError, authQuery.isSuccess]);

  return (
    <div className="bg-white h-screen w-screen overflow-hidden">
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        >
          <Route path="/dashboard" element={<Topic />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
