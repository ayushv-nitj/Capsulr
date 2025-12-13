"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn()) {
      router.push("/dashboard");
    }
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please provide email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Login failed");
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
localStorage.setItem("name", data.user.name);
localStorage.setItem("email", data.user.email);
localStorage.setItem("userId", data.user.id);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#f7fbff] via-[#eef8fa] to-[#f6f3ff]">
      <div className="relative w-full max-w-md p-8 rounded-3xl bg-white/70 backdrop-blur-md border border-white/30 shadow-xl">
        <div className="absolute -top-8 -right-10 w-40 h-40 rounded-full bg-linear-to-tr from-indigo-300 to-teal-200 opacity-30 blur-2xl pointer-events-none" />
        <h2 className="text-3xl font-extrabold text-gray-900">Welcome back</h2>
        <p className="text-sm text-gray-600 mt-1">Log in to continue to Capsulr</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="sr-only">Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm"
              aria-label="Email"
            />
          </div>

          <div>
            <label className="sr-only">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-300 shadow-sm"
              aria-label="Password"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-semibold shadow ${
              loading
                ? "bg-indigo-300 cursor-wait"
                : "bg-linear-to-r from-indigo-500 to-teal-400 hover:from-indigo-600 hover:to-teal-500"
            } transition`}
          >
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>

        <p className="text-sm text-center mt-5 text-gray-600">
          Don’t have an account?{" "}
          <a href="/register" className="text-indigo-600 font-medium hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
