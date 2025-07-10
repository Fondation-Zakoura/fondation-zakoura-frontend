// src/components/ProtectedRoute.tsx
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store"; // <-- Correct path

interface Props {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const isLoggedIn = useSelector((state: RootState) => state.user.loggedIn);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
