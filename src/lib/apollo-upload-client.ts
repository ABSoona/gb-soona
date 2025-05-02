import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { createUploadLink } from './customUploadLink';
import { getToken } from './session';

const uploadLink = createUploadLink({
  uri: import.meta.env.VITE_GQL_BASE_URL,
  credentials: 'omit',
});

const authUploadLink = setContext((_, { headers }) => {
  const token = getToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const uploadClient = new ApolloClient({
  link: ApolloLink.from([authUploadLink, uploadLink]),
  cache: new InMemoryCache(),
});
