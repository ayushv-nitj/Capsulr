"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";

export default function Dashboard() {
  const router = useRouter();
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
    <div>
      <h1>Your Capsules</h1>

      {capsules.map(c => (
        <div key={c._id}>
          <h3>{c.title}</h3>
          <p>{c.theme}</p>
          <p>Unlocks on: {new Date(c.unlockAt).toDateString()}</p>
        </div>
      ))}
    </div>
  );
}
