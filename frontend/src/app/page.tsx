import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <div className="glass p-12 max-w-xl">
        <h1 className="text-4xl font-bold mb-4">SmartBank AI</h1>
        <p className="opacity-70 mb-8">Educational banking assistant — loans, EMIs, cards & financial literacy. Demo only.</p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-xl">Get Started</Link>
          <Link href="/faq" className="px-6 py-3 glass rounded-xl">Browse FAQ</Link>
        </div>
      </div>
    </div>
  );
}
