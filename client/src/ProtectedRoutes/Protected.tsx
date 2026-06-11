import React from "react";
import { useAppSelector } from "../app/hook";
import { Navigate } from "react-router-dom";

const Protected = ({ children }: { children: React.ReactNode }) => {
  const authSliceValue = useAppSelector((state) => state.auth);

  if (!authSliceValue.isAuthenticated && !authSliceValue.user?.id) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default Protected;
