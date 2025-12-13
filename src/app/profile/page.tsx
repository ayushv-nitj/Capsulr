"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAvatarUrl } from "@/lib/avatar";

export default function Profile() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
 const username = email.split("@")[0];

  useEffect(() => {
    setEmail(localStorage.getItem("email") || "");
    setName(localStorage.getItem("name") || "");
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white"
        aria-label="Back to dashboard"
      >
        <span className="text-xl">←</span>
        Back to Dashboard
      </button>

      <div className="flex items-center gap-6 mb-8">
        <img
          src={getAvatarUrl(email)}
          alt={`${name} avatar`}
          className="w-24 h-24 rounded-full border"
        />

        <div>
          <h2 className="text-2xl font-bold text-gray-300">{name}</h2>
          <p className="text-gray-500">{username}</p>
        </div>
      </div>

      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Your Capsules</h3>
        <p className="text-sm text-gray-500">
          Capsules you created or contributed to
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Collaborators</h3>
        <p className="text-sm text-gray-500">
          People you have shared memories with
        </p>
      </section>
    </div>
  );
}
