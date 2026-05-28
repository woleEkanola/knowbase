import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import ChatPageClient from "./page-client";

export default async function ChatPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const { data: chats } = await supabase
    .from("Chat")
    .select("id, title, createdAt")
    .eq("workspaceId", session.user.workspaceId)
    .order("createdAt", { ascending: false });

  return <ChatPageClient initialChats={chats || []} />;
}
