"use client";

import { useState } from "react";

export default function CreateCapsule() {
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [unlockAt, setUnlockAt] = useState("");

  const submit = async () => {
    const token = localStorage.getItem("token");

    await fetch("http://localhost:5000/api/capsules", {
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

    alert("Capsule created");
  };

  return (
    <div>
      <h2>Create Capsule</h2>

      <input placeholder="Title" onChange={e => setTitle(e.target.value)} />
      <input placeholder="Theme" onChange={e => setTheme(e.target.value)} />
      <input type="date" onChange={e => setUnlockAt(e.target.value)} />

      <button onClick={submit}>Create</button>
    </div>
  );
}
