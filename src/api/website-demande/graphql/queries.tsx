import { gql } from '@apollo/client';
import { WEBSITE_DEMANDE_FIELDS } from './fragment';

export const GET_WEBSITE_DEMANDES = gql`
  query GetWebsiteDemandes($skip: Float, $take: Float, $where: WebsiteDemandeWhereInput) {
    websiteDemandes(skip: $skip, take: $take, where: $where, orderBy: [{ createdAt: Desc }]) {
      ...WebsiteDemandeFields
    }
  }
  ${WEBSITE_DEMANDE_FIELDS}
`;

export const CREATE_WEBSITE_DEMANDE = gql`
  mutation CreateWebsiteDemande($data: WebsiteDemandeCreateInput!) {
    createWebsiteDemande(data: $data) {
      ...WebsiteDemandeFields
    }
  }
  ${WEBSITE_DEMANDE_FIELDS}
`;

export const UPDATE_WEBSITE_DEMANDE = gql`
  mutation UpdateWebsiteDemande($id: String!, $data: WebsiteDemandeUpdateInput!) {
    updateWebsiteDemande(where: { id: $id }, data: $data) {
      ...WebsiteDemandeFields
    }
  }
  ${WEBSITE_DEMANDE_FIELDS}
`;

export const DELETE_WEBSITE_DEMANDE = gql`
  mutation DeleteWebsiteDemande($id: String!) {
    deleteWebsiteDemande(where: { id: $id }) {
      __typename
    }
  }
`;