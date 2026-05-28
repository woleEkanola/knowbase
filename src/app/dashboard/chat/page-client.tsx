"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2, Plus, MessageSquare } from "lucide-react";
import { getMessages } from "@/actions/chat";

interface ChatData {
  id: string;
  title: string;
  createdAt: string;
}

interface MessageData {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  chatId: string;
  createdAt: string;
}

interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPageClient({
  initialChats,
}: {
  initialChats: ChatData[];
}) {
  const [chats, setChats] = useState<ChatData[]>(initialChats);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const selectChat = async (chatId: string) => {
    setActiveChatId(chatId);
    try {
      const msgs = await getMessages(chatId);
      setMessages(
        msgs.map((m: MessageData) => ({
          id: m.id,
          role: m.role === "USER" ? "user" : "assistant",
          content: m.content,
        }))
      );
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: LocalMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantMessage: LocalMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          chatId: activeChatId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      // Get chatId from response headers (for new chats)
      const newChatId = response.headers.get("X-Chat-Id");
      const chatTitle = response.headers
        .get("X-Chat-Title")
        ?.replace(/%20/g, " ");

      if (newChatId && !activeChatId) {
        setActiveChatId(newChatId);
        // Add the new chat to the sidebar
        const newChat: ChatData = {
          id: newChatId,
          title: decodeURIComponent(chatTitle || userMessage.content.slice(0, 60)),
          createdAt: new Date().toISOString(),
        };
        setChats((prev) => [newChat, ...prev]);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last.role === "assistant") {
              return [
                ...prev.slice(0, -1),
                { ...last, content: last.content + chunk },
              ];
            }
            return prev;
          });
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last.role === "assistant" && !last.content) {
          return [
            ...prev.slice(0, -1),
            {
              ...last,
              content:
                "Sorry, something went wrong. Please try again.",
            },
          ];
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0">
      {/* Sidebar */}
      <div className="w-64 shrink-0 border-r border-zinc-800 flex flex-col">
        <div className="p-3 border-b border-zinc-800">
          <button
            onClick={handleNewChat}
            className="flex w-full items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {chats.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-zinc-500">
              No conversations yet
            </p>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => selectChat(chat.id)}
                className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                  activeChatId === chat.id
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{chat.title}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 mb-4">
                <Bot className="h-6 w-6 text-zinc-400" />
              </div>
              <h3 className="text-sm font-medium text-zinc-300">
                {activeChatId ? "Loading messages..." : "Start a conversation"}
              </h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                Ask questions about your documents and get AI-powered answers
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                  <Bot className="h-4 w-4 text-zinc-400" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === "user"
                    ? "bg-zinc-50 text-zinc-900"
                    : "bg-zinc-800/50 text-zinc-200 border border-zinc-800"
                }`}
              >
                <p className="whitespace-pre-wrap">
                  {msg.content || (
                    <span className="inline-flex items-center gap-1 text-zinc-500">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Thinking...
                    </span>
                  )}
                </p>
              </div>
              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-700">
                  <User className="h-4 w-4 text-zinc-300" />
                </div>
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-6 pb-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your documents..."
              disabled={isLoading}
              className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-xl bg-zinc-50 px-4 py-3 text-zinc-900 hover:bg-zinc-200 disabled:opacity-50 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
