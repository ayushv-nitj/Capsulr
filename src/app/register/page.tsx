"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";

export default function Register() {
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn()) {
      router.push("/dashboard");
    }
  }, []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Registration failed");
      }

      router.push("/login");
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#f7fbff] via-[#eef8fa] to-[#f6f3ff]">
      <div className="relative w-full max-w-md p-8 rounded-3xl bg-white/70 backdrop-blur-md border border-white/30 shadow-xl">
        <div className="absolute -top-8 -left-10 w-36 h-36 rounded-full bg-linear-to-tr from-pink-300 to-indigo-200 opacity-30 blur-2xl pointer-events-none" />

        <div className="mb-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-linear-to-r from-indigo-600 to-teal-400 text-transparent bg-clip-text leading-tight">
            Welcome to Capsulr
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Create an account and start preserving your most cherished memories.
          </p>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="sr-only">Full name</label>
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm"
              aria-label="Full name"
            />
          </div>

          <div>
            <label className="sr-only">Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-300 shadow-sm"
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
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm"
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
            {loading ? "Creating…" : "Register"}
          </button>
        </form>

        <p className="text-sm text-center mt-5 text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-600 font-medium hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
