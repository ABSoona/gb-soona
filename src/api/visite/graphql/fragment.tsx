import { gql } from '@apollo/client';

export const VISITE_FIELDS = gql`
  fragment VisiteFields on Visite {
    id
    acteur {
    id
    role
    roles
    firstName 
    lastName
    superieur {
    id firstName lastName}   
    }
    document {
    id
    contenu
    updatedAt
    name
    createdAt
      typeDocument {  
        id
        label
        internalCode}
      }
    dateVisite
    note
    status
    createdAt
    updatedAt
    
  }
`;