import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);

      if (onLogin) onLogin();

      navigate("/search");

    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-black text-gray-200">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-violet-400 tracking-widest">
            GameShelf
          </div>
          <p className="text-gray-400 mt-2 text-sm">
            Discover. Review. Share your games.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/40 border border-red-800 text-red-300 p-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">
            Email
          </label>
          <input
            className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 transition"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-1">
            Password
          </label>
          <input
            type="password"
            className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 transition"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-medium transition ${
            loading
              ? "bg-slate-700 cursor-not-allowed"
              : "bg-violet-600 hover:bg-violet-700"
          }`}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-6">
          Built with ❤️ for gamers
        </div>
      </div>
    </div>
  );
}