-- Enable pgvector extension (required for semantic search)
CREATE EXTENSION IF NOT EXISTS vector;

-- Add 384-dimensional embedding column (all-MiniLM-L6-v2 output size)
ALTER TABLE "DocumentChunk"
ADD COLUMN IF NOT EXISTS embedding vector(384);

-- ANN index for fast cosine similarity search
-- Note: ivfflat works best after ~1000+ rows exist; for small datasets cosine distance is still fast
CREATE INDEX IF NOT EXISTS idx_chunk_embedding
ON "DocumentChunk" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- RPC function: find top N chunks by cosine similarity to the question vector
CREATE OR REPLACE FUNCTION search_document_chunks(
  query_embedding vector(384),
  workspace_id_param TEXT,
  match_count INT DEFAULT 10
)
RETURNS TABLE(
  id TEXT,
  content TEXT,
  "chunkIndex" INT,
  "documentId" TEXT,
  "Document" JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.content,
    dc."chunkIndex",
    dc."documentId",
    jsonb_build_object('fileName', d."fileName"),
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM "DocumentChunk" dc
  JOIN "Document" d ON d.id = dc."documentId"
  WHERE dc."workspaceId" = workspace_id_param
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
