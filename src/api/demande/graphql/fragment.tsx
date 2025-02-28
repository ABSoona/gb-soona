import { gql } from '@apollo/client';

export const DEMANDE_FIELDS = gql`
  fragment DemandeFields on Demande {
    id
    status
    remarques
    createdAt
    updatedAt
    contact {  
      id}
  } 
`;