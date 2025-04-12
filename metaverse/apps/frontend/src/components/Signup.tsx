import { useState } from "react";
import { API } from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({ username: "", password: "", type: "user" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await API.post("/signup", form);
      if (res.status === 200) {
        alert("Signup successful!");
        navigate("/login");
      } else {
        setError(res.data.message || "Signup failed");
      }
    } catch (err) {
      setError("Server error : "+ err);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded shadow-md">
        <h2 className="text-xl font-bold">Signup</h2>
        <input className="border p-2 w-full" placeholder="Username"
          value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input className="border p-2 w-full" type="password" placeholder="Password"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button type="submit" className="bg-blue-500 text-white p-2 w-full">Sign up</button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
}
