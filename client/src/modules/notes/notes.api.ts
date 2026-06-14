import axios from "axios";
import type { NoteData, NoteSuccessResponse } from "./notes.type";

const API_URL = import.meta.env.VITE_BACKEND_URL;
export const fetchAllNotes = async ({ id }: { id: string }) => {
  const response = await axios.get<NoteSuccessResponse<NoteData[]>>(
    `${API_URL}/api/v1/notes/all/${id}`,
    {
      withCredentials: true,
    },
  );
  return response.data.note || [];
};
export const getSingleNote = async ({ id }: { id: string }) => {
  const response = await axios.get<NoteSuccessResponse<NoteData>>(
    `${API_URL}/api/v1/notes/${id}`,
    {
      withCredentials: true,
    },
  );
  return response.data.note || [];
};

export const createNoteOnlyTitle = async ({
  title,
  topic_id,
  timeStamp = new Date(),
}: {
  title: string;
  topic_id: string;
  timeStamp: Date;
}) => {
  const response = await axios.post<NoteSuccessResponse<NoteData>>(
    `${API_URL}/api/v1/notes/create/title`,
    { title, topic_id, timeStamp },
    {
      withCredentials: true,
    },
  );
  return response.data.note;
};

export const updateNoteTitle = async ({
  id,
  title,
  timeStamp = new Date(),
}: {
  id: string;
  title: string;
  timeStamp: Date;
}) => {
  const response = await axios.patch<NoteSuccessResponse<NoteData>>(
    `${API_URL}/api/v1/notes/title/${id}`,
    { title, timeStamp },
    {
      withCredentials: true,
    },
  );
  return response.data.note;
};
export const updateNoteContent = async ({
  id,
  content,
  timeStamp = new Date(),
}: {
  id: string;
  content: string;
  timeStamp: Date;
}) => {
  const response = await axios.patch<NoteSuccessResponse<NoteData>>(
    `${API_URL}/api/v1/notes/content/${id}`,
    { content, timeStamp },
    {
      withCredentials: true,
    },
  );
  return response.data.note;
};

export const deleteNote = async ({ id }: { id: string }) => {
  const response = await axios.delete<NoteSuccessResponse<null>>(
    `${API_URL}/api/v1/notes/${id}`,
    {
      withCredentials: true,
    },
  );
  return response.data;
};
