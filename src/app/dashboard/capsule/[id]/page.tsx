"use client";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAvatarUrl } from "@/lib/avatar";


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
};



type TimeLeft = { days: number; hours: number; minutes: number; seconds: number } | null;

/* -------------------- Helper Functions -------------------- */
// helper returns days/hours/minutes/seconds or null if passed
function getTimeLeft(unlockAt?: string): TimeLeft {
  if (!unlockAt) return null;
  const diff = +new Date(unlockAt) - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
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

const [recipientEmail, setRecipientEmail] = useState("");
const [recipients, setRecipients] = useState<string[]>([]);

  const [collabEmail, setCollabEmail] = useState("");
const [addingCollab, setAddingCollab] = useState(false);
 

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  // avoid reading browser-only APIs during SSR
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  /* -------------------- Fetch Capsule -------------------- */
  const fetchCapsule = async () => {
    const res = await fetch(`http://localhost:5000/api/capsules/${id}`, {
      headers: { Authorization: token || "" },
    });
if (res.ok) {
  const data = await res.json();

  console.log("CAPSULE:", capsule);

  setCapsule({
    ...data,
    isLocked: data.isLocked ?? false, // 👈 default safety
  });

    setRecipients(data.recipients || []);
}
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

  // hydrate client-only values
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUserId(localStorage.getItem("userId"));
      setIsClient(true);
    }
  }, []);

  // 🔽 (COUNTDOWN EFFECT)
  useEffect(() => {
  if (!capsule?.unlockAt || !capsule?.isLocked) return;

  setTimeLeft(getTimeLeft(capsule.unlockAt));

  const interval = setInterval(() => {
    setTimeLeft(getTimeLeft(capsule.unlockAt));
  }, 1000);

  return () => clearInterval(interval);
}, [capsule?.unlockAt, capsule?.isLocked]);

const addCollaborator = async () => {
  if (!collabEmail.trim()) return;

  setAddingCollab(true);
  try {
    await fetch(`http://localhost:5000/api/capsules/${id}/collaborators`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token || "",
      },
      body: JSON.stringify({ email: collabEmail }),
    });

    setCollabEmail("");
    await fetchCapsule(); // refresh capsule data
  } finally {
    setAddingCollab(false);
  }
};

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



const addRecipient = () => {
  if (!recipientEmail.trim()) return;
  if (recipients.includes(recipientEmail)) return;

  setRecipients([...recipients, recipientEmail]);
  setRecipientEmail("");
};

const removeRecipient = (email: string) => {
  setRecipients(recipients.filter(r => r !== email));
};

