# Podcast Vector Embeddings

A demonstration application that converts podcast titles and descriptions
into vector embeddings and populates a Supabase table. These embeddings can be
used to test semantic search, finding podcasts by meaning rather than only by
exact keyword matches.

## What the application does

When the application runs, it:

1. Reads the podcast snippets defined in `content.js`.
2. Generates an embedding for each snippet using OpenAI's
   `text-embedding-ada-002` model.
3. Inserts the text and returned vector into the Supabase `documents` table.

The generated vector has 1,536 dimensions, matching the `embedding` column
defined in `documents.sql`.

## Prerequisites

- Node.js and npm installed;
- a Supabase project;
- an OpenAI API key;
- the project's Supabase `anon`/`public` key.

## Supabase setup

Run the contents of `documents.sql` in the Supabase SQL Editor:

```sql
create table documents (
  id bigserial primary key,
  content text,
  embedding vector(1536)
);
```

Make sure the `vector` extension is enabled in the project. If Row Level
Security (RLS) is enabled for the table, also create a policy that allows
`INSERT` for the key used by the application.

## Environment variables

Create a `.env` file in this directory:

```env
OPENAI_API_KEY=your-openai-api-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_API_KEY=your-supabase-anon-or-public-key
```

Do not use a Supabase Personal Access Token (`sbp_...`) as
`SUPABASE_API_KEY`. Since this project uses the key on the client, do not use
the `service_role` key.

## Running the application

```bash
npm install
npm start
```

When the application starts, `index.js` automatically generates and stores the
embeddings. The records can be viewed in the Supabase `documents` table.

## Semantic search

This application prepares the data for semantic search. To perform a search,
generate an embedding for the user's query and compare it with the
`embedding` column, typically using cosine distance or inner product in a
Supabase SQL function/RPC.

Running the script again inserts the same podcasts again. In a real project,
consider adding a unique identifier and using `upsert` to prevent duplicates.
