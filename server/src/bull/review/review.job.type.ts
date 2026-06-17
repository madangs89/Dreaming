import * as z from "zod";
export type ReviewJobData = {
  notes_id: string;
  topic_id: string;
  user_id: string;
  old_notes_content?: string;
};
