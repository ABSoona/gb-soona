import { gql } from '@apollo/client';

export const DOCUMENT_FIELDS = gql`
  fragment DocumentFields on Document {
    id
    contenu
    updatedAt
    typeDocument {  
      id
      label}
      
  }
`;
