import { onError } from '@apollo/client/link/error';
import { logout } from './session';
import { getToken } from './session';
import { ApolloClient, InMemoryCache, ApolloLink, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Lien HTTP
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GQL_BASE_URL,
  credentials: 'omit',
});

// Auth link
const authLink = setContext((_, { headers }) => {
  const token = getToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// ✅ Error link amélioré pour capter les 401 via "networkError.response"
const errorLink = onError(({ graphQLErrors, networkError }) => {
  // 1️⃣ Gestion via graphQLErrors
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (err.extensions?.code === 'UNAUTHENTICATED') {
        console.warn('GraphQL: UNAUTHENTICATED detected');
        logout();
        return;
      }
    }
  }

  // 2️⃣ En cas de fallback réseau (optionnel mais bien de le garder)
  if (networkError) {
    if ('status' in networkError && networkError.status === 401) {
      console.warn('Network: 401 Unauthorized');
      logout();
    }
  }
});

// Combine les links dans l'ordre
const link = ApolloLink.from([authLink, errorLink, httpLink]);

// Client Apollo
export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
