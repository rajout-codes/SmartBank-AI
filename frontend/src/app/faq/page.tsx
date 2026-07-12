"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export default function FaqPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<{ topic: string; content: string }[]>([]);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    const data = await api<{ results: { topic: string; content: string }[] }>(`/rag/search?q=${encodeURIComponent(q)}`);
    setResults(data.results);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Banking FAQ</h1>
      <form onSubmit={search} className="flex gap-2 mb-6">
        <input className="flex-1 p-3 rounded-xl bg-white/10 border border-white/20" placeholder="Search: UPI, FD, credit score..." value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="px-6 py-3 bg-blue-600 text-white rounded-xl">Search</button>
      </form>
      <div className="space-y-3">
        {results.map((r) => (
          <div key={r.topic} className="glass p-4">
            <h3 className="font-semibold capitalize">{r.topic}</h3>
            <p className="text-sm opacity-80 mt-1">{r.content}</p>
          </div>
        ))}
        {results.length === 0 && <p className="opacity-50 text-sm">Try searching &quot;savings&quot;, &quot;upi&quot;, or &quot;neft&quot;</p>}
      </div>
    </div>
  );
}
