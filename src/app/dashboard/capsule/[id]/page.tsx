"use client";
import { API_URL } from "@/lib/api";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAvatarUrl } from "@/lib/avatar";
import { motion, AnimatePresence } from "framer-motion";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

type Memory = {
  _id: string;
  type: "text" | "image" | "audio" | "video";
  content: string;
  caption?: string;
  createdAt?: string;
};

type Collaborator = {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
};

type UserMini = {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
};

type Capsule = {
  _id: string;
  title?: string;
  theme?: string;
  unlockAt?: string;
  isLocked?: boolean;
  owner?: UserMini;
  contributors?: UserMini[];
  recipients?: string[];
};

type Reaction = {
  _id: string;
  emoji: string;
  userName: string;
  userEmail: string;
};

type Comment = {
  _id: string;
  text: string;
  userName: string;
  userEmail: string;
  createdAt: string;
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} | null;

function getTimeLeft(unlockAt: string): TimeLeft {
  const diff = +new Date(unlockAt) - +new Date();
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds };
}

export default function CapsulePage() {
  const { id } = useParams();
  const router = useRouter();

  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [content, setContent] = useState("");

  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "audio" | "video" | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaCaption, setMediaCaption] = useState("");

  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState("");

  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);

  const [collabEmail, setCollabEmail] = useState("");
  const [addingCollab, setAddingCollab] = useState(false);

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  // Reactions & Comments state
  const [memoryReactions, setMemoryReactions] = useState<{ [key: string]: Reaction[] }>({});
  const [memoryComments, setMemoryComments] = useState<{ [key: string]: Comment[] }>({});
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const currentUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const currentUserName = typeof window !== "undefined" ? localStorage.getItem("name") : null;
  const currentUserEmail = typeof window !== "undefined" ? localStorage.getItem("email") : null;

  const isOwner = capsule?.owner?._id === currentUserId;
  const isContributor = capsule?.contributors?.some((c: any) => c._id === currentUserId);
  const canEdit = (isOwner || isContributor) ?? false;
  const isRecipient = capsule?.recipients?.includes(currentUserEmail || "") ?? false;

  const fetchCapsule = async () => {
    const res = await fetch(`${API_URL}/api/capsules/${id}`, {
      headers: { Authorization: token || "" },
    });
    if (res.ok) {
      const data = await res.json();
      setCapsule({
        ...data,
        isLocked: data.isLocked ?? false,
      });
      setRecipients(data.recipients || []);
    }
  };

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/memories/${id}`, {
        headers: { Authorization: token || "" },
      });
      const data = await res.json();
      setMemories(data);

      // Fetch reactions and comments for each memory
      for (const memory of data) {
        fetchReactionsForMemory(memory._id);
        fetchCommentsForMemory(memory._id);
      }
    } finally {
      setLoading(false);
    }
  };
// Replace your fetchReactionsForMemory and fetchCommentsForMemory functions with these:

const fetchReactionsForMemory = async (memoryId: string) => {
  try {
    const res = await fetch(`${API_URL}/api/reactions/${memoryId}`);
    
    // Check if response is ok
    if (!res.ok) {
      console.error(`Failed to fetch reactions: ${res.status} ${res.statusText}`);
      // Set empty array on error so UI doesn't break
      setMemoryReactions((prev) => ({ ...prev, [memoryId]: [] }));
      return;
    }
    
    const data = await res.json();
    setMemoryReactions((prev) => ({ ...prev, [memoryId]: data }));
  } catch (err) {
    console.error("Failed to fetch reactions:", err);
    // Set empty array on error so UI doesn't break
    setMemoryReactions((prev) => ({ ...prev, [memoryId]: [] }));
  }
};

const fetchCommentsForMemory = async (memoryId: string) => {
  try {
    const res = await fetch(`${API_URL}/api/comments/${memoryId}`);
    
    // Check if response is ok
    if (!res.ok) {
      console.error(`Failed to fetch comments: ${res.status} ${res.statusText}`);
      // Set empty array on error so UI doesn't break
      setMemoryComments((prev) => ({ ...prev, [memoryId]: [] }));
      return;
    }
    
    const data = await res.json();
    setMemoryComments((prev) => ({ ...prev, [memoryId]: data }));
  } catch (err) {
    console.error("Failed to fetch comments:", err);
    // Set empty array on error so UI doesn't break
    setMemoryComments((prev) => ({ ...prev, [memoryId]: [] }));
  }
};
  const addReaction = async (memoryId: string, emoji: string) => {
    if (!isRecipient && !canEdit) return;

    try {
      await fetch(`${API_URL}/api/reactions?email=${currentUserEmail}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memoryId,
          emoji,
          userName: currentUserName,
        }),
      });

      fetchReactionsForMemory(memoryId);
    } catch (err) {
      console.error("Failed to add reaction");
    }
  };

  const addComment = async (memoryId: string) => {
    if (!commentText[memoryId]?.trim()) return;
    if (!isRecipient && !canEdit) return;

    try {
      await fetch(`${API_URL}/api/comments?email=${currentUserEmail}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memoryId,
          text: commentText[memoryId],
          userName: currentUserName,
        }),
      });

      setCommentText({ ...commentText, [memoryId]: "" });
      fetchCommentsForMemory(memoryId);
    } catch (err) {
      console.error("Failed to add comment");
    }
  };

  useEffect(() => {
    fetchCapsule();
    fetchMemories();
  }, [id]);

  useEffect(() => {
    if (!capsule?.unlockAt || !capsule?.isLocked) return;

    setTimeLeft(getTimeLeft(capsule.unlockAt as string));

    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(capsule.unlockAt as string));
    }, 1000);

    return () => clearInterval(interval);
  }, [capsule?.unlockAt, capsule?.isLocked]);

  const addCollaborator = async () => {
    if (!collabEmail.trim()) return;

    setAddingCollab(true);
    try {
      await fetch(`${API_URL}/api/capsules/${id}/collaborators`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify({ email: collabEmail }),
      });

      setCollabEmail("");
      await fetchCapsule();
    } finally {
      setAddingCollab(false);
    }
  };

  useEffect(() => {
    if (!mediaFile) {
      setMediaPreview(null);
      return;
    }
    const url = URL.createObjectURL(mediaFile);
    setMediaPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [mediaFile]);

  const addMemory = async () => {
    if (!content.trim()) return;

    setAdding(true);
    try {
      await fetch(`${API_URL}/api/memories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify({ capsuleId: id, content }),
      });
      setContent("");
      await fetchMemories();
    } finally {
      setAdding(false);
    }
  };

  const uploadMedia = async () => {
    if (!mediaFile || !mediaType) return;

    setUploading(true);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", mediaFile);
      formData.append("capsuleId", id as string);
      formData.append("type", mediaType);
      formData.append("caption", mediaCaption);

      await fetch(`${API_URL}/api/memories/media`, {
        method: "POST",
        headers: { Authorization: token || "" },
        body: formData,
      });

      setMediaFile(null);
      setMediaPreview(null);
      setMediaCaption("");
      setUploadSuccess(true);

      setTimeout(() => setUploadSuccess(false), 2500);

      await fetchMemories();
    } finally {
      setUploading(false);
    }
  };

  const deleteMemory = async (memoryId: string) => {
    if (!confirm("Delete this memory permanently?")) return;

    await fetch(`${API_URL}/api/memories/${memoryId}`, {
      method: "DELETE",
      headers: { Authorization: token || "" },
    });
    await fetchMemories();
  };

  const addRecipient = () => {
    if (!recipientEmail.trim()) return;
    if (recipients.includes(recipientEmail)) return;

    setRecipients([...recipients, recipientEmail]);
    setRecipientEmail("");
  };

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter((r) => r !== email));
  };

