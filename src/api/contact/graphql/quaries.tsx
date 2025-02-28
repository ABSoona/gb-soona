import { gql } from '@apollo/client';

export const SEARCH_CONTACTS = gql`
  query SearchContacts($search: String) {
    contacts(where: { nom: { contains: $search, mode: Insensitive } }) {
      id
      nom 
      prenom
      email
      telephone
    }
  }
`;
