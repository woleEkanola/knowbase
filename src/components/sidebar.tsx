"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Library,
} from "lucide-react";

interface SidebarProps {
  workspaceName: string;
}

const navigation = [
  { name: "Documents", href: "/dashboard/documents", icon: Library },
  { name: "Chat", href: "/dashboard/chat", icon: MessageSquare },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({ workspaceName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 border-r border-zinc-800 bg-zinc-900/50">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50">
          <FileText className="h-4 w-4 text-zinc-900" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-zinc-50">
            {workspaceName}
          </span>
          <span className="text-xs text-zinc-500">Workspace</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-zinc-800 text-zinc-50"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-4">
        <button
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
