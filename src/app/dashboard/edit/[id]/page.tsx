"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function EditCapsule() {
  const { id } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [unlockTime, setUnlockTime] = useState("12:00");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchCapsule = async () => {
      const res = await fetch(`http://localhost:5000/api/capsules/${id}`, {
        headers: { Authorization: token || "" },
      });

      const data = await res.json();

      setTitle(data.title || "");
      setTheme(data.theme || "");

     if (data.unlockAt) {
  const d = new Date(data.unlockAt);
  // Get local date/time for editing
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  setUnlockDate(`${year}-${month}-${day}`);
  setUnlockTime(`${hours}:${minutes}`);
}

      setRecipients(data.recipients || []);
      setLoading(false);
    };

    fetchCapsule();
  }, [id]);

  const addRecipient = () => {
    if (!recipientEmail.trim()) return;
    if (recipients.includes(recipientEmail)) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) return;

    setRecipients([...recipients, recipientEmail]);
    setRecipientEmail("");
  };

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter((r) => r !== email));
  };

  const updateCapsule = async () => {
  setSaving(true);
  const localDate = new Date(`${unlockDate}T${unlockTime}`);
  const unlockAt = localDate.toISOString();

  await fetch(`http://localhost:5000/api/capsules/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: token || "",
    },
    body: JSON.stringify({
      title,
      theme,
      unlockAt,
      recipients,
    }),
  });

  setSaving(false);
  router.push("/dashboard");
};


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading capsule...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
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
              Edit Capsule
            </h1>
            <p className="text-gray-400">Update your capsule details</p>
          </div>

          {/* Form Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>

            <div className="relative bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                </div>

                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                  <input
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                </div>

                {/* Unlock Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Unlock Date</label>
                    <input
                      type="date"
                      value={unlockDate}
                      onChange={(e) => setUnlockDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Unlock Time</label>
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">Recipients</label>

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
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium shadow-lg"
                    >
                      Add
                    </motion.button>
                  </div>

                  {/* Recipients List */}
                  {recipients.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-slate-800/30 border border-white/10">
                      {recipients.map((email) => (
                        <span
                          key={email}
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
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={updateCapsule}
                  disabled={saving}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50"
                >
                  {saving ? "Saving..." : "💾 Save Changes"}
                </motion.button>
              </div>
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
      `}</style>
    </div>
  );
}