"use client";

import { useState , useEffect } from "react";
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

  const submit = async () => {
    await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    alert("Registered");
    router.push("/login"); 
  };

return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="bg-white w-full max-w-sm rounded-2xl shadow-lg p-6">

      <h2 className="text-2xl font-bold text-gray-900 mb-1">
        Create an account
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Start preserving memories with Capsulr
      </p>

      <input
        type="text"
        placeholder="Full name"
        className="
          w-full
          border
          border-gray-300
          rounded-lg
          p-3
          mb-3
          text-gray-900
          placeholder-gray-400
          focus:outline-none
          focus:ring-2
          focus:ring-indigo-500
        "
        onChange={e => setName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email"
        className="
          w-full
          border
          border-gray-300
          rounded-lg
          p-3
          mb-3
          text-gray-900
          placeholder-gray-400
          focus:outline-none
          focus:ring-2
          focus:ring-indigo-500
        "
        onChange={e => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="
          w-full
          border
          border-gray-300
          rounded-lg
          p-3
          mb-5
          text-gray-900
          placeholder-gray-400
          focus:outline-none
          focus:ring-2
          focus:ring-indigo-500
        "
        onChange={e => setPassword(e.target.value)}
      />

      <button
        onClick={submit}
        className="
          w-full
          bg-indigo-600
          text-white
          py-3
          rounded-lg
          font-medium
          hover:bg-indigo-700
          transition
        "
      >
        Register
      </button>

      <p className="text-sm text-center mt-4 text-gray-500">
        Already have an account?{" "}
        <a
          href="/login"
          className="text-indigo-600 font-medium hover:underline"
        >
          Login
        </a>
      </p>
    </div>
  </div>
);

}
