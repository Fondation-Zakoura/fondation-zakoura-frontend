// src/components/ProtectedRoute.tsx
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store"; // adjust path if needed

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
