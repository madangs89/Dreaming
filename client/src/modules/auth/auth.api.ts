import type { User } from "../user/user.types";
import type { LoginPayload, RegisterPayload } from "./auth.types";

import axios from "axios";

const API_URL: string = String(import.meta.env.VITE_BACKEND_URL);

export const login = async (payload: LoginPayload): Promise<User> => {
  const response = await axios.post(`${API_URL}/api/v1/auth/login`, payload);
  return response.data;
};

export const register = async (payload: RegisterPayload): Promise<User> => {
  const response = await axios.post(`${API_URL}/api/v1/auth/register`, payload);
  return response.data;
};

export const logout = async () => {};
