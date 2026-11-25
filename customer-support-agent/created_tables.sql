-- 1. Enable the pgvector extension
create extension if not exists vector;

-- 2. Create the documents table
create table documents (
  id bigserial primary key,
  content text, -- Stores the text chunk
  metadata jsonb, -- Stores metadata like the source filename, e.g., {"source": "faq1.md"}
  embedding vector(1536) -- Matches the dimensions of text-embedding-3-small
);

