"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getToken } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    if (!getToken()) { router.replace("/login"); return; }
    api<{ name: string; email: string; role: string }>("/profile").then(setUser).catch(() => router.replace("/login"));
  }, [router]);

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      {user && (
        <div className="glass p-6 space-y-3">
          <p><span className="opacity-70">Name:</span> {user.name}</p>
          <p><span className="opacity-70">Email:</span> {user.email}</p>
          <p><span className="opacity-70">Role:</span> <span className="capitalize">{user.role}</span></p>
        </div>
      )}
    </div>
  );
}
