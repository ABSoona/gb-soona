import { gql } from '@apollo/client';

import { USER_FIELDS } from './fragment';

export const GET_USERS = gql`
  query GetUsers($skip: Float, $take: Float, $where : UserWhereInput) {
    users(skip: $skip, take: $take, where: $where, orderBy:[{ createdAt: Asc }]) {
      ...UserFields
    
    }
  }

  ${USER_FIELDS}
`;

// 🔥 Ajout des mutations
export const CREATE_USER = gql`
  mutation CreateUser($data: UserCreateInput!) {
    createUser(data: $data) {
      ...UserFields
    }
  }
  ${USER_FIELDS}

`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: Float! , $data: UserUpdateInput!) {
    updateUser(where: {id : $id}, data: $data) {
      ...UserFields
    }
  }
  ${USER_FIELDS}

`;




export const DELETE_USER = gql`
  mutation DeleteUser($id: Float!) {
    deleteUser(where: { id: $id }) {
      __typename
    }
  }
 
`;

export const SEARCH_USERS = gql`
  query SearchUsers($search: String) {
    users(where: { lastName: { contains: $search, mode: Insensitive },
                  firstName: { contains: $search, mode: Insensitive }     
    }) {
      id
      firstName 
      lastName
      email
      roles
      role
    }
  }
`;

export const SEARCH_USERS_BY_FIRSTNAME = gql`
  query SearchUsersByFirstName($search: String) {
    users(where: { firstName: { contains: $search, mode: Insensitive } }) {
      id
      firstName
      lastName
      email
    }
  }
`;

export const SEARCH_USERS_BY_LASTNAME = gql`
  query SearchUsersByLastName($search: String) {
    users(where: { lastName: { contains: $search, mode: Insensitive } }) {
      id
      firstName
      lastName
      email
    }
  }
`;





