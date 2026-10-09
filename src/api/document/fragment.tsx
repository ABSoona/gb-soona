import { gql } from '@apollo/client';

export const DOCUMENT_FIELDS = gql`
  fragment DocumentFields on Document {
    id
    contenu
    createdAt
    updatedAt
    name
    uploadedByBeneficiaire
    consultedAt
    typeDocument {
      id
      label
      internalCode}

  }
`;
