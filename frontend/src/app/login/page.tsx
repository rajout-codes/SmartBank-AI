"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@smartbank.com");
  const [password, setPassword] = useState("demo123");
  const [isReg, setIsReg] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      const path = isReg ? "/auth/register" : "/auth/login";
      const data = await api<{ token: string }>(path, { method: "POST", body: JSON.stringify({ email, password, name: "Demo User" }) });
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="glass p-8 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">{isReg ? "Register" : "Login"}</h1>
        <input className="w-full p-3 rounded-lg bg-white/10 border border-white/20" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full p-3 rounded-lg bg-white/10 border border-white/20" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <p className="text-red-500 text-sm">{err}</p>}
        <button className="w-full py-3 bg-blue-600 text-white rounded-xl">{isReg ? "Create Account" : "Sign In"}</button>
        <button type="button" onClick={() => setIsReg(!isReg)} className="text-sm opacity-70 w-full">
          {isReg ? "Have an account? Login" : "New user? Register"}
        </button>
      </form>
    </div>
  );
}
