// src/lib/apollo-client.ts
import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// 1. Lien HTTP pour la connexion à l'API GraphQL
const httpLink = createHttpLink({
  uri:  import.meta.env.VITE_GQL_BASE_URL ,
  credentials: 'omit', // Gère les cookies si nécessaire
});

// 2. Lien d'authentification pour ajouter le token dans les en-têtes
const authLink = setContext((_, { headers }) => {
  const token = getToken();

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// 3. Combinaison des liens
const link = ApolloLink.from([authLink, httpLink]);

// 4. Configuration d'Apollo Client
export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
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
  export const getToken = () => {
    return localStorage.getItem('token');
  };