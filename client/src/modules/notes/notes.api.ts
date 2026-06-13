import axios from "axios";
import type { NoteData, NoteSuccessResponse } from "./notes.type";

const API_URL = import.meta.env.VITE_BACKEND_URL;
export const fetchAllNotes = async ({ id }: { id: string }) => {
  const response = await axios.get<NoteSuccessResponse<NoteData[]>>(
    `${API_URL}/api/v1/notes/all/${id}`,{
        withCredentials: true,
    }
  );
  return response.data.note || [];
};
