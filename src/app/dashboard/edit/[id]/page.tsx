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
    <div className="app-container p-6">
      <div className="card max-w-xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-1">Edit Capsule</h1>
          <p className="text-sm muted">Update capsule details — no changes to existing memories.</p>
        </div>

        <div className="space-y-3">
          <label className="text-xs muted">Title</label>
          <input
            className="w-full px-4 py-3 rounded-lg  bg-white text-black"
            placeholder="Capsule title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label className="text-xs muted">Theme</label>
          <input
            className="w-full px-4 py-3 rounded-lg  bg-white text-black"
            placeholder="Theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          />

          <label className="text-xs muted">Recipients (comma separated)</label>
          <input
            className="w-full px-4 py-3 rounded-lg  bg-white text-black"
            placeholder="Recipients emails (comma separated)"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
          />

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs muted">Unlock date</label>
              <input
                type="date"
                className="w-full px-4 py-3 rounded-lg bg-white text-black"
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
              />
            </div>

            <div className="flex-1">
              <label className="text-xs muted">Unlock time</label>
              <input
                type="time"
                className="w-full px-4 py-3 rounded-lg  bg-white text-black"
                value={unlockTime}
                onChange={(e) => setUnlockTime(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={updateCapsule}
              className="btn btn-primary w-full"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
