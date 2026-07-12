"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export default function LoanPage() {
  const [form, setForm] = useState({ salary: 80000, age: 30, employment: "salaried", existing_emi: 5000, credit_score: 750 });
  const [result, setResult] = useState<{ eligible_amount: number; estimated_emi: number; rate: number; suggestions: string[] } | null>(null);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    setResult(await api("/loan/calculate", { method: "POST", body: JSON.stringify(form) }));
  }

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Loan Eligibility</h1>
      <form onSubmit={check} className="glass p-6 space-y-4">
        {(["salary", "age", "existing_emi", "credit_score"] as const).map((k) => (
          <label key={k} className="block text-sm capitalize">{k.replace("_", " ")}
            <input type="number" className="w-full mt-1 p-3 rounded-lg bg-white/10" value={form[k]} onChange={(e) => set(k, +e.target.value)} />
          </label>
        ))}
        <label className="block text-sm">Employment
          <select className="w-full mt-1 p-3 rounded-lg bg-white/10" value={form.employment} onChange={(e) => set("employment", e.target.value)}>
            <option value="salaried">Salaried</option>
            <option value="self-employed">Self-employed</option>
          </select>
        </label>
        <button className="w-full py-3 bg-blue-600 text-white rounded-xl">Check Eligibility</button>
      </form>
      {result && (
        <div className="glass p-6 mt-4 space-y-2">
          <p>Eligible: <strong>₹{result.eligible_amount.toLocaleString()}</strong></p>
          <p>Est. EMI: ₹{result.estimated_emi.toLocaleString()} @ {result.rate}%</p>
          <ul className="text-sm opacity-80 list-disc pl-5">{result.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
