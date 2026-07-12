"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Moon, Sun, LogOut } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/chat", label: "AI Chat" },
  { href: "/emi", label: "EMI" },
  { href: "/loan", label: "Loan" },
  { href: "/cards", label: "Cards" },
  { href: "/faq", label: "FAQ" },
  { href: "/profile", label: "Profile" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  if (path === "/" || path === "/login") return <>{children}</>;

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 p-4 glass m-4 hidden md:block">
        <h1 className="font-bold text-lg mb-6">SmartBank AI</h1>
        <nav className="space-y-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`block px-3 py-2 rounded-lg text-sm ${path === l.href ? "bg-blue-600 text-white" : "hover:bg-white/10"}`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <button onClick={() => setDark(!dark)} className="mt-6 flex items-center gap-2 text-sm opacity-70">
          {dark ? <Sun size={16} /> : <Moon size={16} />} Theme
        </button>
        <button onClick={() => { localStorage.clear(); location.href = "/login"; }} className="mt-2 flex items-center gap-2 text-sm opacity-70">
          <LogOut size={16} /> Logout
        </button>
      </aside>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
