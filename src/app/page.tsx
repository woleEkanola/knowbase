import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogIn } from "lucide-react";

export default async function Home() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold tracking-tight">KnowBase</h1>
        <p className="mt-3 text-zinc-400 leading-relaxed">
          Upload your documents and chat with them instantly. Powered by AI.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-50 px-5 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-900 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </main>
  );
}
