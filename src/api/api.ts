// api.ts
import axiosInstance, { setSession } from '../lib/axtios-instance';




interface LoginResponse {
  accessToken: string;
  id: string;
  username: string;
  roles: string[];
}

// Fonction pour se connecter
export async function login(username: string, password: string) {
  console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
  const response = await axiosInstance.post<LoginResponse>('/login', { username, password });

  const { accessToken, id, username: user, roles } = response.data;
  setSession(accessToken, id, user, roles); // Stockage du token et des données utilisateur

  return response.data;
}
