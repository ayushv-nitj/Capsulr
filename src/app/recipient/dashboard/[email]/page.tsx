"use client";
import { API_URL } from "@/lib/api";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} | null;

function getTimeLeft(unlockAt: string): TimeLeft {
  const unlockTime = new Date(unlockAt).getTime();
  const now = Date.now();
  const diff = unlockTime - now;
  
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function RecipientDashboard() {
  const { email } = useParams();
  const router = useRouter();
  const [capsules, setCapsules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchCapsules = async () => {
      try {
        const res = await fetch(`${API_URL}/api/capsules/recipient-list/${email}`);
        if (res.ok) {
          const data = await res.json();
          setCapsules(data);
        }
      } catch (err) {
        console.error("Failed to fetch capsules");
      } finally {
        setLoading(false);
      }
    };

    fetchCapsules();
  }, [email]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading your capsules...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
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
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text mb-2">
            Your Time Capsules
          </h1>
          <p className="text-gray-400">Capsules shared with {email}</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-3xl">
                📦
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Capsules</p>
                <p className="text-3xl font-bold text-white">{capsules.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-3xl">
                🔒
              </div>
              <div>
                <p className="text-gray-400 text-sm">Locked</p>
                <p className="text-3xl font-bold text-white">
                  {capsules.filter(c => c.isLocked).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-3xl">
                🔓
              </div>
              <div>
                <p className="text-gray-400 text-sm">Unlocked</p>
                <p className="text-3xl font-bold text-white">
                  {capsules.filter(c => !c.isLocked).length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Capsules Grid */}
        {capsules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-32 h-32 mx-auto mb-6 bg-purple-500/10 rounded-full flex items-center justify-center text-6xl">
              📭
            </div>
            <h3 className="text-2xl font-bold mb-2">No capsules yet</h3>
            <p className="text-gray-400">You haven't been added to any capsules</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capsules.map((capsule, i) => {
              const timeLeft = capsule.isLocked && capsule.unlockAt ? getTimeLeft(capsule.unlockAt) : null;
              
              return (
                <CapsuleCard
                  key={capsule._id}
                  capsule={capsule}
                  timeLeft={timeLeft}
                  email={email as string}
                  index={i}
                  onClick={() => router.push(`/recipient/${capsule._id}/${email}`)}
                />
              );
            })}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
}

function CapsuleCard({ capsule, timeLeft, email, index, onClick }: any) {
  const gradients = [
    "from-pink-500 via-rose-500 to-orange-500",
    "from-indigo-500 via-purple-500 to-pink-500",
    "from-green-500 via-emerald-500 to-teal-500",
    "from-blue-500 via-cyan-500 to-sky-500",
    "from-violet-500 via-purple-500 to-fuchsia-500",
    "from-amber-500 via-orange-500 to-red-500",
  ];

  const gradient = gradients[index % gradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all"
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />

      {/* Content */}
      <div className="relative p-6 bg-slate-900/40 backdrop-blur-sm min-h-[280px] flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-2xl font-bold text-white flex-1 leading-tight">
              {capsule.title}
            </h3>
            {capsule.isLocked ? (
              <span className="px-3 py-1 rounded-full bg-red-500/20 border border-red-400/30 text-red-100 text-xs font-semibold backdrop-blur-sm">
                🔒 Locked
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-100 text-xs font-semibold backdrop-blur-sm">
                🔓 Open
              </span>
            )}
          </div>

          <p className="text-white/90 font-medium mb-2">{capsule.theme}</p>
          <p className="text-sm text-white/70 mb-4">
            From: {capsule.owner?.name || "Unknown"}
          </p>

          {/* Countdown */}
          {timeLeft && (
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <p className="text-xs text-white/70 mb-1">Unlocks in:</p>
              <div className="flex gap-2 text-white font-bold text-sm">
                <div className="flex flex-col items-center">
                  <span className="text-xl">{timeLeft.days}</span>
                  <span className="text-[10px] opacity-70">days</span>
                </div>
                <span className="text-xl">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-xl">{timeLeft.hours}</span>
                  <span className="text-[10px] opacity-70">hrs</span>
                </div>
                <span className="text-xl">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-xl">{timeLeft.minutes}</span>
                  <span className="text-[10px] opacity-70">min</span>
                </div>
                <span className="text-xl">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-xl">{timeLeft.seconds}</span>
                  <span className="text-[10px] opacity-70">sec</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-white/80 mt-4">
            {capsule.isLocked
              ? `Unlocks: ${new Date(capsule.unlockAt).toLocaleString()}`
              : "🔓 Available now - Click to view"}
          </p>
        </div>
      </div>

      {/* Hover Glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    </motion.div>
  );
}