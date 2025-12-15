"use client";
import { API_URL } from "@/lib/api";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isLoggedIn } from "@/lib/auth";
import { getAvatarUrl } from "@/lib/avatar";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();
  const [capsules, setCapsules] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "locked" | "unlocked">("all");

  // tick state so countdowns update each second
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

function getTimeLeft(unlockAt: string) {
  const unlockTime = new Date(unlockAt).getTime();
  const now = Date.now();
  const diff = unlockTime - now;
  
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds };
}
  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }

    const storedName = localStorage.getItem("name") || "";
    const storedEmail = localStorage.getItem("email") || "";
    const img = localStorage.getItem("profileImage");

    setName(storedName);
    setEmail(storedEmail);
    setProfileImage(img);

    const fetchCapsules = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/capsules`), {
        headers: {
          Authorization: token || "",
        },
      });

      const data = await res.json();
      setCapsules(data);
    };

    fetchCapsules();
  }, []);

  const gradients = [
    "from-pink-500 via-rose-500 to-orange-500",
    "from-indigo-500 via-purple-500 to-pink-500",
    "from-green-500 via-emerald-500 to-teal-500",
    "from-blue-500 via-cyan-500 to-sky-500",
    "from-violet-500 via-purple-500 to-fuchsia-500",
    "from-amber-500 via-orange-500 to-red-500",
  ];

  const filtered = capsules.filter((c) => {
    const matchesQuery =
      c.title?.toLowerCase().includes(query.toLowerCase()) ||
      c.theme?.toLowerCase().includes(query.toLowerCase());
    
    if (filterStatus === "locked") return matchesQuery && c.isLocked;
    if (filterStatus === "unlocked") return matchesQuery && !c.isLocked;
    return matchesQuery;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Top Section */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Left: Profile & Branding */}
                <div className="flex items-center gap-4">
                  <Link href="/profile" className="block group">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative"
                    >
                      <img
                        src={profileImage || getAvatarUrl(email)}
                        alt="Profile"
                        className="w-16 h-16 rounded-full border-4 border-white/30 shadow-lg object-cover"
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </motion.div>
                  </Link>

                  <div>
                    <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">
                      Welcome back, {name.split(" ")[0]}! 👋
                    </h1>
                    <p className="text-white/80 text-sm">
                      {capsules.length} capsule{capsules.length !== 1 ? "s" : ""} • {filtered.filter(c => c.isLocked).length} locked
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push("/dashboard/create")}
                    className="flex items-center gap-2 bg-white text-purple-600 font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Capsule
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={logout}
                    className="text-white/90 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-full transition backdrop-blur-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Bottom Section: Search & Filters */}
            <div className="p-6 bg-slate-900/30 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search capsules by title or theme..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2">
                  {["all", "locked", "unlocked"].map((status) => (
                    <motion.button
                      key={status}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFilterStatus(status as any)}
                      className={`px-6 py-3 rounded-xl font-medium transition-all ${
                        filterStatus === status
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                          : "bg-slate-800/50 text-gray-300 hover:bg-slate-700/50 border border-white/10"
                      }`}
                    >
                      {status === "all" && "All"}
                      {status === "locked" && "🔒 Locked"}
                      {status === "unlocked" && "🔓 Unlocked"}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <StatsCard
            icon="📦"
            label="Total Capsules"
            value={capsules.length}
            gradient="from-blue-500 to-cyan-500"
          />
          <StatsCard
            icon="🔒"
            label="Locked"
            value={capsules.filter((c) => c.isLocked).length}
            gradient="from-purple-500 to-pink-500"
          />
          <StatsCard
            icon="🔓"
            label="Unlocked"
            value={capsules.filter((c) => !c.isLocked).length}
            gradient="from-emerald-500 to-teal-500"
          />
        </motion.div>

        {/* Capsules Grid */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center text-6xl">
              📭
            </div>
            <h3 className="text-2xl font-bold mb-2">No capsules found</h3>
            <p className="text-gray-400 mb-6">
              {query ? "Try a different search term" : "Create your first time capsule to get started"}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/dashboard/create")}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold shadow-lg"
            >
              Create Your First Capsule
            </motion.button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map((c, i) => {
              const g = gradients[i % gradients.length];
              return (
                <CapsuleCard
                  key={c._id}
                  capsule={c}
                  gradient={g}
                  index={i}
                  getTimeLeft={getTimeLeft}
                  onDelete={async () => {
                    if (!confirm("Delete this capsule permanently?")) return;

                    const token = localStorage.getItem("token");
                    await fetch(`http://localhost:5000/api/capsules/${c._id}`, {
                      method: "DELETE",
                      headers: { Authorization: token || "" },
                    });

                    setCapsules((prev) => prev.filter((x) => x._id !== c._id));
                  }}
                  onClick={() => router.push(`/dashboard/capsule/${c._id}`)}
                />
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style> */}
    </div>
  );
}

