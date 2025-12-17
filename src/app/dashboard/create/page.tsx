"use client";
import { API_URL } from "@/lib/api";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function CreateCapsule() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [unlockTime, setUnlockTime] = useState("12:00");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addRecipient = () => {
    if (!recipientEmail.trim()) return;
    if (recipients.includes(recipientEmail)) {
      setError("This email is already added");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      setError("Please enter a valid email");
      return;
    }
    setRecipients([...recipients, recipientEmail]);
    setRecipientEmail("");
    setError("");
  };

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter((r) => r !== email));
  };

  const submit = async (e?: React.FormEvent) => {
  e?.preventDefault();
  setError("");

  if (!title.trim() || !theme.trim() || !unlockDate) {
    setError("Please fill all required fields.");
    return;
  }

  setLoading(true);
  try {
    const token = localStorage.getItem("token");
    
    // Create date in local timezone, then convert to UTC
    const localDate = new Date(`${unlockDate}T${unlockTime}`);
    const unlockAt = localDate.toISOString();

    const res = await fetch(`${API_URL}/api/capsules`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token || "",
      },
      body: JSON.stringify({
        title,
        theme,
        unlockType: "date",
        unlockAt,
        recipients,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.message || "Failed to create capsule");
    }

    router.push("/dashboard");
  } catch (err: any) {
    setError(err?.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

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
      <div className="relative z-10 min-h-screen flex items-start justify-center p-6 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          {/* Back Button */}
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Dashboard</span>
          </motion.button>

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text mb-3">
              Create a Capsule
            </h1>
            <p className="text-gray-400">
              Seal your memories to be opened at the perfect moment
            </p>
          </div>

          {/* Form Card */}
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl"></div>

            <div className="relative bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
              <form onSubmit={submit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Graduation Memories 2025"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                </div>

                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Theme <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="e.g., Friendship, Travel, Family"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                </div>

                {/* Unlock Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Unlock Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={unlockDate}
                      onChange={(e) => setUnlockDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Unlock Time
                    </label>
                    <input
                      type="time"
                      value={unlockTime}
                      onChange={(e) => setUnlockTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    />
                  </div>
                </div>

                {/* Recipients */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Recipients (Optional)
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Recipients will be notified when the capsule unlocks and can view & react to memories
                  </p>

                  <div className="flex gap-2 mb-3">
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRecipient())}
                      className="flex-1 px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={addRecipient}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium shadow-lg hover:shadow-emerald-500/50 transition-all"
                    >
                      Add
                    </motion.button>
                  </div>

                  {/* Recipients List */}
                  {recipients.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-slate-800/30 border border-white/10">
                      {recipients.map((email) => (
                        <motion.span
                          key={email}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-100 text-sm"
                        >
                          <span>{email}</span>
                          <button
                            type="button"
                            onClick={() => removeRecipient(email)}
                            className="text-emerald-300 hover:text-emerald-100 transition"
                          >
                            ✕
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/20"
                  >
                    <p className="text-sm text-red-400">{error}</p>
                  </motion.div>
                )}

                {/* Buttons */}
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </span>
                    ) : (
                      "🎁 Create Capsule"
                    )}
                  </motion.button>
                </div>
              </form>

              <p className="text-xs text-gray-500 text-center mt-6">
                You can invite collaborators and add memories after creating the capsule
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}