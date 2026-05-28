import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 mb-4">
        <Settings className="h-6 w-6 text-zinc-400" />
      </div>
      <h2 className="text-xl font-semibold text-zinc-200">Settings</h2>
      <p className="mt-2 text-sm text-zinc-500 max-w-sm">
        Workspace and account settings will be available soon.
      </p>
    </div>
  );
}
