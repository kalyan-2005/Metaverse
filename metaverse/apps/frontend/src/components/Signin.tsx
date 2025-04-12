import { useState } from "react";
import { API } from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const { saveToken } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await API.post("/signin", form);
      if (res.status === 200 && res.data.token) {
        saveToken(res.data.token);
        navigate("/");
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError("Login failed : " + err);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="space-y-4 p-6 bg-white rounded shadow-md"
      >
        <h2 className="text-xl font-bold">Login</h2>
        <input
          className="border p-2 w-full"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          className="border p-2 w-full"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit" className="bg-green-500 text-white p-2 w-full">
          Login
        </button>
        <div className="flex justify-between items-center">
          {error && <p className="text-red-500">{error}</p>}
          <a href="/signup" className="text-xs">Create an account?</a>
        </div>
      </form>
    </div>
  );
}
