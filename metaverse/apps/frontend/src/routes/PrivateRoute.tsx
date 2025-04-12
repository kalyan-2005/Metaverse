import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function PrivateRoute() {
  const { isLoggedIn } = useAuth();

  return isLoggedIn() ? <Outlet /> : <Navigate to="/login" />;
}
