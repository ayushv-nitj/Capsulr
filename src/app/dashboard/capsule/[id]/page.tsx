"use client";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

/* -------------------- Quill Setup -------------------- */
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

/* -------------------- Types -------------------- */
type Memory = {
  _id: string;
  type: "text" | "image" | "audio" | "video";
  content: string;
  caption?: string;
  createdAt?: string;
};


type Capsule = {
  _id: string;
  title?: string;
  theme?: string;
  unlockAt?: string;
  isLocked?: boolean;
};



function getTimeLeft(unlockAt: string) {
  const diff = +new Date(unlockAt) - +new Date();
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  return { days, hours, minutes };
}

/* -------------------- Component -------------------- */
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

  const [timeLeft, setTimeLeft] = useState<any>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  /* -------------------- Fetch Capsule -------------------- */
  const fetchCapsule = async () => {
    const res = await fetch(`http://localhost:5000/api/capsules/${id}`, {
      headers: { Authorization: token || "" },
    });
    if (res.ok) setCapsule(await res.json());
  };

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/memories/${id}`, {
        headers: { Authorization: token || "" },
      });
      setMemories(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapsule();
    fetchMemories();
  }, [id]);

// 🔽 (COUNTDOWN EFFECT)
useEffect(() => {
  if (!capsule?.unlockAt || !capsule?.isLocked || typeof capsule.unlockAt !== "string") return;

  setTimeLeft(getTimeLeft(capsule.unlockAt));

  const interval = setInterval(() => {
    setTimeLeft(getTimeLeft(capsule.unlockAt as string));
  }, 1000);

  return () => clearInterval(interval);
}, [capsule]);


  /* -------------------- Media Preview -------------------- */
  useEffect(() => {
    if (!mediaFile) {
      setMediaPreview(null);
      return;
    }
    const url = URL.createObjectURL(mediaFile);
    setMediaPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [mediaFile]);

  /* -------------------- Add Text Memory -------------------- */
  const addMemory = async () => {
    if (!content.trim()) return;

    setAdding(true);
    try {
      await fetch("http://localhost:5000/api/memories", {
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


  /* -------------------- Upload Media -------------------- */
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


      await fetch("http://localhost:5000/api/memories/media", {
        method: "POST",
        headers: { Authorization: token || "" },
        body: formData,
      });

      setMediaFile(null);
      setMediaPreview(null);
      setUploadSuccess(true);
      
      setTimeout(() => setUploadSuccess(false), 2500);


      await fetchMemories();
    } finally {
      setUploading(false);
    }
  };

  /* -------------------- Delete Memory -------------------- */
  const deleteMemory = async (memoryId: string) => {
    if (!confirm("Delete this memory permanently?")) return;

    await fetch(`http://localhost:5000/api/memories/${memoryId}`, {
      method: "DELETE",
      headers: { Authorization: token || "" },
    });
    await fetchMemories();
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 rounded-full bg-white/10 text-white"
        >
          ← Back
        </button>

        <span className="text-sm text-gray-400">
          Memories: {memories.length}
        </span>
      </div>
      

      {/* Composer */}
      {!capsule?.isLocked && (
      <div className="bg-white rounded-2xl p-4 mb-6 shadow">
        <ReactQuill
          value={content}
          onChange={setContent}
          modules={quillModules}
          placeholder="Write a memory..."
          className="text-black"
        />

        <p className="text-sm text-gray-600 mt-4 mb-2">
        Upload media 
        </p>

        {/* Media Buttons */}
        <div className="flex flex-wrap gap-3 mt-4">
          {["image", "audio", "video"].map((type) => (
            <label
              key={type}
className="cursor-pointer px-4 py-2 rounded-full border bg-white text-sm text-black flex items-center gap-2 hover:bg-gray-100 transition"
            >
              {type === "image" && <>🖼 <span>Image</span></>}
              {type === "audio" && <>🎧 <span>Audio</span></>}
              {type === "video" && <>🎥 <span>Video</span></>}

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

          <button
            onClick={uploadMedia}
            disabled={!mediaFile || uploading}
            className="px-4 py-2 rounded-full bg-indigo-600 text-white flex items-center gap-2"
          >
            {uploading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            Upload
          </button>

          <button
            onClick={addMemory}
            disabled={!content.trim() || adding}
            className="px-4 py-2 rounded-full bg-emerald-500 text-white"
          >
            {adding ? "Adding…" : "Add Memory"}
          </button>
        </div>

 {/* Media Preview + Caption */}
{mediaPreview && (
  <div className="mt-4 p-4 border rounded-xl bg-gray-50 space-y-3">
    {mediaType === "image" && (
      <img src={mediaPreview} className="w-40 rounded-lg" />
    )}

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

    {/* ✅ Caption input — CORRECT PLACE */}
    <input
      type="text"
      placeholder="Add a caption (optional)"
      value={mediaCaption}
      onChange={(e) => setMediaCaption(e.target.value)}
      className="w-full px-3 py-2 rounded-lg border
                 border-gray-300 text-sm text-gray-900
                 placeholder-gray-400 focus:outline-none
                 focus:ring-2 focus:ring-indigo-300"
    />

    <button
      onClick={() => {
        setMediaFile(null);
        setMediaPreview(null);
        setMediaCaption("");
      }}
      className="text-xs text-red-600 hover:underline"
    >
      Remove
    </button>
  </div>
)}

         
      </div>
      )}

      {/* Memories */}
  {capsule?.isLocked && (
  <div className="p-8 rounded-xl border bg-gray-50 text-center mb-6">
    <h3 className="text-lg font-semibold text-gray-800">
      🔒 Capsule Locked
    </h3>

    {timeLeft ? (
      <p className="text-sm text-indigo-600 mt-2 font-medium">
        ⏳ Unlocks in {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
      </p>
    ) : (
      <p className="text-sm text-green-600 mt-2 font-medium">
        🔓 Unlocking soon…
      </p>
    )}

    <p className="text-xs text-gray-500 mt-2">
      You’ll be able to view and add memories once it unlocks.
    </p>
  </div>
)}


      {!capsule?.isLocked && (
      <div className="grid gap-4">
        {loading ? (
          <p className="text-gray-400">Loading…</p>
        ) : (
          memories.map((m) => (
            <div key={m._id} className="bg-white p-4 rounded-xl shadow">
              {m.type === "text" && (
  <div
    className="prose max-w-none prose-gray text-gray-900"
    dangerouslySetInnerHTML={{ __html: m.content }}
  />
)}

            {m.type === "image" && (
  <div className="space-y-2">
    {m.caption && (
      <p className="text-sm font-medium text-gray-800">
        {m.caption}
      </p>
    )}
    <img
      src={m.content}
      className="rounded-xl max-h-80 w-full object-cover"
    />
  </div>
)}

             {m.type === "audio" && (
  <div className="space-y-2">
    {m.caption && (
      <p className="text-sm font-medium text-gray-800">
        {m.caption}
      </p>
    )}
    <audio controls className="w-full">
      <source src={m.content} />
    </audio>
  </div>
)}

             {m.type === "video" && (
  <div className="space-y-2">
    {m.caption && (
      <p className="text-sm font-medium text-gray-800">
        {m.caption}
      </p>
    )}
    <video controls className="w-full rounded-xl">
      <source src={m.content} />
    </video>
  </div>
)}


              <div className="flex justify-between mt-2 text-sm text-gray-400">
                <span>
                  {m.createdAt && new Date(m.createdAt).toLocaleString()}
                </span>
                <button
  onClick={() => deleteMemory(m._id)}
  className="px-3 py-1.5 rounded-full text-sm font-medium
             bg-red-50 text-red-600 hover:bg-red-100
             transition"
>
  Delete
</button>

              </div>
            </div>
          ))
        )}
      </div>
)}
    </div>
  );
}
