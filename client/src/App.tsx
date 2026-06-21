import React, { lazy, Suspense, useEffect } from "react";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Topic = lazy(() => import("./modules/topic/Topic"));
import { Route, Routes, useNavigate } from "react-router-dom";
import Protected from "./ProtectedRoutes/Protected";
import { useQuery } from "@tanstack/react-query";
import { me } from "./modules/auth/auth.api";
import toast from "react-hot-toast";
import type { User } from "./modules/user/user.types";
import { useAppDispatch, useAppSelector } from "./app/hook";
import { clearAuthenticated, setAuthenticated } from "./app/slice/authSlice";
import Spinner from "./components/Spinner";
import Notes from "./modules/notes/Notes";
import RevisionPage from "./modules/revision/RevisionPage";
import RevisionAttempt from "./modules/revision/Revisionattempt";
import { useTheme } from "./hooks/useTheme";

const App = () => {
  const navigate = useNavigate();

  const theme = useAppSelector((state) => state.theme.theme);

  const {
    bg,
  } = useTheme(theme);

  const dispatch = useAppDispatch();
  const authQuery = useQuery({
    queryKey: ["auth"],
    queryFn: me,
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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

  if (authQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div
      style={{ backgroundColor: bg }}
      className=" h-screen w-screen overflow-hidden"
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <Spinner />
          </div>
        }
      >
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

          <Route
            path="/revision"
            element={
              <Protected>
                <RevisionPage />
              </Protected>
            }
          />
          <Route
            path="/revision/:reviewId/:topicId/attempt"
            element={
              <Protected>
                <RevisionAttempt />
              </Protected>
            }
          />

          <Route
            path="/notes/:topicId"
            element={
              <Protected>
                <Notes />
              </Protected>
            }
          />
        </Routes>
      </Suspense>
    </div>
  );
};

export default App;
