import { gql } from '@apollo/client';

export const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    email
    firstName
    lastName
    username
    role
    roles
    status
    createdAt
    updatedAt
    adresseCodePostal
    adresseRue
    adresseVille
    telephone
    token
    hasAccess
    superieur {
      id
      email
      firstName
      lastName
      username
      role
      roles
      status
      createdAt
      updatedAt
      adresseCodePostal
      adresseRue
      adresseVille
      telephone
    }
    subordonnes {
      id
      email
      firstName
      lastName
      username
      role
      roles
      status
      createdAt
      updatedAt
      adresseCodePostal
      adresseRue
      adresseVille
      telephone
    }
  }
`;
