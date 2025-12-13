"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAvatarUrl } from "@/lib/avatar";
import Cropper from "react-easy-crop";

async function getCroppedImage(imageSrc: string, crop: any) {
  const image = new Image();
  image.src = imageSrc;
  await new Promise(resolve => (image.onload = resolve));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise<Blob>((resolve) => {
    canvas.toBlob(blob => resolve(blob!), "image/jpeg");
  });
}



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
const fileInputRef = useRef<HTMLInputElement | null>(null);
const [crop, setCrop] = useState({ x: 0, y: 0 });
const [zoom, setZoom] = useState(1);
const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
const [previewImage, setPreviewImage] = useState<string | null>(null);
const [uploading, setUploading] = useState(false);
const [showToast, setShowToast] = useState(false);

const onCropComplete = (_: any, croppedPixels: any) => {
  setCroppedAreaPixels(croppedPixels);
};


const username = email ? email.split("@")[0] : "";

useEffect(() => {
  setEmail(localStorage.getItem("email") || "");
  setName(localStorage.getItem("name") || "");
  setProfileImage(localStorage.getItem("profileImage") || "");
}, []);

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
onChange={e => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    setPreviewImage(reader.result as string);
  };
  reader.readAsDataURL(file);
}}

/>

        <div>
<h2 className="text-2xl font-bold text-gray-350">{name}</h2>
          <p className="text-gray-400">{username}</p>
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

       {previewImage && (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded-xl w-80">
          <div className="relative w-full h-64">
            <Cropper
              image={previewImage}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

         <button
  disabled={uploading}
  className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-60"
  onClick={async () => {
    if (!croppedAreaPixels || !previewImage) return;

    setUploading(true);

    const croppedBlob = await getCroppedImage(
      previewImage,
      croppedAreaPixels
    );

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("image", croppedBlob);

    const res = await fetch(
      "http://localhost:5000/api/user/profile-image",
      {
        method: "POST",
        headers: {
          Authorization: token || ""
        },
        body: formData
      }
    );

    const data = await res.json();

    localStorage.setItem("profileImage", data.profileImage);
    setProfileImage(data.profileImage);

    setUploading(false);
    setPreviewImage(null);

    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  }}
>
  {uploading && (
    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
  )}
  {uploading ? "Uploading..." : "Crop & Save"}
</button>


        </div>
      </div>
    )}

    {showToast && (
  <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm"
>
    Profile photo updated ✅
  </div>
)}

    </div>
  );
}
