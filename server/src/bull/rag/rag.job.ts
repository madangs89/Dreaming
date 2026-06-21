import { addHalfHourToDate } from "../../configs/datesfn.js";
import { ragQueue } from "./rag.queue.js";
import { RagContentJobData, RagFileJobData } from "./rag.types.js";

export const scheduleRagDocumentJob = async ({
  documentId,
  notesId,
}: RagFileJobData) => {
  await ragQueue.add("rag_files", { documentId, notesId });
};

export const scheduleRagContentJob = async ({
  index_version,
  notesId,
}: RagContentJobData) => {
  const delay = addHalfHourToDate();
  await ragQueue.add("rag_content", { index_version, notesId }, { delay });
};
