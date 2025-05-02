import { gql } from '@apollo/client';

import { INVITATION_FIELDS } from './fragment';

export const GET_INVITATIONS = gql`
  query GetInvitations($skip: Float, $take: Float, $where : InvitationWhereInput) {
    invitations(skip: $skip, take: $take, where: $where, orderBy:[{ createdAt: Asc }]) {
      ...InvitationFields
     
    }
  }

  ${INVITATION_FIELDS}
`;

// 🔥 Ajout des mutations
export const CREATE_INVITATION = gql`
  mutation CreateInvitation($data: InvitationCreateInput!) {
    createInvitation(data: $data) {
      ...InvitationFields
    }
  }
  ${INVITATION_FIELDS}

`;

export const UPDATE_INVITATION = gql`
  mutation UpdateInvitation($id: Float! , $data: InvitationUpdateInput!) {
    updateInvitation(where: {id : $id}, data: $data) {
      ...InvitationFields
    }
  }
  ${INVITATION_FIELDS}

`;




export const DELETE_INVITATION = gql`
  mutation DeleteInvitation($id: Float!) {
    deleteInvitation(where: { id: $id }) {
      __typename
    }
  }
 
`;







