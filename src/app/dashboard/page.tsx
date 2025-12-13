"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isLoggedIn } from "@/lib/auth";
import { getAvatarUrl } from "@/lib/avatar";

export default function Dashboard() {
  const router = useRouter();
  const [capsules, setCapsules] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [query, setQuery] = useState("");

  // logout handler
  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }

    // get email for avatar
    setEmail(localStorage.getItem("email") || "");

    const fetchCapsules = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/capsules", {
        headers: {
          Authorization: token || ""
        }
      });

      const data = await res.json();
      setCapsules(data);
    };

    fetchCapsules();
  }, []);

  const gradients = [
    "from-pink-400 via-red-400 to-yellow-400",
    "from-indigo-500 via-purple-500 to-pink-500",
    "from-green-400 via-teal-400 to-cyan-400",
    "from-rose-400 via-fuchsia-400 to-indigo-400",
    "from-yellow-300 via-amber-300 to-orange-300"
  ];

  const filtered = capsules.filter(c =>
    c.title?.toLowerCase().includes(query.toLowerCase()) ||
    c.theme?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Gradient Top Bar */}
      <div className="rounded-2xl overflow-hidden mb-8 shadow-lg">
        <div className="bg-linear-to-r from-pink-500 via-purple-500 to-indigo-600 p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/profile" className="block">
              <img
                src={getAvatarUrl(email)}
                alt="Profile"
                className="w-14 h-14 rounded-full border-2 border-white/30 shadow-sm hover:scale-105 transition-transform"
              />
            </Link>

            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white drop-shadow">
                Your Capsules
              </h1>
              <p className="text-sm text-white/90">
                Memories you created or collaborated on
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search capsules..."
              className="hidden md:block px-4 py-2 rounded-full bg-white/90 placeholder-gray-500 focus:outline-none w-64 shadow-sm"
            />

            <Link
              href="/dashboard/create"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold px-4 py-2 rounded-full shadow hover:shadow-lg transition"
            >
              + Create Capsule
            </Link>

            <button
              onClick={logout}
              className="ml-2 text-sm text-white/90 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-full transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Sub-header with search for small screens */}
        <div className="bg-white/5 p-4 flex items-center justify-between">
          <p className="text-sm text-white/70">Manage and explore your memories</p>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search capsules..."
            className="md:hidden px-3 py-2 rounded-full bg-white/90 placeholder-gray-500 focus:outline-none w-48"
          />
        </div>
      </div>

      {/* Capsules grid */}
      {filtered.length === 0 && (
        <p className="text-gray-500 text-center">No capsules found.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((c, i) => {
          const g = gradients[i % gradients.length];
          return (
            <Link
              key={c._id}
              href={`/dashboard/capsule/${c._id}`}
              className="relative rounded-2xl overflow-hidden group shadow-lg transform hover:-translate-y-1 transition"
            >
              <div className={`absolute inset-0 bg-linear-to-br ${g} opacity-90 group-hover:opacity-95`} />
              <div className="relative p-6 bg-white/60 backdrop-blur-sm min-h-40 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{c.title}</h3>
                  <p className="mt-1 text-sm font-medium text-gray-700">{c.theme}</p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-gray-800">Unlocks on {new Date(c.unlockAt).toDateString()}</p>
                  <span className="text-xs px-3 py-1 rounded-full bg-white/70 text-gray-900 font-semibold">
                    {c.collaborators?.length || 0} collaborators
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
