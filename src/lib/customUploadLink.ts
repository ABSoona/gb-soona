// customUploadLink.ts
import { ApolloLink, Observable } from '@apollo/client';
import { print } from 'graphql';
import { getToken } from './session';

export function createUploadLink({ uri, credentials }: { uri: string; credentials: RequestCredentials }) {
  return new ApolloLink((operation) => {
    return new Observable((observer) => {
      const formData = new FormData();
      const { query, variables } = operation;

      // Ajoute la requête GraphQL classique
      formData.append('operations', JSON.stringify({
        query: print(query),
        variables: variables,
      }));

      // Crée une map vide (si tu veux gérer plusieurs fichiers + mapping)
      const map: Record<string, string[]> = {};
      const files: Record<string, File> = {};

      // Détection auto des fichiers dans les variables
      Object.keys(variables).forEach((key, index) => {
        if (variables[key] instanceof File) {
          map[`${index}`] = [`variables.${key}`];
          files[`${index}`] = variables[key];
        }
      });

      formData.append('map', JSON.stringify(map));

      // Ajoute tous les fichiers détectés
      Object.keys(files).forEach((key) => {
        formData.append(key, files[key]);
      });

      fetch(uri, {
        method: 'POST',
        body: formData,
        credentials,
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'x-apollo-operation-name': operation.operationName || 'upload',
        },
      })
        .then(async (res) => {
          const json = await res.json();
          observer.next(json);
          observer.complete();
        })
        .catch((err) => observer.error(err));
    });
  });
}
