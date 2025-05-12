import { gql } from '@apollo/client';

import { CONTACT_FIELDS } from '@/api/contact/graphql/fragment';
import { AIDE_FIELDS } from './fragment';
import { DOCUMENT_FIELDS } from '@/api/document/fragment';

export const GET_AIDES = gql`
  query GetAidesWithContact($skip: Float, $take: Float, $where : AideWhereInput) {
    aides(skip: $skip, take: $take, where: $where, orderBy:[{ createdAt: Asc }]) {
      ...AideFields
      contact {
        ...ContactFields       
      }
      documents {
          ...DocumentFields
        } 
      
    }
  }

  ${CONTACT_FIELDS}
  ${AIDE_FIELDS}
  ${DOCUMENT_FIELDS}
`;

// 🔥 Ajout des mutations
export const CREATE_AIDE = gql`
  mutation CreateAide($data: AideCreateInput!) {
    createAide(data: $data) {
      ...AideFields
    }
  }
  ${AIDE_FIELDS}

`;

export const UPDATE_AIDE = gql`
  mutation UpdateAide($id: Float! , $data: AideUpdateInput!) {
    updateAide(where: {id : $id}, data: $data) {
      ...AideFields
    }
  }
  ${AIDE_FIELDS}

`;




export const DELETE_AIDE = gql`
  mutation DeleteAide($id: Float!) {
    deleteAide(where: { id: $id }) {
      __typename
    }
  }
 
`;







