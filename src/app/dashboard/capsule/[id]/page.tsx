"use client";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";


import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";


const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["clean"],
  ],
};

const quillFormats = [
  "header", "bold", "italic", "underline", "strike", "list", "bullet", "link", "image",
];


type Memory = {
  _id: string;
  type: "text" | "image";
  content: string;
  createdAt?: string;
};

type Capsule = {
  _id: string;
  title?: string;
  theme?: string;
  unlockAt?: string;
};

export default function CapsulePage() {
  const { id } = useParams();
  const router = useRouter();

  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [content, setContent] = useState("");
  const [memories, setMemories] = useState<Memory[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [loadingMemories, setLoadingMemories] = useState(false);
  const [adding, setAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");


  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // fetch capsule meta
  const fetchCapsule = async () => {
    if (!id) return;
    try {
      const res = await fetch(`http://localhost:5000/api/capsules/${id}`, {
        headers: { Authorization: token || "" }
      });
      if (res.ok) {
        const data = await res.json();
        setCapsule(data);
      }
    } catch (e) {
      // ignore
    }
  };

  const fetchMemories = async () => {
    setLoadingMemories(true);
    try {
      const res = await fetch(`http://localhost:5000/api/memories/${id}`, {
        headers: { Authorization: token || "" }
      });
      const data = await res.json();
      setMemories(Array.isArray(data) ? data : []);
    } catch (err) {
      setMemories([]);
    } finally {
      setLoadingMemories(false);
    }
  };

  useEffect(() => {
    fetchCapsule();
    fetchMemories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

 const addMemory = async () => {
  if (!content.trim()) {
    setError("Write something before adding.");
    return;
  }

  setAdding(true);
  setError("");

  try {
    const res = await fetch("http://localhost:5000/api/memories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token || "",
      },
      body: JSON.stringify({
        capsuleId: id,
        content,
      }),
    });

    if (!res.ok) throw new Error("Failed to add memory");

    setContent("");
    await fetchMemories();
  } catch (err: any) {
    setError(err.message || "Failed to add memory");
  } finally {
    setAdding(false);
  }
};


  const uploadImage = async () => {
    if (!image) return setError("Select an image first.");
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("capsuleId", id as string);

      await fetch("http://localhost:5000/api/memories/image", {
        method: "POST",
        headers: {
          Authorization: token || ""
        } as any,
        body: formData
      });

      setImage(null);
      setPreview(null);
      await fetchMemories();
    } catch (err: any) {
      setError(err?.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

const deleteMemory = async (memoryId: string) => {
  if (!confirm("Delete this memory? This action cannot be undone.")) return;

  try {
    await fetch(`http://localhost:5000/api/memories/${memoryId}`, {
      method: "DELETE",
      headers: { Authorization: token || "" }
    });

    // 🔁 Always re-fetch from DB
    await fetchMemories();
  } catch {
    setError("Failed to delete memory");
  }
};


  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-100"
            aria-label="Back"
          >
            ← Back
          </button>

          <div>
            <h1 className="text-2xl font-extrabold">
              {capsule?.title ?? "Capsule"}
            </h1>
            <p className="text-sm text-gray-500">
              {capsule?.theme ?? "Memories & moments"}
              {capsule?.unlockAt ? ` • Unlocks ${new Date(capsule.unlockAt).toLocaleDateString()}` : ""}
            </p>
          </div>
        </div>

        <div>
          <span className="text-sm text-gray-600">Memories: {memories.length}</span>
        </div>
      </div>

      {/* Composer */}
      <div className="bg-linear-to-r from-white to-white/90 border border-gray-500 rounded-2xl p-4 mb-6 shadow-sm">
    <ReactQuill
  value={content}
  onChange={setContent}
  modules={quillModules}
  theme="snow"
  placeholder="Write a memory — thoughts, feelings, stories…"
  className="bg-white rounded-xl text-black"
/>


        <div className="flex items-center justify-between gap-3 mt-3">
          <div className="flex items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 text-sm text-gray-700 bg-white/50 px-3 py-2 rounded-lg border border-gray-300 hover:shadow">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
              📷 Add Image
            </label>

            <button
              onClick={uploadImage}
              disabled={!image || uploading}
              className={`px-4 py-2 rounded-full font-semibold text-white ${
                uploading ? "bg-indigo-300 cursor-wait" : "bg-linear-to-r from-indigo-500 to-pink-500 hover:from-indigo-600"
              }`}
            >
              {uploading ? "Uploading…" : "Upload Image"}
            </button>

            <button
              onClick={addMemory}
              disabled={( !content.trim() && !image ) || adding}
              className={`px-4 py-2 rounded-full font-semibold ${adding ? "bg-indigo-300 cursor-wait" : "bg-linear-to-r from-emerald-400 to-teal-500 hover:from-emerald-500"}`}
            >
              {adding ? "Adding…" : "Add Memory"}
            </button>
          </div>

          <div className="text-sm text-gray-500">
            <span>{content.length}/1000</span>
          </div>
        </div>

        {preview && (
          <div className="mt-4 flex items-start gap-3">
            <img src={preview} alt="preview" className="w-28 h-28 object-cover rounded-lg border" />
            <div>
              <p className="text-sm text-gray-700">Selected image preview</p>
              <button
                onClick={() => { setImage(null); setPreview(null); }}
                className="mt-2 text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {/* Memories list */}
      <h2 className="text-lg font-semibold mb-3">Memories</h2>

      {loadingMemories ? (
        <p className="text-gray-500">Loading memories…</p>
      ) : memories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
          No memories yet — be the first to add one.
        </div>
      ) : (
        <div className="grid gap-4">
          {memories.map((m) => (
            <div key={m._id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                 {m.type === "text" ? (
  <div
    className="prose max-w-none text-gray-900"
    dangerouslySetInnerHTML={{ __html: m.content }}
  />
) : (
  <img
    src={m.content}
    alt="memory"
    className="rounded-xl max-h-80 w-full object-cover"
  />
)}

                  <div className="mt-2 text-xs text-gray-500">
                    {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => deleteMemory(m._id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
