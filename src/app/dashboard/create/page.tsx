"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateCapsule() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [unlockAt, setUnlockAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");

    if (!title.trim() || !theme.trim() || !unlockAt) {
      setError("Please fill all fields.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/capsules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || ""
        },
        body: JSON.stringify({
          title,
          theme,
          unlockType: "date",
          unlockAt
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Failed to create capsule");
      }

      // success
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center p-6 bg-linear-to-b from-white to-gray-50">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">Create Capsule</h1>
          <p className="mt-1 text-sm text-gray-600">
            Seal a memory to be opened later — invite collaborators after creating.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
        >
          <div className="grid grid-cols-1 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="A short memorable title"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Theme</span>
              <input
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="E.g., Graduation, Travel, Family"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Unlock Date</span>
              <input
                type="date"
                value={unlockAt}
                onChange={(e) => setUnlockAt(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition"
              />
            </label>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex items-center justify-between gap-4 mt-1">
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-white font-semibold shadow ${
                  loading
                    ? "bg-indigo-300 cursor-wait"
                    : "bg-linear-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600"
                } transition`}
              >
                {loading ? "Creating…" : "+ Create Capsule"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="text-sm text-gray-600 hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            By creating a capsule you can add memories and invite collaborators later.
          </div>
        </form>
      </div>
    </div>
  );
}
