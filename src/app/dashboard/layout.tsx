import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const { data: workspace } = await supabase
    .from("Workspace")
    .select("name")
    .eq("id", session.user.workspaceId)
    .single();

  return (
    <div className="flex h-screen bg-zinc-950">
      <Sidebar workspaceName={workspace?.name || "Workspace"} />
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
