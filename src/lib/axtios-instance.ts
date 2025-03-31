// axiosInstance.ts
import axios from 'axios';
import { toast } from '@/hooks/use-toast' 
// Crée une instance Axios avec l'URL de base
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Intercepteur pour inclure le token dans chaque requête
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs de réponse
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.error('Token expiré ou non valide. Déconnexion.');
      logout();
    }

    // ✅ Gérer tous les autres codes d'erreur ici
    const backendMessage = error?.response?.data?.message;

    if (backendMessage) {
      const message = Array.isArray(backendMessage)
        ? backendMessage.join(', ')
        : backendMessage;

      toast({
        title: 'Erreur',
        description: message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Erreur inconnue',
        description: 'Une erreur est survenue.',
        variant: 'destructive',
      });
    }

    return Promise.reject(error); // pour continuer la gestion locale si besoin
  }
);
// Fonction pour stocker les informations utilisateur
export function setSession(token: string, userId: string, username: string, roles: string[]) {
  localStorage.setItem('token', token);
  localStorage.setItem('userId', userId);
  localStorage.setItem('username', username);
  localStorage.setItem('roles', JSON.stringify(roles));
}

// Fonction pour nettoyer la session lors de la déconnexion
export function logout() {
  localStorage.clear();
}

export default axiosInstance;
