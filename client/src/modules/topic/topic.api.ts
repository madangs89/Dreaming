import axios from "axios";
import type { TopicData } from "./topic.types";

const API_URL: string = String(import.meta.env.VITE_BACKEND_URL);

export const fetchTopics = async (): Promise<TopicData[]> => {
  const response = await axios.get(`${API_URL}/api/v1/topic/all`, {
    withCredentials: true,
  });
  return response.data.topic;
};
