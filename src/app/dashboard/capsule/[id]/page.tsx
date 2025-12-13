"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function CapsulePage() {
  const { id } = useParams();
  const [content, setContent] = useState("");
  const [memories, setMemories] = useState<any[]>([]);
  const [image, setImage] = useState<File | null>(null);


  const token = typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null;

  const fetchMemories = async () => {
    const res = await fetch(
      `http://localhost:5000/api/memories/${id}`,
      { headers: { Authorization: token || "" } }
    );
    const data = await res.json();
    setMemories(data);
  };

  const addMemory = async () => {
    await fetch("http://localhost:5000/api/memories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token || ""
      },
      body: JSON.stringify({
        capsuleId: id,
        content
      })
    });

    setContent("");
    fetchMemories();
  };

  const uploadImage = async () => {
  if (!image) return;

  const token = localStorage.getItem("token");
  const formData = new FormData();

  formData.append("image", image);
  formData.append("capsuleId", id as string);

  await fetch("http://localhost:5000/api/memories/image", {
    method: "POST",
    headers: {
      Authorization: token || ""
    },
    body: formData
  });

  setImage(null);
  fetchMemories();
};


  useEffect(() => {
    fetchMemories();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
<h2 className="text-xl font-semibold">Memories ✨</h2>
<p className="text-sm text-gray-500 mb-4">
  Add thoughts, photos, and moments
</p>


 <div className="bg-white border rounded-xl p-4 mb-6">
  <textarea
  className="
    w-full
    border
    border-gray-300
    rounded-lg
    p-3
    text-gray-900
    placeholder-gray-400
    focus:outline-none
    focus:ring-2
    focus:ring-indigo-500
  "
  placeholder="Write a memory..."
  value={content}
  onChange={e => setContent(e.target.value)}
/>


  <div className="flex items-center gap-3 mt-3">
    <input
  type="file"
  accept="image/*"
  className="text-sm text-gray-700"
  onChange={e => setImage(e.target.files?.[0] || null)}
/>


    <button
      className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
      onClick={uploadImage}
    >
      Upload Image
    </button>
  </div>
</div>



      <button onClick={addMemory}>Add Memory</button>

      <hr />

    {memories.map(m => (
  <div
    key={m._id}
    className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
  >
    {m.type === "text" && (
      <p className="text-gray-900 leading-relaxed">
        {m.content}
      </p>
    )}

    {m.type === "image" && (
      <img
        src={m.content}
        className="rounded-xl mt-2 max-h-96 object-cover"
      />
    )}
  </div>
))}



    </div>
  );
}
