import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { clearToken } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome to the Dashboard!</h1>
      <button className="mt-4 bg-red-500 text-white px-4 py-2" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
