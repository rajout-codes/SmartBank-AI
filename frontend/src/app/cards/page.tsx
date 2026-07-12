"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Card = { name: string; type: string; cashback: string; annual_fee: number; best_for: string };

export default function CardsPage() {
  const [pref, setPref] = useState("cashback");
  const [data, setData] = useState<{ cards: Card[]; recommended: Card } | null>(null);

  useEffect(() => { api<{ cards: Card[]; recommended: Card }>(`/cards?preference=${pref}`).then(setData); }, [pref]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Credit Card Comparison</h1>
      <select className="p-3 rounded-lg bg-white/10 mb-6" value={pref} onChange={(e) => setPref(e.target.value)}>
        {["cashback", "rewards", "travel", "fuel", "shopping"].map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
      {data && (
        <>
          <div className="glass p-4 mb-6 border-2 border-blue-500">
            <p className="text-sm opacity-70">Recommended</p>
            <h2 className="text-xl font-bold">{data.recommended.name}</h2>
            <p className="text-sm">{data.recommended.cashback} · Fee: ₹{data.recommended.annual_fee}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {data.cards.map((c) => (
              <div key={c.name} className="glass p-4">
                <h3 className="font-semibold">{c.name}</h3>
                <p className="text-sm opacity-70">{c.type} · {c.cashback}</p>
                <p className="text-sm">Best for: {c.best_for}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
