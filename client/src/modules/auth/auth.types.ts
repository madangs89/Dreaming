export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  name: string;
};

export type AuthSuccessResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
