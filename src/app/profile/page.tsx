"use client";

import { useRef } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAvatarUrl } from "@/lib/avatar";

function PencilIcon() {
  return (
    <svg
      className="w-6 h-6 text-white"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M15.232 5.232l3.536 3.536M9 11l6.293-6.293a1 1 0 011.414 0l2.586 2.586a1 1 0 010 1.414L13 15l-4 1 1-4z" />
    </svg>
  );
}


export default function Profile() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState("");
const [file, setFile] = useState<File | null>(null);
const fileInputRef = useRef<HTMLInputElement | null>(null);


 const username = email.split("@")[0];

useEffect(() => {
  setEmail(localStorage.getItem("email") || "");
  setName(localStorage.getItem("name") || "");
  setProfileImage(localStorage.getItem("profileImage") || "");
}, []);

const uploadProfileImage = async () => {
  if (!file) return;

  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("http://localhost:5000/api/user/profile-image", {
    method: "POST",
    headers: {
      Authorization: token || ""
    },
    body: formData
  });

  const data = await res.json();

  localStorage.setItem("profileImage", data.profileImage);
  setProfileImage(data.profileImage);
};

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white"
        aria-label="Back to dashboard"
      >
        <span className="text-xl">←</span>
        Back to Dashboard
      </button>

      <div className="flex items-center gap-6 mb-8">
       <div className="relative group w-24 h-24">
  <img
    src={profileImage || getAvatarUrl(email)}
    className="w-24 h-24 rounded-full border object-cover"
  />

  {/* Hover Overlay */}
  <div
  onClick={() => fileInputRef.current?.click()}
 className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
>
  <PencilIcon />
</div>

</div>

<input
  ref={fileInputRef}
  type="file"
  accept="image/*"
  className="hidden"
  onChange={e => setFile(e.target.files?.[0] || null)}
/>


<button
  onClick={uploadProfileImage}
  className="mt-2 bg-indigo-600 text-white px-4 py-1 rounded-lg text-sm"
>
  Upload Photo
</button>


        <div>
          <h2 className="text-2xl font-bold text-gray-300">{name}</h2>
          <p className="text-gray-500">{username}</p>
        </div>
      </div>

      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Your Capsules</h3>
        <p className="text-sm text-gray-500">
          Capsules you created or contributed to
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Collaborators</h3>
        <p className="text-sm text-gray-500">
          People you have shared memories with
        </p>
      </section>
    </div>
  );
}
