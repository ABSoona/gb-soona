import { AIDE_FIELDS } from '@/api/aide/graphql/fragment';
import { CONTACT_FIELDS } from '@/api/contact/graphql/fragment';
import { gql } from '@apollo/client';
import { DEMANDE_ACTIVITY_FIELDS, DEMANDE_FIELDS } from './fragment';

export const GET_DEMANDES = gql`
  query GetDemandesWithContactAides($skip: Float, $take: Float, $where : DemandeWhereInput) {
    demandes(skip: $skip, take: $take, where: $where, orderBy:[{ createdAt: Desc }]) {
      ...DemandeFields
      contact {
        ...ContactFields
        aides {
          ...AideFields
        }
      }
      demandeActivities(orderBy: { createdAt: Desc }) {
        ...DemandeActivityFields
      }
    }
  }
  ${DEMANDE_FIELDS}
  ${CONTACT_FIELDS}
  ${AIDE_FIELDS}
  ${DEMANDE_ACTIVITY_FIELDS}
`;

export const CREATE_DEMANDE = gql`
  mutation CreateDemande($data: DemandeCreateInput!) {
    createDemande(data: $data) {
      ...DemandeFields
    }
  }
  ${DEMANDE_FIELDS}
`;

export const UPDATE_DEMANDE = gql`
  mutation UpdateDemande($id: Float!, $data: DemandeUpdateInput!) {
    updateDemande(where: { id: $id }, data: $data) {
      ...DemandeFields
      demandeActivities(orderBy: { createdAt: Desc }) {
        ...DemandeActivityFields
      }
    }
  }
  ${DEMANDE_FIELDS}
  ${DEMANDE_ACTIVITY_FIELDS}
`;

export const DELETE_DEMANDE = gql`
  mutation DeleteDemande($id: Float!) {
    deleteDemande(where: { id: $id }) {
      __typename
    }
  }
`;


export const CREATE_DEMANDE_ACTIVITY = gql`
  mutation CreateDemandeActivity($data: DemandeActivityCreateInput!) {
    createDemandeActivity(data: $data) {
      ...DemandeActivityFields
    }
  }
  ${DEMANDE_ACTIVITY_FIELDS}
`;

export const UPDATE_DEMANDE_ACTIVITY = gql`
  mutation UpdateDemandeActivity($id: Float!, $data: DemandeActivityUpdateInput!) {
    updateDemandeActivity(where: { id: $id }, data: $data) {
      id
      message
    }
  }
`;

export const DELETE_DEMANDE_ACTIVITY = gql`
  mutation DeleteDemandeActivity($id: Float!) {
    deleteDemandeActivity(where: { id: $id }) {
      id
    }
  }
`;