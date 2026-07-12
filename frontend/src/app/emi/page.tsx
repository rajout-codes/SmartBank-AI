"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export default function EmiPage() {
  const [amount, setAmount] = useState(500000);
  const [rate, setRate] = useState(9);
  const [tenure, setTenure] = useState(60);
  const [result, setResult] = useState<{ emi: number; total_interest: number; total_amount: number } | null>(null);

  async function calc(e: React.FormEvent) {
    e.preventDefault();
    setResult(await api("/emi", { method: "POST", body: JSON.stringify({ amount, rate, tenure_months: tenure }) }));
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">EMI Calculator</h1>
      <form onSubmit={calc} className="glass p-6 space-y-4">
        <label className="block text-sm">Loan Amount (₹)<input type="number" className="w-full mt-1 p-3 rounded-lg bg-white/10" value={amount} onChange={(e) => setAmount(+e.target.value)} /></label>
        <label className="block text-sm">Interest Rate (%)<input type="number" step="0.1" className="w-full mt-1 p-3 rounded-lg bg-white/10" value={rate} onChange={(e) => setRate(+e.target.value)} /></label>
        <label className="block text-sm">Tenure (months)<input type="number" className="w-full mt-1 p-3 rounded-lg bg-white/10" value={tenure} onChange={(e) => setTenure(+e.target.value)} /></label>
        <button className="w-full py-3 bg-blue-600 text-white rounded-xl">Calculate</button>
      </form>
      {result && (
        <div className="glass p-6 mt-4 space-y-2">
          <p>Monthly EMI: <strong>₹{result.emi.toLocaleString()}</strong></p>
          <p>Total Interest: ₹{result.total_interest.toLocaleString()}</p>
          <p>Total Amount: ₹{result.total_amount.toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
