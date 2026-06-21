import type { User } from "../user/user.types";
import type { LoginPayload, RegisterPayload } from "./auth.types";

import axios from "axios";

const API_URL: string = String(import.meta.env.VITE_BACKEND_URL);

export const login = async (payload: LoginPayload): Promise<User> => {
  const response = await axios.post(`${API_URL}/api/v1/auth/login`, payload, {
    withCredentials: true,
  });
  return response.data;
};

export const register = async (payload: RegisterPayload): Promise<User> => {
  const response = await axios.post(
    `${API_URL}/api/v1/auth/register`,
    payload,
    {
      withCredentials: true,
    },
  );
  return response.data;
};

export const me = async (): Promise<User | undefined> => {
  const response = await axios.get(`${API_URL}/api/v1/auth/me`, {
    withCredentials: true,
  });

  console.log("Me response:", response.data);
  return response.data.data;
};

export const logout = async (): Promise<void> => {
  const response = await axios.post(`${API_URL}/api/v1/auth/logout`, null, {
    withCredentials: true,
  });
  console.log("Logout response:", response.data);
};
