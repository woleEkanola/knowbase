import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { generateEmbedding } from "@/lib/embedding";

const f = createUploadthing();

/**
 * Split text into overlapping chunks for better RAG retrieval.
 * @param text - The full extracted text
 * @param chunkSize - Target size of each chunk (default 1000 chars)
 * @param overlap - Number of characters to overlap between chunks (default 200)
 */
function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  const step = Math.max(chunkSize - overlap, 1);
  let i = 0;

  while (i < text.length) {
    const end = Math.min(i + chunkSize, text.length);
    chunks.push(text.slice(i, end));
    i += step;
    if (end >= text.length) break;
  }

  return chunks;
}

const ourFileRouter = {
  documentUploader: f({
    pdf: { maxFileSize: "32MB", maxFileCount: 5 },
    text: { maxFileSize: "1MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session) throw new UploadThingError("Unauthorized");
      return { workspaceId: session.user.workspaceId, userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      let extractedText = "";

      try {
        const response = await fetch(file.ufsUrl);
        const buffer = await response.arrayBuffer();

        if (file.type === "application/pdf") {
          const { PDFParse } = await import("pdf-parse");
          const parser = new PDFParse({ data: Buffer.from(buffer) });
          const parsed = await parser.getText();
          extractedText = parsed.text;
        } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
          extractedText = Buffer.from(buffer).toString("utf-8");
        }
      } catch (error) {
        console.error("Text extraction error:", error);
        extractedText = "[Could not extract text from this file]";
      }

      // Save the full document record first
      const { data: document, error: docError } = await supabase
        .from("Document")
        .insert({
          fileName: file.name,
          fileUrl: file.ufsUrl,
          extractedText: extractedText || "[No text extracted]",
          workspaceId: metadata.workspaceId,
        })
        .select()
        .single();

      if (docError || !document) {
        console.error("Supabase document insert error:", docError);
        throw new UploadThingError("Failed to save document to database");
      }

      // Chunk the text and save chunks with embeddings for semantic search
      const textToChunk = extractedText || "[No text extracted]";
      const chunks = chunkText(textToChunk, 1000, 200);

      if (chunks.length > 0 && chunks[0].length > 0) {
        // Insert chunks first (without embeddings)
        const chunkRows = chunks.map((content, index) => ({
          documentId: document.id,
          workspaceId: metadata.workspaceId,
          content,
          chunkIndex: index,
        }));

        const { error: chunkError } = await supabase
          .from("DocumentChunk")
          .insert(chunkRows);

        if (chunkError) {
          console.error("Supabase chunk insert error:", chunkError);
        } else {
          // Generate embeddings and update each chunk row
          for (let i = 0; i < chunks.length; i++) {
            try {
              const embedding = await generateEmbedding(chunks[i]);
              await supabase
                .from("DocumentChunk")
                .update({ embedding })
                .eq("documentId", document.id)
                .eq("chunkIndex", i);
            } catch (embedError) {
              console.error(`Embedding error for chunk ${i}:`, embedError);
              // Continue with next chunk — embeddings are a bonus
            }
          }
        }
      }

      return {
        uploadedBy: metadata.userId,
        workspaceId: metadata.workspaceId,
        fileUrl: file.ufsUrl,
        fileName: file.name,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

export { ourFileRouter };