const saveRecipients = async () => {
  const oldRecipients = capsule?.recipients || [];
  const newRecipients = recipients.filter(r => !oldRecipients.includes(r));

  await fetch(`${API_URL}/api/capsules/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: token || "",
    },
    body: JSON.stringify({ recipients }),
  });

  // Notify newly added recipients
  if (newRecipients.length > 0) {
    await fetch(`${API_URL}/api/capsules/${id}/notify-recipients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token || "",
      },
      body: JSON.stringify({ newRecipients }),
    });
  }

  alert("Recipients saved & notified!");
  await fetchCapsule();
};

  if (!capsule) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading capsule…</div>
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
      <div className="relative z-10 p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Dashboard</span>
          </motion.button>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">{memories.length} memories</span>
            {capsule.isLocked ? (
              <span className="px-3 py-1 rounded-full bg-red-500/20 border border-red-400/30 text-red-300 text-xs font-semibold">
                🔒 Locked
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                🔓 Unlocked
              </span>
            )}
          </div>
        </div>

        {/* Capsule Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl"></div>

          <div className="relative bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text mb-2">
              {capsule.title}
            </h1>
            <p className="text-gray-400 text-lg mb-4">{capsule.theme}</p>

         <div className="flex items-center gap-4 text-sm text-gray-400">
  {capsule.unlockAt && (
    <>
<span className="text-sm text-gray-400">
  {capsule.isLocked && capsule.unlockAt
    ? `Unlocks: ${new Date(capsule.unlockAt).toLocaleString()}`
    : "🔓 Available now"}
</span>      <span>•</span>
    </>
  )}
  <span>{capsule.contributors?.length || 0} collaborators</span>
  <span>•</span>
  <span>{capsule.recipients?.length || 0} recipients</span>
</div>
          </div>
        </motion.div>

        {/* Admin + Collaborators + Recipients (Only for Owner/Contributors) */}
        {canEdit && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Admin */}
            {capsule?.owner && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
              >
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>👑</span>
                  <span>Admin</span>
                </h4>

                <div className="flex items-center gap-4">
                  <img
                    src={capsule.owner.profileImage || getAvatarUrl(capsule.owner.email)}
                    className="w-12 h-12 rounded-full border-2 border-purple-500/30 object-cover"
                    alt={capsule.owner.name}
                  />
                  <div>
                    <p className="font-semibold text-white">{capsule.owner.name}</p>
                    <p className="text-sm text-gray-400">{capsule.owner.email}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Collaborators */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
            >
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>👥</span>
                <span>Collaborators</span>
              </h4>

              {capsule?.contributors?.length ? (
                <div className="space-y-3 max-h-32 overflow-y-auto">
                  {capsule.contributors.map((u) => (
                    <div key={u._id} className="flex items-center gap-3">
                      <img
                        src={u.profileImage || getAvatarUrl(u.email)}
                        className="w-10 h-10 rounded-full border object-cover"
                        alt={u.name}
                      />
                      <div>
                        <p className="text-sm font-medium text-white">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No collaborators yet</p>
              )}
            </motion.div>
          </div>
        )}

        {/* Add Collaborator (Owner only) */}
        {isOwner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6"
          >
            <h4 className="text-lg font-semibold mb-4">Add Collaborator</h4>

            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Collaborator email"
                value={collabEmail}
                onChange={(e) => setCollabEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addCollaborator}
                disabled={addingCollab}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold disabled:opacity-50"
              >
                {addingCollab ? "Adding…" : "Add"}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Add Recipients (Owner only) */}
        {isOwner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6"
          >
            <h4 className="text-lg font-semibold mb-2">Recipients</h4>
            <p className="text-sm text-gray-400 mb-4">
              Recipients will be notified when the capsule unlocks and can view & react to memories
            </p>

            <div className="flex gap-3 mb-4">
              <input
                type="email"
                placeholder="Recipient email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRecipient())}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addRecipient}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-semibold"
              >
                Add
              </motion.button>
            </div>

            {recipients.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 p-4 rounded-xl bg-slate-800/30 border border-white/10">
                {recipients.map((email) => (
                  <span
                    key={email}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-100 text-sm"
                  >
                    {email}
                    <button
                      onClick={() => removeRecipient(email)}
                      className="text-emerald-300 hover:text-emerald-100 transition"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={saveRecipients}
              className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition-colors"
            >
              Save Recipients
            </motion.button>
          </motion.div>
        )}

        {/* Locked Capsule View */}
        {capsule?.isLocked && !canEdit && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>

            <div className="relative p-10 rounded-3xl border-2 border-purple-500/20 bg-slate-900/50 backdrop-blur-xl text-center shadow-2xl">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-4xl shadow-lg">
                🔒
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">Capsule Locked</h3>

            <p className="text-gray-400 mb-6">
  This capsule will unlock on:<br />
  <strong className="text-white text-lg">
    {new Date(capsule.unlockAt || "").toLocaleString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}
  </strong>
</p>
              {timeLeft ? (
                <div className="max-w-md mx-auto">
                  <p className="text-sm text-purple-400 mb-4 font-semibold">Time Remaining:</p>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-white/10">
                      <div className="text-4xl font-bold text-white mb-1">{timeLeft.days}</div>
                      <div className="text-xs text-gray-400 uppercase">Days</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-white/10">
                      <div className="text-4xl font-bold text-white mb-1">{timeLeft.hours}</div>
                      <div className="text-xs text-gray-400 uppercase">Hours</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-white/10">
                      <div className="text-4xl font-bold text-white mb-1">{timeLeft.minutes}</div>
                      <div className="text-xs text-gray-400 uppercase">Minutes</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-white/10">
                      <div className="text-4xl font-bold text-white mb-1">{timeLeft.seconds}</div>
                      <div className="text-xs text-gray-400 uppercase">Seconds</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <p className="text-emerald-400 font-semibold">🔓 Unlocking very soon...</p>
                </div>
              )}

              <p className="text-sm text-gray-500 mt-6">
                You'll receive an email notification when this capsule unlocks
              </p>
            </div>
          </motion.div>
        )}

        {/* Composer (Owner/Contributors only) */}
        {canEdit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8 shadow-xl"
          >
            <h4 className="text-lg font-semibold mb-4">Add a Memory</h4>

            <ReactQuill
              value={content}
              onChange={setContent}
              modules={quillModules}
              placeholder="Write a memory..."
              className="bg-slate-800/30 rounded-xl mb-4"
              theme="snow"
            />

            <p className="text-sm text-gray-400 mt-4 mb-2">Or upload media</p>

            <div className="flex flex-wrap gap-3 mb-4">
              {["image", "audio", "video"].map((type) => (
                <label
                  key={type}
                  className="cursor-pointer px-4 py-2 rounded-xl bg-slate-800/50 border border-white/10 text-sm text-white flex items-center gap-2 hover:bg-slate-700/50 transition"
                >
                  {type === "image" && <>🖼 Image</>}
                  {type === "audio" && <>🎧 Audio</>}
                  {type === "video" && <>🎥 Video</>}

                  <input
                    hidden
                    type="file"
                    accept={`${type}/*`}
                    onChange={(e) => {
                      setMediaFile(e.target.files?.[0] || null);
                      setMediaType(type as any);
                      setUploadSuccess(false);
                    }}
                  />
                </label>
              ))}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={uploadMedia}
                disabled={!mediaFile || uploading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center gap-2 disabled:opacity-50"
              >
{uploading && (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            Upload
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addMemory}
            disabled={!content.trim() || adding}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white disabled:opacity-50"
          >
            {adding ? "Adding…" : "Add Memory"}
          </motion.button>
        </div>

        {/* Media Preview */}
        {mediaPreview && (
          <div className="mt-4 p-4 border border-white/10 rounded-xl bg-slate-800/30 space-y-3">
            {mediaType === "image" && <img src={mediaPreview} className="w-40 rounded-lg" alt="Preview" />}

            {mediaType === "audio" && (
              <audio controls className="w-full">
                <source src={mediaPreview} />
              </audio>
            )}

            {mediaType === "video" && (
              <video controls className="w-full max-h-60 rounded-lg">
                <source src={mediaPreview} />
              </video>
            )}

            <input
              type="text"
              placeholder="Add a caption (optional)"
              value={mediaCaption}
              onChange={(e) => setMediaCaption(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />

            <button
              onClick={() => {
                setMediaFile(null);
                setMediaPreview(null);
                setMediaCaption("");
              }}
              className="text-xs text-red-400 hover:underline"
            >
              Remove
            </button>
          </div>
        )}
      </motion.div>
    )}

  {/* Memories */}
    {(canEdit || (isRecipient && !capsule?.isLocked)) && (
      <div className="space-y-6">
        {loading ? (
          <p className="text-gray-400 text-center py-8">Loading memories…</p>
        ) : memories.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-purple-500/10 rounded-full flex items-center justify-center text-4xl">
              📝
            </div>
            <p className="text-gray-400">No memories yet. {canEdit && "Add the first one!"}</p>
          </div>
        ) : (
          memories.map((m) => (
            <MemoryCard
              key={m._id}
              memory={m}
              canEdit={canEdit}
              isRecipient={isRecipient}
              isUnlocked={!capsule?.isLocked}
              reactions={memoryReactions[m._id] || []}
              comments={memoryComments[m._id] || []}
              commentText={commentText[m._id] || ""}
              onAddReaction={(emoji) => addReaction(m._id, emoji)}
              onAddComment={() => addComment(m._id)}
              onCommentTextChange={(text) => setCommentText({ ...commentText, [m._id]: text })}
              onDelete={() => deleteMemory(m._id)}
              currentUserEmail={currentUserEmail || ""}
            />
          ))
        )}
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

    /* Quill Editor Dark Theme */
    .ql-toolbar {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      border-radius: 12px 12px 0 0;
    }
    .ql-container {
      background: rgba(30, 41, 59, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      border-radius: 0 0 12px 12px;
      color: white;
    }
    .ql-editor {
      min-height: 150px;
      color: white;
    }
    .ql-editor.ql-blank::before {
      color: rgba(156, 163, 175, 0.5);
    }
    .ql-stroke {
      stroke: rgba(255, 255, 255, 0.7) !important;
    }
    .ql-fill {
      fill: rgba(255, 255, 255, 0.7) !important;
    }
    .ql-picker-label {
      color: rgba(255, 255, 255, 0.7) !important;
    }
  `}</style>
</div>

);
}
// ========== MEMORY CARD COMPONENT ==========
function MemoryCard({
memory,
canEdit,
isRecipient,
isUnlocked,
reactions,
comments,
commentText,
onAddReaction,
onAddComment,
onCommentTextChange,
onDelete,
currentUserEmail,
}: {
memory: Memory;
canEdit: boolean;
isRecipient: boolean;
isUnlocked: boolean;
reactions: Reaction[];
comments: Comment[];
commentText: string;
onAddReaction: (emoji: string) => void;
onAddComment: () => void;
onCommentTextChange: (text: string) => void;
onDelete: () => void;
currentUserEmail: string;
}) {
const [showComments, setShowComments] = useState(false);
const canInteract = (isRecipient || canEdit) && isUnlocked;
const emojiOptions = ["❤️", "👍", "😂", "😮", "😢", "🔥"];
// Group reactions by emoji
const groupedReactions = reactions.reduce((acc, r) => {
if (!acc[r.emoji]) acc[r.emoji] = [];
acc[r.emoji].push(r);
return acc;
}, {} as { [emoji: string]: Reaction[] });
return (
<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl"
>
{/* Memory Content */}
{memory.type === "text" && (
<div
className="prose prose-invert max-w-none mb-4"
dangerouslySetInnerHTML={{ __html: memory.content }}
/>
)}
{memory.type === "image" && (
    <div className="space-y-2">
      {memory.caption && <p className="text-sm font-medium text-gray-300">{memory.caption}</p>}
      <img src={memory.content} className="rounded-xl max-h-96 w-full object-cover" alt="Memory" />
    </div>
  )}

  {memory.type === "audio" && (
    <div className="space-y-2">
      {memory.caption && <p className="text-sm font-medium text-gray-300">{memory.caption}</p>}
      <audio controls className="w-full">
        <source src={memory.content} />
      </audio>
    </div>
  )}

  {memory.type === "video" && (
    <div className="space-y-2">
      {memory.caption && <p className="text-sm font-medium text-gray-300">{memory.caption}</p>}
      <video controls className="w-full rounded-xl">
        <source src={memory.content} />
      </video>
    </div>
  )}

  {/* Reactions Bar */}
  {canInteract && (
    <div className="mt-4 pt-4 border-t border-white/10">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {emojiOptions.map((emoji) => {
          const count = groupedReactions[emoji]?.length || 0;
          const userReacted = groupedReactions[emoji]?.some((r) => r.userEmail === currentUserEmail);

          return (
            <motion.button
              key={emoji}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onAddReaction(emoji)}
              className={`px-3 py-1.5 rounded-full border transition-all ${
                userReacted
                  ? "bg-purple-500/30 border-purple-400/50"
                  : "bg-slate-800/50 border-white/10 hover:bg-slate-700/50"
              }`}
            >
              <span className="text-lg">{emoji}</span>
              {count > 0 && <span className="ml-1 text-xs text-gray-300">{count}</span>}
            </motion.button>
          );
        })}
      </div>

      {/* Comments Toggle */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowComments(!showComments)}
        className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
      >
        💬 {comments.length} {comments.length === 1 ? "comment" : "comments"}
      </motion.button>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-3"
          >
            {/* Comments List */}
            {comments.map((c) => (
              <div key={c._id} className="p-3 bg-slate-800/30 rounded-xl border border-white/10">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-semibold text-purple-400">{c.userName}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm text-gray-300">{c.text}</p>
              </div>
            ))}

            {/* Add Comment */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => onCommentTextChange(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && onAddComment()}
                className="flex-1 px-4 py-2 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAddComment}
                disabled={!commentText.trim()}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                Post
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )}

  {/* Footer */}
  <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
    <span className="text-xs text-gray-400">
      {memory.createdAt && new Date(memory.createdAt).toLocaleString()}
    </span>
    {canEdit && (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onDelete}
        className="px-3 py-1.5 rounded-full text-sm font-medium bg-red-500/20 border border-red-400/30 text-red-300 hover:bg-red-500/30 transition"
      >
        Delete
      </motion.button>
    )}
  </div>
</motion.div>
)}