import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { generateEmbedding } from "@/lib/embedding";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, chatId } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Create or get chat
    let chat: { id: string; title: string };

    if (chatId) {
      // Verify the chat belongs to this workspace
      const { data: existing } = await supabase
        .from("Chat")
        .select("id, title")
        .eq("id", chatId)
        .eq("workspaceId", session.user.workspaceId)
        .single();

      if (!existing) {
        return NextResponse.json({ error: "Chat not found" }, { status: 404 });
      }
      chat = existing;
    } else {
      // Create a new chat with title from first message
      const title = message.slice(0, 60) + (message.length > 60 ? "..." : "");
      const { data: created, error: createError } = await supabase
        .from("Chat")
        .insert({
          title,
          workspaceId: session.user.workspaceId,
        })
        .select()
        .single();

      if (createError || !created) {
        console.error("Chat creation error:", createError);
        return NextResponse.json(
          { error: "Failed to create chat" },
          { status: 500 }
        );
      }
      chat = created;
    }

    // Save the user message
    const { error: msgError } = await supabase.from("Message").insert({
      role: "USER",
      content: message,
      chatId: chat.id,
    });

    if (msgError) {
      console.error("Message save error:", msgError);
    }

    // Load conversation history for multi-turn context
    const { data: history } = await supabase
      .from("Message")
      .select("role, content")
      .eq("chatId", chat.id)
      .order("createdAt", { ascending: true });

    const historyMessages: Array<{ role: "user" | "assistant"; content: string }> =
      history?.map((m: any) => ({
        role: (m.role === "USER" ? "user" : "assistant") as "user" | "assistant",
        content: m.content,
      })) ?? [];

    // RAG: semantic search over document chunks
    const questionEmbedding = await generateEmbedding(message);
    let { data: similarChunks, error: searchError } = await supabase.rpc(
      "search_document_chunks",
      {
        query_embedding: questionEmbedding,
        workspace_id_param: session.user.workspaceId,
        match_count: 30,
      }
    );

    if (searchError) {
      console.error("Vector search error:", searchError);
      const { data: fallback } = await supabase
        .from("DocumentChunk")
        .select("content, chunkIndex, documentId, Document(fileName)")
        .eq("workspaceId", session.user.workspaceId)
        .order("chunkIndex", { ascending: true })
        .limit(30);
      similarChunks = fallback || [];
    }

    // Build RAG context from chunks
    let context = "";
    if (similarChunks && similarChunks.length > 0) {
      const seen = new Set<string>();
      const unique: any[] = [];
      for (const chunk of similarChunks) {
        const key = chunk.content?.slice(0, 100);
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(chunk);
        }
      }

      context = unique
        .map((chunk: any) => {
          const fileName = chunk.Document?.fileName || "Document";
          const score =
            chunk.similarity != null
              ? ` (relevance: ${chunk.similarity.toFixed(2)})`
              : "";
          return `--- ${fileName}${score} ---\n${chunk.content}`;
        })
        .join("\n\n");
    }

    // Build system prompt with RAG context
    const ragContext = context || "No documents have been uploaded yet.";
    const systemPrompt = `You are a helpful AI assistant for a business knowledge base. You answer questions using ONLY the document chunks provided below.

When answering:
- Extract answers directly from the document text
- Acronyms and definitions found in the documents should be clearly stated
- If the documents contain the answer (even indirectly), provide it
- Only say "I don't have that information" if the documents contain absolutely nothing about the topic

Document chunks:
${ragContext}`;

    // Build messages array: system + history + current
    const groqMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
      ...historyMessages,
    ];

    // Stream from Groq
    const stream = await groq.chat.completions.create({
      messages: groqMessages,
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 2048,
      stream: true,
    });

    // Accumulate response for DB save
    let fullResponse = "";
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              fullResponse += content;
              controller.enqueue(encoder.encode(content));
            }
          }

          // Save assistant response to DB after streaming completes
          if (fullResponse) {
            await supabase.from("Message").insert({
              role: "ASSISTANT",
              content: fullResponse,
              chatId: chat.id,
            });
          }

          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Chat-Id": chat.id,
        "X-Chat-Title": encodeURIComponent(chat.title),
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
