"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditCapsule() {
  const { id } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [unlockTime, setUnlockTime] = useState("12:00");
  const [loading, setLoading] = useState(true);
  const [recipients, setRecipients] = useState("");


  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
const recipientList = recipients
  .split(",")
  .map(e => e.trim())
  .filter(Boolean);


  // 🔽 Fetch existing capsule
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
        setUnlockDate(d.toISOString().split("T")[0]);
        setUnlockTime(d.toTimeString().slice(0, 5));
      }

      // populate recipients from fetched capsule
      setRecipients((data.recipients || []).join(","));

      setLoading(false);
    };

    fetchCapsule();
  }, [id]);

  // 🔽 Update capsule
  const updateCapsule = async () => {
    const unlockAt = new Date(`${unlockDate}T${unlockTime}`);

    const recipientList = recipients
  .split(",")
  .map(e => e.trim())
  .filter(Boolean);

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
          recipients: recipientList
      }),
    });

    router.push("/dashboard");
  };

  if (loading) return <p className="p-6">Loading capsule…</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Capsule</h1>

      <input
        className="w-full mb-3 px-4 py-2 border rounded-lg"
        placeholder="Capsule title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        className="w-full mb-3 px-4 py-2 border rounded-lg"
        placeholder="Theme"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      />

      <input
  className="w-full mb-3 px-4 py-2 border rounded-lg"
  placeholder="Recipients emails (comma separated)"
  value={recipients}
  onChange={(e) => setRecipients(e.target.value)}
/>


      <div className="flex gap-3 mb-4">
        <input
          type="date"
          className="flex-1 px-4 py-2 border rounded-lg"
          value={unlockDate}
          onChange={(e) => setUnlockDate(e.target.value)}
        />

        <input
          type="time"
          className="flex-1 px-4 py-2 border rounded-lg"
          value={unlockTime}
          onChange={(e) => setUnlockTime(e.target.value)}
        />
      </div>

      <button
        onClick={updateCapsule}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700"
      >
        Save Changes
      </button>
    </div>
  );
}
