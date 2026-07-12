"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/api";

const tiles = [
  { href: "/chat", title: "AI Chat", desc: "Ask banking questions" },
  { href: "/emi", title: "EMI Calculator", desc: "Calculate loan EMIs" },
  { href: "/loan", title: "Loan Eligibility", desc: "Check eligibility" },
  { href: "/cards", title: "Credit Cards", desc: "Compare & recommend" },
  { href: "/faq", title: "FAQ", desc: "Banking knowledge base" },
  { href: "/profile", title: "Profile", desc: "Your account" },
];

export default function Dashboard() {
  const router = useRouter();
  useEffect(() => { if (!getToken()) router.replace("/login"); }, [router]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="opacity-70 mb-8">Welcome to SmartBank AI — educational demo only.</p>
      <div className="grid md:grid-cols-3 gap-4">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href} className="glass p-6 hover:scale-[1.02] transition-transform">
            <h2 className="font-semibold text-lg">{t.title}</h2>
            <p className="text-sm opacity-70 mt-1">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
