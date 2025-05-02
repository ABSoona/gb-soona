import { AIDE_FIELDS } from '@/api/aide/graphql/fragment';
import { DEMANDE_FIELDS } from '@/api/demande/graphql/fragment';
import { gql } from '@apollo/client';
import { CONTACT_FIELDS } from './fragment';

export const SEARCH_CONTACTS = gql`
  query SearchContacts($search: String) {
    contacts(where: { nom: { contains: $search, mode: Insensitive } }) {
      id
      nom 
      prenom
      age
      email
      telephone
      adresse
      ville
      codePostal
      status
    }
  }
`;
export const GET_CONTACTS = gql`
  query GetContacts($skip: Float, $take: Float, $where : ContactWhereInput) {
    contacts(skip: $skip, take: $take, where: $where, orderBy:[{ createdAt: Asc }]) {
      ...ContactFields
          aides {
          ...AideFields
        }
          demandes {
          ...DemandeFields
        }
      }
  }
  ${CONTACT_FIELDS}
  ${AIDE_FIELDS}
  ${DEMANDE_FIELDS}
`;

export const GET_CONTACT = gql`
  query GetContacts($skip: Float, $take: Float, $where : ContactWhereInput) {
    contacts(skip: $skip, take: $take, where: $where, orderBy:[{ createdAt: Asc }]) {
      ...ContactFields
      }
  }
  ${CONTACT_FIELDS}
 
`;

// 🔥 Ajout des mutations
export const CREATE_CONTACT = gql`
  mutation CreateContact($data: ContactCreateInput!) {
    createContact(data: $data) {
      ...ContactFields
    }
  }
  ${CONTACT_FIELDS}

`;

export const UPDATE_CONTACT = gql`
  mutation UpdateContact($id: Float! , $data: ContactUpdateInput!) {
    updateContact(where: {id : $id}, data: $data) {
      ...ContactFields
    }
  }
  ${CONTACT_FIELDS}

`;


export const DELETE_CONTACT = gql`
  mutation DeleteContact($id: Float!) {
    deleteContact(where: { id: $id }) {
      __typename
    }
  }
 
`;
