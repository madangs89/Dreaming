export type DocumentData = {
  id: string;
  notes_id: string;
  url: string;
  memetype: string;
  title: string;
  public_id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type ReviewData = {
  id: string;
  notes_id: string;
  topic_id: string;
  scheduled_date: Date | string;
  status: string;
  is_completed: boolean;
  review_results?: string;
  is_revision_enough: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type NoteData = {
  id: string;
  title: string;
  content: string;
  topic_id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  documents: DocumentData[] | [];
  reviews: ReviewData[] | [];
  contentTimeStamp: Date | string;
  titleTimeStamp: Date | string;
};

export type NoteSuccessResponse<T> = {
  success: boolean;
  note: T;
  message: string;
};

export type NoteErrorResponse = {
  success: boolean;
  message: string;
  errors?: unknown;
};

export type DocumentBody = {
  id: string;
  notes_id: string;
  url: string;
  memetype: string;
  title: string;
  public_id: string;
  createdAt: Date;
  updatedAt: Date;
};
