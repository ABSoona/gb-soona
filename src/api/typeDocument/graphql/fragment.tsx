
import { gql } from '@apollo/client';

export const TYPE_DOCUMENT_FIELDS = gql`
  fragment TypeDocumentFields on TypeDocument {
    id
    label
    rattachement
    internalCode
    isInternal
    createdAt
    updatedAt
  }
`;
