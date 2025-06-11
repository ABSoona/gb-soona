import { gql } from '@apollo/client';

import { VISITE_FIELDS } from './fragment';

export const GET_VISITES = gql`
  query GetVisites($skip: Float, $take: Float, $where : VisiteWhereInput) {
    visites(skip: $skip, take: $take, where: $where, orderBy:[{ createdAt: Desc }]) {
      ...VisiteFields
     
    }
  }

  ${VISITE_FIELDS}
`;

// 🔥 Ajout des mutations
export const CREATE_VISITE = gql`
  mutation CreateVisite($data: VisiteCreateInput!) {
    createVisite(data: $data) {
      ...VisiteFields
    }
  }
  ${VISITE_FIELDS}

`;

export const UPDATE_VISITE = gql`
  mutation UpdateVisite($id: Float! , $data: VisiteUpdateInput!) {
    updateVisite(where: {id : $id}, data: $data) {
      ...VisiteFields
    }
  }
  ${VISITE_FIELDS}

`;




export const DELETE_VISITE = gql`
  mutation DeleteVisite($id: Float!) {
    deleteVisite(where: { id: $id }) {
      __typename
    }
  }
 
`;







