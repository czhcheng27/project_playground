import axios from "@/config/request.ts";

// 创建/更新用户
export const apiUpsertUser = (params: any) =>
  axios.post(`/users/upsertUsers`, params);

// 删除用户
export const apiDeleteUser = (id: string) =>
  axios.delete(`/users/deleteUser/${id}`);

// 查询用户列表
export const apiGetUserList = (params: { page: number; pageSize: number }) =>
  axios.get(`/users/getUserList`, { params });

// 重置用户密码
export const apiResetPwd = (id: string) =>
  axios.put(`/users/${id}/reset-password`);
