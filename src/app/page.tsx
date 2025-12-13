"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";

export default function Dashboard() {
  const router = useRouter();
  const logout = () => {
  localStorage.removeItem("token");
  router.push("/login");
};

  useEffect(() => {
    if (isLoggedIn()) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, []);

  return null;
}
