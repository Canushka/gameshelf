
import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      if (isRegister) {
        await api.post("/auth/register", {
          username: username.trim(),
          email: email.trim(),
          password,
        });

        setMessage("Account created! You can now sign in.");
        setIsRegister(false);
        setPassword("");
      } else {
        const res = await api.post("/auth/login", {
          email: email.trim(),
          password,
        });

        localStorage.setItem("token", res.data.token);

        if (onLogin) onLogin();

        navigate("/search");
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setError("This email is already registered.");
      } else if (isRegister) {
        setError(
          err.response?.data || "Registration failed. Please try again."
        );
      } else {
        setError("Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-black text-gray-200">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-violet-400 tracking-widest">
            GameShelf
          </div>
          <p className="text-gray-400 mt-2 text-sm">
            Discover. Review. Share your games.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-800 text-red-300 p-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-900/40 border border-green-800 text-green-300 p-2 rounded-lg mb-4 text-sm">
            {message}
          </div>
        )}

    {isRegister && (
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">
          Username
        </label>
        <input
          type="text"
          required
          className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 transition"
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
    )}

        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">
            Email
          </label>
          <input
            type="email"
            className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 transition"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-1">
            Password
          </label>
          <input
            type="password"
            className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 transition"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-medium transition ${
            loading
              ? "bg-slate-700 cursor-not-allowed"
              : "bg-violet-600 hover:bg-violet-700"
          }`}
        >
          {loading
            ? isRegister
              ? "Creating account..."
              : "Signing in..."
            : isRegister
              ? "Create Account"
              : "Sign In"}
        </button>

        <p className="text-center text-sm text-gray-400 mt-5">
          {isRegister ? "Already have an account?" : "New to GameShelf?"}{" "}
          <button
            type="button"
            className="text-violet-400 hover:text-violet-300 font-medium"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
              setMessage("");
            }}
          >
            {isRegister ? "Sign In" : "Sign Up"}
          </button>
        </p>

        <div className="text-center text-sm text-gray-500 mt-6">
          Built with ❤️ for gamers
        </div>
      </div>
    </div>
  );
}
