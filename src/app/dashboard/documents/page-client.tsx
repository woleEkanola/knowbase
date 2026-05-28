"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@/components/upload-button";
import { FileText, Trash2, Loader2, FileUp } from "lucide-react";

interface Document {
  id: string;
  fileName: string;
  fileUrl: string;
  extractedText: string;
  createdAt: string;
}

interface DocumentsPageProps {
  documents: Document[];
}

export default function DocumentsPageClient({ documents }: DocumentsPageProps) {
  const [docs, setDocs] = useState<Document[]>(documents);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDocs(docs.filter((d) => d.id !== id));
        router.refresh();
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Upload and manage your knowledge base files
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
            <FileUp className="h-5 w-5 text-zinc-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-zinc-200">Upload Files</h3>
            <p className="text-xs text-zinc-500">PDF and TXT files supported</p>
          </div>
        </div>
        <UploadButton
          endpoint="documentUploader"
          onClientUploadComplete={() => {
            // Wait a moment for server-side processing (text extraction + DB insert)
            setTimeout(() => {
              router.refresh();
            }, 1500);
          }}
          onUploadError={(error: Error) => {
            console.error("Upload error:", error);
            alert(`Upload failed: ${error.message}`);
          }}
          appearance={{
            button:
              "inline-flex items-center gap-2 rounded-lg bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200 transition-colors ut-ready:bg-zinc-50 ut-ready:text-zinc-900 ut-readying:bg-zinc-700 ut-readying:text-zinc-200 ut-uploading:bg-zinc-700 ut-uploading:text-zinc-200",
            allowedContent:
              "flex flex-col items-center justify-center text-zinc-500 text-xs mt-2",
          }}
        />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-200">
            Uploaded Documents ({docs.length})
          </h2>
        </div>

        {docs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FileText className="mx-auto h-8 w-8 text-zinc-600 mb-3" />
            <p className="text-sm text-zinc-500">No documents yet</p>
            <p className="text-xs text-zinc-600 mt-1">
              Upload your first file above
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-zinc-800/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 shrink-0">
                    <FileText className="h-4 w-4 text-zinc-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">
                      {doc.fileName}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                    title="Download"
                  >
                    <FileText className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    className="rounded-lg p-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
