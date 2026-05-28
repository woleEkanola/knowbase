import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KnowBase",
  description: "AI-powered knowledge base for your business",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans bg-zinc-950 text-zinc-50 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
