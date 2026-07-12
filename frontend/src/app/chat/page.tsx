"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getToken } from "@/lib/api";

type Msg = { role: string; content: string };

export default function ChatPage() {
  const router = useRouter();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!getToken()) { router.replace("/login"); return; }
    api<Msg[]>("/chat/history").then(setMsgs).catch(() => {});
  }, [router]);

  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMsgs((m) => [...m, { role: "user", content: userMsg }]);
    setLoading(true);
    try {
      const { reply } = await api<{ reply: string }>("/chat", { method: "POST", body: JSON.stringify({ message: userMsg }) });
      setMsgs((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: "Error — is the backend running?" }]);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
      <h1 className="text-2xl font-bold mb-4">AI Chat</h1>
      <div className="glass flex-1 p-4 overflow-y-auto space-y-3 mb-4">
        {msgs.length === 0 && <p className="opacity-50 text-sm">Ask: &quot;What is a savings account?&quot; or &quot;Explain UPI&quot;</p>}
        {msgs.map((m, i) => (
          <div key={i} className={`p-3 rounded-xl text-sm max-w-[85%] ${m.role === "user" ? "ml-auto bg-blue-600 text-white" : "bg-white/10"}`}>
            {m.content}
          </div>
        ))}
        <div ref={end} />
      </div>
      <form onSubmit={send} className="flex gap-2">
        <input className="flex-1 p-3 rounded-xl bg-white/10 border border-white/20" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about banking..." />
        <button className="px-6 py-3 bg-blue-600 text-white rounded-xl" disabled={loading}>{loading ? "..." : "Send"}</button>
      </form>
    </div>
  );
}
