import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import DocumentsPageClient from "./page-client";

export default async function DocumentsPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const { data: documents } = await supabase
    .from("Document")
    .select("id, fileName, fileUrl, extractedText, createdAt")
    .eq("workspaceId", session.user.workspaceId)
    .order("createdAt", { ascending: false });

  return <DocumentsPageClient documents={documents || []} />;
}
