import axios from "axios";
import type { GetTopicApiRes, TopicApiRes, TopicData } from "./topic.types";

const API_URL: string = String(import.meta.env.VITE_BACKEND_URL);

export const fetchTopics = async (): Promise<TopicData[]> => {
  const response = await axios.get<GetTopicApiRes>(
    `${API_URL}/api/v1/topic/all`,
    {
      withCredentials: true,
    },
  );
  return response.data.topic || [];
};

export const createTopic = async ({
  title,
  image,
}: {
  title: string;
  image: File | null;
}): Promise<TopicData> => {
  const formData = new FormData();
  formData.append("title", title);
  if (image) {
    formData.append("source", image);
  }

  const response = await axios.post<TopicApiRes>(
    `${API_URL}/api/v1/topic/create`,
    formData,
    {
      withCredentials: true,
    },
  );
  return response.data.topic!;
};
