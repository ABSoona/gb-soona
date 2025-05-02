import axiosInstance from '@/lib/axtios-instance';
import { getUserId } from '@/lib/session';
import { User } from '@/model/user/User';


// Récupérer la liste des utilisateurs
export const getUsers = async (): Promise<User[]> => {
  const response = await axiosInstance.get<User[]>('/users');
  return response.data;
};

// Récupérer un utilisateur par ID
export const getUserById = async (id: string): Promise<User> => {
  const response = await axiosInstance.get<User>(`/users/${id}`);
  return response.data;
};

// Créer un nouvel utilisateur
export const createUser = async (user: Partial<User>): Promise<User> => {
  const response = await axiosInstance.post<User>('/users', user);
  return response.data;
};

// Mettre à jour un utilisateur
export const updateUser = async (id: string, data: Partial<User>): Promise<User> => {
  const response = await axiosInstance.patch<User>(`/users/${id}`, data)
  return response.data
}

// Supprimer un utilisateur
export const deleteUser = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/users/${id}`);
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await axiosInstance.get<User>(`/users/${getUserId()}`);
  return response.data;
};
export const resetPasswordRequest = async (email: string): Promise<void> => {
  await axiosInstance.post(`/forgot-password`, { email });
};


export const resetPassword = async (password: string, token: string): Promise<void> => {
  await axiosInstance.post(`/reset-password`, { token, password });
};

export const createUserWithUnvitation = async (user: Partial<User>): Promise<User> => {
  const response = await axiosInstance.post<User>('/users/register', user);
  return response.data;
};
