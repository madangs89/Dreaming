import axios from "axios";
import type {
  QuestionSuccessRes,
  RevisionAttemptBody,
  RevisionAttemptSuccessRes,
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

export const submitRevisionAttempt = async ({
  reviewId,
  answers,
}: {
  reviewId: string;
  answers: Record<string, string>;
}): Promise<RevisionAttemptBody> => {
  const response = await axios.post<
    RevisionAttemptSuccessRes<RevisionAttemptBody>
  >(
    `${API_URL}/api/v1/reviews/attempt/submit/${reviewId}`,
    { answers },
    {
      withCredentials: true,
    },
  );
  return response.data.attempt!;
};

export const getRevisionAttemptResults = async ({
  attemptId,
}: {
  attemptId: string;
}): Promise<RevisionAttemptSuccessRes<RevisionAttemptBody>> => {
  const response = await axios.get<
    RevisionAttemptSuccessRes<RevisionAttemptBody>
  >(`${API_URL}/api/v1/revisionattempts/${attemptId}`, {
    withCredentials: true,
  });
  return response.data;
};
