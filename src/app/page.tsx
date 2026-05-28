import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Brain,
  FileText,
  Zap,
  MessageSquare,
  Shield,
} from "lucide-react";

export default async function Home() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950">
      {/* Animated background grid */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(250 250 250) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow orbs */}
        <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-violet-500/15 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] h-[300px] w-[300px] rounded-full bg-indigo-500/10 blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-zinc-50">
            KnowBase
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/signin"
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-lg bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-24 pt-16 text-center sm:pt-24">
        {/* Badge */}
        <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-zinc-700/50 bg-zinc-800/50 px-4 py-1.5 text-xs text-zinc-400 backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Powered by Groq & Supabase
        </div>

        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          Your documents,
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
            supercharged with AI
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
          Upload your company documents, reports, and knowledge base. Instantly
          chat with them using cutting-edge AI. Get answers in seconds — no
          more digging through files.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/auth/signup"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/40 hover:scale-[1.02]"
          >
            Start your workspace
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 px-6 py-3 text-sm font-medium text-zinc-300 backdrop-blur-sm transition-all hover:border-zinc-600 hover:bg-zinc-800"
          >
            Sign in to workspace
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-12 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-100">
            Built for speed and scale
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1 */}
          <div className="group rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 backdrop-blur-sm transition-all hover:border-zinc-700/80 hover:bg-zinc-900/60">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 ring-1 ring-violet-500/20">
              <FileText className="h-5 w-5 text-violet-400" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">
              Document Upload
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Drag-and-drop your PDFs and text files. Text is automatically
              extracted, chunked, and indexed for instant retrieval.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 backdrop-blur-sm transition-all hover:border-zinc-700/80 hover:bg-zinc-900/60">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/20">
              <Brain className="h-5 w-5 text-cyan-400" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">
              Vector Search
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Every chunk is embedded with semantic meaning. Questions find the
              exact paragraphs — not just keyword matches.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 backdrop-blur-sm transition-all hover:border-zinc-700/80 hover:bg-zinc-900/60">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <Zap className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">
              Groq-Powered
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Responses stream in real-time from Groq's LPU infrastructure.
              Sub-second inference with no cold starts.
            </p>
          </div>

          {/* Card 4 */}
          <div className="group rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 backdrop-blur-sm transition-all hover:border-zinc-700/80 hover:bg-zinc-900/60">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 ring-1 ring-orange-500/20">
              <MessageSquare className="h-5 w-5 text-orange-400" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">
              Multi-turn Chat
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Full conversation history stored and recalled. Ask follow-up
              questions, refine your queries, and dig deeper.
            </p>
          </div>

          {/* Card 5 */}
          <div className="group rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 backdrop-blur-sm transition-all hover:border-zinc-700/80 hover:bg-zinc-900/60">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 ring-1 ring-rose-500/20">
              <Shield className="h-5 w-5 text-rose-400" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">
              Workspace Isolation
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Every team gets their own secure workspace. Data is strictly
              partitioned — no cross-contamination between tenants.
            </p>
          </div>

          {/* Card 6 */}
          <div className="group rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 backdrop-blur-sm transition-all hover:border-zinc-700/80 hover:bg-zinc-900/60">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 ring-1 ring-sky-500/20">
              <ArrowRight className="h-5 w-5 text-sky-400" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">
              Zero Setup Ops
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              No vector DBs to configure, no embedding APIs to pay for.
              Everything runs locally and auto-configures on deploy.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-32 text-center">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-10 backdrop-blur-sm">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
            Ready to transform your knowledge base?
          </h2>
          <p className="mt-3 text-zinc-400">
            Create your workspace and start uploading documents in under a
            minute.
          </p>
          <Link
            href="/auth/signup"
            className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/40 hover:scale-[1.02]"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/60 px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Brain className="h-4 w-4 text-violet-400" />
            <span>KnowBase &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-zinc-600">
            Built with Next.js, Supabase, UploadThing & Groq
          </p>
        </div>
      </footer>
    </div>
  );
}
