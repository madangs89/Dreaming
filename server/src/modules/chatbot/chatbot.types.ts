export type ChatBotMetaData = {
  extractedText: string;
  notesId: string;
  documentId: string;
  title: string;
  version: number;
  isDocument: boolean;
};
export type RagReturnedData = {
  pageContent: string;
  metadata: ChatBotMetaData;
};
