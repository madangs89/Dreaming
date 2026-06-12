export type TopicData = {
  id: string;
  title: string;
  source_url?: string | null;
  user_id: string;
  updatedAt: Date | string;
  createdAt: Date | string;
  _count?: {
    notes: number;
  };
};

export type TopicApiRes = {
  success: boolean;
  message: string;
  topic?: TopicData;
  errors?: unknown;
};

export type GetTopicApiRes = {
  success: boolean;
  message: string;
  topic?: TopicData[];
  errors?: unknown;
};
