import { AIDE_FIELDS, AIDE_FIELDS_LIGHT } from '@/api/aide/graphql/fragment';
import { CONTACT_FIELDS, CONTACT_FIELDS_LIGHT } from '@/api/contact/graphql/fragment';
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
  ${CONTACT_FIELDS_LIGHT}
  ${AIDE_FIELDS_LIGHT}
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

//stats queries ici 

export const GET_DEMANDE_STATS = gql`
  query CountDemandesStats($userId: String!) {
    total: _demandesMeta {
      count
    }

    suivies: demandes(
      where: {
        status: { in: ["recue","en_commision", "en_visite", "EnAttenteDocs"] }
      }
    ) {
      id
      demandeActivities {
        id
      }
    }

    enVisite: _demandesMeta(
      where: {
        status: { equals: "en_visite" }
      }
    ) {
      count
    }

    enCommite: _demandesMeta(
      where: {
        status: { equals: "en_commision" }
      }
    ) {
      count
    }
      affecteAMoi: _demandesMeta(
      where: {
        acteur: { id: $userId  }
      }
    ) {
      count
    }

    recue: demandes(
      where: {
        status: { equals: "recue" }
      }
    ) {
      id
      acteur {
        id
      } 
      demandeActivities {
        id
      }
    }
  }
`;

export const GET_DASHBOARD_STATS = gql`
  query CountDemandesDashboardStats($beginDate:  DateTime!,$endDate:  DateTime! ) {
    total: _demandesMeta {
      count
    }

    suivies: demandes(
      where: {
        status: { in: ["recue","en_commision", "en_visite", "EnAttenteDocs"] }, createdAt : {lt : $endDate, gt : $beginDate}
      }
    ) {
      id
      demandeActivities {
        id
      }
    }

    enVisite: _demandesMeta(
      where: {
        status: { equals: "en_visite" }, createdAt : {lt : $endDate, gt : $beginDate}
      }
    ) {
      count
    }
    enAttente: _demandesMeta(
      where: {
        status: { equals: "EnAttente" }, createdAt : {lt : $endDate, gt : $beginDate}
      }
    ) {
      count
    }

    enCommite: _demandesMeta(
      where: {
        status: { equals: "en_commision" }, createdAt : {lt : $endDate, gt : $beginDate}
      }
    ) {
      count
    }
      
    recue: demandes(
      where: {
        status: { equals: "recue" }, createdAt : {lt : $endDate, gt : $beginDate}
      }
    ) {
      id
      demandeActivities {
        id
      }
    }
  }
`;
