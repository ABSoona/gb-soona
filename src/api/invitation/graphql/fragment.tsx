import { gql } from '@apollo/client';

export const INVITATION_FIELDS = gql`
  fragment InvitationFields on Invitation {
    id
    email
    role
    token
    message
    used
    createdAt
    updatedAt
    
  }
`;