// ========== HELPER COMPONENTS ==========

function StatsCard({
  icon,
  label,
  value,
  gradient,
}: {
  icon: string;
  label: string;
  value: number;
  gradient: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl"
    >
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-3xl shadow-lg`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

function CapsuleCard({
  capsule,
  gradient,
  index,
  getTimeLeft,
  onDelete,
  onClick,
}: any) {
  // Force re-render every second for countdown
  const [tick, setTick] = useState(0);
  
  useEffect(() => {
    if (capsule.isLocked && capsule.unlockAt) {
      const interval = setInterval(() => {
        setTick(t => t + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [capsule.isLocked, capsule.unlockAt]);

  const timeLeft = capsule.isLocked && capsule.unlockAt ? getTimeLeft(capsule.unlockAt) : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all"
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />

      {/* Content */}
      <div className="relative p-6 bg-slate-900/40 backdrop-blur-sm min-h-70 flex flex-col justify-between">
        {/* Top Section */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-2xl font-bold text-white flex-1 leading-tight">
              {capsule.title}
            </h3>
            {capsule.isLocked && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 border border-red-400/30 text-red-100 text-xs font-semibold backdrop-blur-sm">
                🔒 Locked
              </span>
            )}
            {!capsule.isLocked && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-100 text-xs font-semibold backdrop-blur-sm">
                🔓 Open
              </span>
            )}
          </div>

          <p className="text-white/90 font-medium mb-4">{capsule.theme}</p>

          {/* Countdown */}
          {timeLeft && (
            <div className="mb-4 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <p className="text-xs text-white/70 mb-1">Unlocks in:</p>
              <div className="flex gap-2 text-white font-bold">
                <div className="flex flex-col items-center">
                  <span className="text-2xl">{timeLeft.days}</span>
                  <span className="text-xs opacity-70">days</span>
                </div>
                <span className="text-2xl">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-2xl">{timeLeft.hours}</span>
                  <span className="text-xs opacity-70">hrs</span>
                </div>
                <span className="text-2xl">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-2xl">{timeLeft.minutes}</span>
                  <span className="text-xs opacity-70">min</span>
                </div>
                <span className="text-2xl">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-2xl">{timeLeft.seconds}</span>
                  <span className="text-xs opacity-70">sec</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-white/80">
              {capsule.isLocked
                ? `Unlocks: ${new Date(capsule.unlockAt).toLocaleDateString()}`
                : "🔓 Available now"}
            </p>
            <span className="text-sm px-3 py-1 rounded-full bg-white/20 text-white font-semibold backdrop-blur-sm">
              {capsule.contributors?.length || 0} 👥
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Link
              href={`/dashboard/edit/${capsule._id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 text-center py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition backdrop-blur-sm border border-white/20"
            >
              ✏️ Edit
            </Link>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex-1 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-white text-sm font-medium transition backdrop-blur-sm border border-red-400/30"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>

      {/* Hover Glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    </motion.div>
  );
}