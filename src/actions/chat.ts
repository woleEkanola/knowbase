"use server";

import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function getMessages(chatId: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("Message")
    .select("*")
    .eq("chatId", chatId)
    .order("createdAt", { ascending: true });

  if (error) {
    console.error("Get messages error:", error);
    throw new Error("Failed to load messages");
  }

  return data;
}

export async function getChats() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("Chat")
    .select("id, title, createdAt")
    .eq("workspaceId", session.user.workspaceId)
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("Get chats error:", error);
    throw new Error("Failed to load chats");
  }

  return data ?? [];
}