const saveRecipients = async () => {
  await fetch(`http://localhost:5000/api/capsules/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: token || ""
    },
    body: JSON.stringify({ recipients })
  });

  alert("Recipients saved");
};

  //  Prevent rendering before capsule loads
if (!capsule) {
  return (
    <div className="p-10 text-center text-gray-400">
      Loading capsule…
    </div>
  );
}
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

{/* 👑 Admin + 👥 Collaborators */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

  {/* 👑 Admin */}
  {capsule?.owner && (
    <div className="bg-white p-4 rounded-xl shadow">
      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        👑 Admin
      </h4>

      <div className="flex items-center gap-4">
        <img
          src={
            capsule.owner.profileImage ||
            getAvatarUrl(capsule.owner.email)
          }
          className="w-12 h-12 rounded-full border object-cover"
        />

        <div>
          <p className="text-sm font-semibold text-gray-900">
            {capsule.owner.name}
          </p>
          <p className="text-xs text-gray-500">
            {capsule.owner.email}
          </p>
        </div>
      </div>
    </div>
  )}

  {/* 👥 Collaborators */}
  <div className="bg-white p-4 rounded-xl shadow">
    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
      👥 Collaborators
    </h4>

    {capsule?.contributors?.length ? (
      <div className="space-y-3">
        {capsule.contributors.map((u) => (
          <div key={u._id} className="flex items-center gap-4">
            <img
              src={u.profileImage || getAvatarUrl(u.email)}
              className="w-10 h-10 rounded-full border object-cover"
            />

            <div>
              <p className="text-sm font-medium text-gray-900">
                {u.name}
              </p>
              <p className="text-xs text-gray-500">
                {u.email}
              </p>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm text-gray-400">
        No collaborators yet
      </p>
    )}
  </div>

</div>

   {/* Add Collaborator (Owner only) */}
{capsule && (
  <div className="mb-6 bg-white p-4 rounded-xl shadow">
    <h4 className="text-sm font-semibold text-gray-700 mb-2">
      Add collaborator
    </h4>

    <div className="flex gap-2">
      <input
        type="email"
        placeholder="Collaborator email"
        value={collabEmail}
        onChange={(e) => setCollabEmail(e.target.value)}
        className="flex-1 px-3 py-2 border rounded-lg text-sm text-gray-900"
      />

      <button
        onClick={addCollaborator}
        disabled={addingCollab}
        className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm"
      >
        {addingCollab ? "Adding…" : "Add"}
      </button>
    </div>
  </div>
)}


{/* 📧 Recipients */}
{capsule && capsule.owner === undefined && (
  <div className="mb-6 bg-white p-4 rounded-xl shadow">
    <h4 className="text-sm font-semibold text-gray-700 mb-2">
      Recipients (will be notified on unlock)
    </h4>

    <div className="flex gap-2 mb-3">
      <input
        type="email"
        placeholder="Recipient email"
        value={recipientEmail}
        onChange={(e) => setRecipientEmail(e.target.value)}
        className="flex-1 px-3 py-2 border rounded-lg text-sm text-gray-900"
      />

      <button
        onClick={addRecipient}
        className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm"
      >
        Add
      </button>
    </div>

    {/* Recipient list */}
    <div className="flex flex-wrap gap-2">
      {recipients.map((email) => (
        <span
          key={email}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-sm"
        >
          {email}
          <button
            onClick={() => removeRecipient(email)}
            className="text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </span>
      ))}
    </div>

    <button
      onClick={saveRecipients}
      className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm"
    >
      Save Recipients
    </button>
  </div>
)}




   {/* Composer */}
{(() => {
  const isOwner = capsule?.owner?._id === currentUserId;
  const isContributor = capsule?.contributors?.some((c: any) => c._id === currentUserId);
  const canEdit = isOwner || isContributor;

  return canEdit ? (
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
              className="px-4 py-2 rounded-full bg-emerald-600 text-white flex items-center gap-2"
            >
              {adding && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              Add Memory
            </button>

            {/* Media Preview + Caption */}
            {mediaPreview && (
              <div className="mt-4 p-4 border rounded-xl bg-gray-50 space-y-3">
                {mediaType === "image" && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaPreview} alt="preview" className="w-40 rounded-lg" />
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

                <input
                  type="text"
                  placeholder="Add a caption (optional)"
                  value={mediaCaption}
                  onChange={(e) => setMediaCaption(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
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

          {/* Upload Success Message */}
          {uploadSuccess && (
            <div className="mt-4 p-3 rounded-lg bg-green-50 text-green-800 text-sm">
              Media uploaded successfully!
            </div>
          )}
        </div>
  ) : null;
})()}

   

      {/* Memories List */}
      <div className="space-y-4">
        {loading && (
          <div className="animate-pulse flex flex-col space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-white rounded-xl shadow-md p-4 flex flex-col justify-between"
              >
                <div className="h-2 bg-gray-200 rounded-full"></div>
                <div className="flex-1"></div>
                <div className="h-2 bg-gray-200 rounded-full w-3/4"></div>
              </div>
            ))}
          </div>
        )}

        {!loading && memories.length === 0 && (
          <div className="p-4 rounded-xl bg-white shadow-md text-center text-gray-500">
            No memories yet. Be the first to add one!
          </div>
        )}

        {memories.map((memory) => (
          <div
            key={memory._id}
            className="p-4 rounded-xl bg-white shadow-md flex flex-col gap-4"
          >
            {/* Memory Content */}
            {memory.type === "text" && (
              <div
                className="prose max-w-none text-gray-900"
                dangerouslySetInnerHTML={{ __html: memory.content }}
              />
            )}

            {/* Memory Media */}
            {memory.type !== "text" && (
              <div className="flex flex-col sm:flex-row gap-4">
                {memory.type === "image" && (
                  <img
                    src={memory.content}
                    alt={memory.caption}
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                )}

                {memory.type === "audio" && (
                  <audio controls className="w-full rounded-lg shadow-md">
                    <source src={memory.content} />
                    Your browser does not support the audio element.
                  </audio>
                )}

                {memory.type === "video" && (
                  <video controls className="w-full rounded-lg shadow-md">
                    <source src={memory.content} />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            )}

            {/* Memory Caption */}
            {memory.caption && (
              <p className="text-sm text-gray-500 italic">
                {memory.caption}
              </p>
            )}

            {/* Memory Actions (Owner only) */}
            {capsule?.owner?._id === currentUserId && (
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => deleteMemory(memory._id)}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Unlock Info (Admin only) */}
      {capsule?.owner?._id === currentUserId && capsule.isLocked && (
        <div className="mt-8 p-4 rounded-xl bg-yellow-50 text-yellow-800 text-sm">
          {capsule.unlockAt && isClient ? (
            <>This capsule will unlock on {new Date(capsule.unlockAt).toLocaleDateString()} at {new Date(capsule.unlockAt).toLocaleTimeString()}</>
          ) : capsule.unlockAt ? (
            <>Unlock date set</>
          ) : (
            <>Unlock date not set</>
          )}
        </div>
      )}
    </div>
  );
}
