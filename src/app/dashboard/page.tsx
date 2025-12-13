"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isLoggedIn } from "@/lib/auth";

export default function Dashboard() {
  const router = useRouter();
    const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };
  const [capsules, setCapsules] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }

    const fetchCapsules = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/capsules", {
        headers: {
          Authorization: token || ""
        }
      });

      const data = await res.json();
      setCapsules(data);
    };

    fetchCapsules();
  }, []);

  return (
    <div className="p-6">
<div className="flex justify-between items-center mb-6">
  <h1 className="text-2xl font-bold">Your Capsules</h1>

  <button
    onClick={logout}
    className="text-sm text-red-500 hover:underline"
  >
    Logout
  </button>
</div>

      {capsules.length === 0 && (
        <p className="text-gray-500">No capsules yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {capsules.map(c => (
          <Link
            key={c._id}
            href={`/dashboard/capsule/${c._id}`}
            className=" bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-gray-300 transition block"
>
          <h3 className="text-lg font-semibold text-gray-900">
  {c.title}
</h3>

<p className="text-sm font-medium text-indigo-600">
  {c.theme}
</p>

<p className="text-xs mt-2 text-gray-500">
  Unlocks on {new Date(c.unlockAt).toDateString()}
</p>

          </Link>
        ))}
      </div>
    </div>
  );
}
