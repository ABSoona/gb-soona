import { gql } from '@apollo/client';
import { DEMANDE_FIELDS } from './fragment';
import { CONTACT_FIELDS } from '@/api/contact/graphql/fragment';
import { AIDE_FIELDS } from '@/api/aide/graphql/fragment';
import { DOCUMENT_FIELDS } from '@/api/document/fragment';

export const GET_DEMANDES= gql`
  query GetDemandesWithContactAides($skip: Float, $take: Float, $where : DemandeWhereInput) {
    demandes(skip: $skip, take: $take, where: $where, orderBy:[{ createdAt: Desc }]) {
      ...DemandeFields
      contact {
        ...ContactFields
        aides {
          ...AideFields
        }
       
      }
    }
  }
  ${DEMANDE_FIELDS}
  ${CONTACT_FIELDS}
  ${AIDE_FIELDS}

`;

// 🔥 Ajout des mutations
export const CREATE_DEMANDE = gql`
  mutation CreateDemande($data: DemandeCreateInput!) {
    createDemande(data: $data) {
      ...DemandeFields
    }
  }
  ${DEMANDE_FIELDS}

`;

export const UPDATE_DEMANDE = gql`
  mutation UpdateDemande($id: Float! , $data: DemandeUpdateInput!) {
    updateDemande(where: {id : $id}, data: $data) {
      ...DemandeFields
    }
  }
  ${DEMANDE_FIELDS}

`;




export const DELETE_DEMANDE = gql`
  mutation DeleteDemande($id: Float!) {
    deleteDemande(where: { id: $id }) {
      __typename
    }
  }
 
`;







