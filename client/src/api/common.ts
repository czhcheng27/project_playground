import axios from "@/config/request.ts";

// login
export const apiLogin = (params: { identifier: string; password: string }) =>
  axios.post(`/auth/login`, params);
