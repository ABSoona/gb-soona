import { gql } from '@apollo/client';

import { VERSEMENT_FIELDS } from './fragment';

export const GET_VERSEMENTS = gql`
  query GetVersements( $orderBy : [VersementOrderByInput!], $skip: Float, $take: Float, $where : VersementWhereInput) {
    versements( orderBy:$orderBy, skip: $skip, take: $take, where: $where) {
      ...VersementFields
     
    }
  }

  ${VERSEMENT_FIELDS}
`;

// 🔥 Ajout des mutations
export const CREATE_VERSEMENT = gql`
  mutation CreateVersement($data: VersementCreateInput!) {
    createVersement(data: $data) {
      ...VersementFields
    }
  }
  ${VERSEMENT_FIELDS}

`;

export const UPDATE_VERSEMENT = gql`
  mutation UpdateVersement($id: Float! , $data: VersementUpdateInput!) {
    updateVersement(where: {id : $id}, data: $data) {
      ...VersementFields
    }
  }
  ${VERSEMENT_FIELDS}

`;




export const DELETE_VERSEMENT = gql`
  mutation DeleteVersement($id: Float!) {
    deleteVersement(where: { id: $id }) {
      __typename
    }
  }
 
`;







