-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "rag_chunks" (
    "id" BIGSERIAL NOT NULL,
    "content" TEXT,
    "metadata" JSONB,
    "embedding" vector(3072),

    CONSTRAINT "rag_chunks_pkey" PRIMARY KEY ("id")
);

-- Similarity search function
CREATE FUNCTION match_documents (
  query_embedding vector(3072),
  match_count INT DEFAULT NULL,
  filter JSONB DEFAULT '{}'
)
RETURNS TABLE (
  id BIGINT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  SELECT
    rag_chunks.id,
    rag_chunks.content,
    rag_chunks.metadata,
    1 - (rag_chunks.embedding <=> query_embedding) AS similarity
  FROM rag_chunks
  WHERE rag_chunks.metadata @> filter
  ORDER BY rag_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;