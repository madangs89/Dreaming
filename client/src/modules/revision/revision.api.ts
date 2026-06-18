import axios from "axios";
import type {
  QuestionSuccessRes,
  RevisionBody,
  RevisionQuestion,
  RevisionSuccessRes,
} from "./revision.types";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const getAllTodayRevisions = async (): Promise<RevisionBody[]> => {
  const response = await axios.get<RevisionSuccessRes<RevisionBody[]>>(
    `${API_URL}/api/v1/reviews/today`,
    {
      withCredentials: true,
    },
  );

  return response.data.review || [];
};

export const getAllTodayQuestions = async ({
  review_Id,
}: {
  review_Id: string;
}): Promise<RevisionQuestion[]> => {
  const response = await axios.get<QuestionSuccessRes<RevisionQuestion[]>>(
    `${API_URL}/api/v1/questionhistory/today/${review_Id}`,
    {
      withCredentials: true,
    },
  );
  return response.data.questions || [];
};
