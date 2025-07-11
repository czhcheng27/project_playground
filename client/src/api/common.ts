import axios from "@/config/request.ts";

// login
export const apiLogin = (params: { identifier: string; password: string }) =>
  axios.post(`/auth/login`, params);

// logout
export const apiLogout = () => axios.post(`/auth/logout`);

// get latest Permissions
export const apiLatestPermissions = () => axios.get(`/users/me`);
