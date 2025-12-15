"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAvatarUrl } from "@/lib/avatar";
import Cropper from "react-easy-crop";
import { motion, AnimatePresence } from "framer-motion";

async function getCroppedImage(imageSrc: string, crop: any) {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

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
    canvas.toBlob((blob) => resolve(blob!), "image/jpeg");
  });
}

export default function Profile() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [capsules, setCapsules] = useState<any[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);

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
    setMounted(true);
    setEmail(localStorage.getItem("email") || "");
    setName(localStorage.getItem("name") || "");
    setProfileImage(localStorage.getItem("profileImage") || "");

    // Fetch capsules
    const fetchCapsules = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/capsules", {
        headers: { Authorization: token || "" },
      });
      const data = await res.json();
      setCapsules(data);

      // Extract unique collaborators
      const uniqueCollabs = new Map();
      data.forEach((capsule: any) => {
        capsule.contributors?.forEach((c: any) => {
          if (c && c._id) {
            uniqueCollabs.set(c._id, c);
          }
        });
      });
      setCollaborators(Array.from(uniqueCollabs.values()).filter(c => c && c._id && c.email));
    };

    fetchCapsules();
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 max-w-5xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-8 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Dashboard</span>
        </motion.button>

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8"
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl"></div>

          <div className="relative bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar with Edit */}
              <div className="relative group">
                <motion.div whileHover={{ scale: 1.05 }} className="relative">
                  <img
                    src={profileImage || getAvatarUrl(email)}
                    className="w-32 h-32 rounded-full border-4 border-purple-500/30 object-cover shadow-2xl"
                    alt="Profile"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                </motion.div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-lg">
                  <span className="text-sm">✓</span>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const reader = new FileReader();
                  reader.onload = () => {
                    setPreviewImage(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }}
              />

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text mb-2">
                  {name}
                </h2>
                <p className="text-gray-400 text-lg mb-4">@{username}</p>

                {/* Stats */}
                <div className="flex gap-6 justify-center md:justify-start">
                  <div>
                    <div className="text-2xl font-bold text-white">{capsules.length}</div>
                    <div className="text-sm text-gray-400">Capsules</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{collaborators.length}</div>
                    <div className="text-sm text-gray-400">Collaborators</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {capsules.filter((c) => c.isLocked).length}
                    </div>
                    <div className="text-sm text-gray-400">Locked</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Your Capsules */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span>📦</span>
              <span>Your Capsules</span>
            </h3>

            {capsules.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-purple-500/10 rounded-full flex items-center justify-center text-4xl">
                  📭
                </div>
                <p className="text-gray-400 mb-4">No capsules yet</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/dashboard/create")}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold"
                >
                  Create Your First Capsule
                </motion.button>
              </div>
            ) : (
              <div className="grid gap-4">
                {capsules.filter(c => c && c._id).map((c) => (
                  <motion.div
                    key={c._id}
                    whileHover={{ x: 5 }}
                    onClick={() => router.push(`/dashboard/capsule/${c._id}`)}
                    className="p-5 bg-slate-800/50 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                            {c.title || 'Untitled Capsule'}
                          </h4>
                          {c.isLocked ? (
                            <span className="px-2 py-1 rounded-full bg-red-500/20 border border-red-400/30 text-red-300 text-xs">
                              🔒 Locked
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs">
                              🔓 Open
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">{c.theme || 'No theme'}</p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.section>

        {/* Collaborators */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span>👥</span>
              <span>Collaborators</span>
            </h3>

            {collaborators.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-indigo-500/10 rounded-full flex items-center justify-center text-4xl">
                  👤
                </div>
                <p className="text-gray-400">No collaborators yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {collaborators.filter(c => c && c._id && c.email).map((c) => (
                  <motion.div
                    key={c._id}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-white/10"
                  >
                    <img
                      src={c.profileImage || getAvatarUrl(c.email)}
                      className="w-14 h-14 rounded-full border-2 border-purple-500/30 object-cover"
                      alt={c.name || 'Collaborator'}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-white">{c.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-400">{c.email}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.section>
      </div>

      {/* Image Crop Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 rounded-2xl p-6 w-full max-w-lg border border-white/10"
            >
              <h3 className="text-xl font-bold mb-4">Crop Your Photo</h3>

              <div className="relative w-full h-80 bg-slate-800 rounded-xl overflow-hidden mb-4">
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

              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-2 block">Zoom</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={uploading}
                  onClick={async () => {
                    if (!croppedAreaPixels || !previewImage) return;

                    setUploading(true);

                    try {
                      const croppedBlob = await getCroppedImage(previewImage, croppedAreaPixels);

                      const token = localStorage.getItem("token");
                      const formData = new FormData();
                      formData.append("image", croppedBlob);

                      const res = await fetch("http://localhost:5000/api/user/profile-image", {
                        method: "POST",
                        headers: {
                          Authorization: token || "",
                        },
                        body: formData,
                      });

                      if (!res.ok) throw new Error("Upload failed");

                      const data = await res.json();
                      localStorage.setItem("profileImage", data.profileImage);
                      setProfileImage(data.profileImage);
                      setPreviewImage(null);

                      setShowToast(true);
                      setTimeout(() => setShowToast(false), 2500);
                    } catch (error) {
                      alert("Failed to upload image. Please try again.");
                    } finally {
                      setUploading(false);
                    }
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold disabled:opacity-50"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    "Save Photo"
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setPreviewImage(null);
                    setZoom(1);
                  }}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 rounded-xl shadow-2xl border border-white/10 z-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                ✓
              </div>
              <span className="font-semibold">Profile photo updated!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
}