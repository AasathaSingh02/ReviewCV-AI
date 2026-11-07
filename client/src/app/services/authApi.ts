import type { SigninFormData } from "@/lib/validationSchemas";
import type { AuthResponse, User } from "@/types/User";
import apiClient from "@/lib/axios";

export async function signin(data: SigninFormData): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>("/auth/login", data);
  return res.data;
}

export async function getCurrentUser(): Promise<AuthResponse> {
  const res = await apiClient.get<AuthResponse>("/auth/me");
  return res.data;
}

export async function updateProfile(data: {
  firstName: string;
  lastName: string;
  email: string;
}): Promise<User> {
  const res = await apiClient.put<{ user: User }>("/auth/update-profile", data);
  return res.data.user;
}

export async function updatePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await apiClient.put<void>("/auth/update-password", data);
}

export async function logoutUser(): Promise<void> {
  await apiClient.post("/auth/logout", {});
}

export async function updateAvatar(style: string): Promise<AuthResponse> {
  const res = await apiClient.put<AuthResponse>("/auth/update-avatar", { style });
  return res.data;
}
