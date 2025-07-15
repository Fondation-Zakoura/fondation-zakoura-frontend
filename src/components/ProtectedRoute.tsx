// src/components/ProtectedRoute.tsx
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { store } from "@/app/store";
export type RootState = ReturnType<typeof store.getState>;

interface Props {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const isLoggedIn = useSelector((state: RootState) => state.user.loggedIn);

  if (!isLoggedIn) {
    // Redirect to login page
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
