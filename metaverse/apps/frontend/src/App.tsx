import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Signin";
import Dashboard from "./components/Dashboard";
import PrivateRoute from "./routes/PrivateRoute";
import Profile from "./components/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Dashboard />} />
        </Route>
        <Route path="/profile" element={<Profile />} />
        {/* 404 */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
