-- Migration: Add DocumentChunk table for RAG chunking
-- Run this in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS "DocumentChunk" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "documentId" TEXT NOT NULL REFERENCES "Document"(id) ON DELETE CASCADE,
  "workspaceId" TEXT NOT NULL,
  content TEXT NOT NULL,
  "chunkIndex" INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast chunk retrieval by workspace
CREATE INDEX IF NOT EXISTS idx_document_chunk_workspace 
ON "DocumentChunk"("workspaceId");

-- Disable RLS for MVP (use service_role key in production)
ALTER TABLE "DocumentChunk" DISABLE ROW LEVEL SECURITY;
