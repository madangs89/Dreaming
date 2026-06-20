import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_SECRET_KEY, SUPABASE_URL } from "./env.config.js";
import { embeddings } from "./google.js";

const client = createClient(SUPABASE_URL!, SUPABASE_SECRET_KEY!);

export const vectorStore = new SupabaseVectorStore(embeddings, {
  client,
  tableName: "rag_chunks",
  queryName: "match_documents",
});
