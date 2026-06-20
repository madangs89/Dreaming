import { ragQueue } from "./rag.queue.js";
import { RagFileJobData } from "./rag.types.js";

export const scheduleRagDocumentJob = async ({
  documentId,
  notesId,
}: RagFileJobData) => {
  await ragQueue.add("rag_files", { documentId, notesId });
};
