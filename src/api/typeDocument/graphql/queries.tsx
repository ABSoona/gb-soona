
import { gql } from '@apollo/client';
import { TYPE_DOCUMENT_FIELDS } from './fragment';

export const GET_TYPE_DOCUMENTS = gql`
  query GetTypeDocuments($skip: Float, $take: Float, $where: TypeDocumentWhereInput) {
    typeDocuments(skip: $skip, take: $take, where: $where, orderBy:[{ createdAt: Asc }]) {
      ...TypeDocumentFields
    }
  }
  ${TYPE_DOCUMENT_FIELDS}
`;

export const CREATE_TYPE_DOCUMENT = gql`
  mutation CreateTypeDocument($data: TypeDocumentCreateInput!) {
    createTypeDocument(data: $data) {
      ...TypeDocumentFields
    }
  }
  ${TYPE_DOCUMENT_FIELDS}
`;

export const UPDATE_TYPE_DOCUMENT = gql`
  mutation UpdateTypeDocument($id: Float!, $data: TypeDocumentUpdateInput!) {
    updateTypeDocument(where: { id: $id }, data: $data) {
      ...TypeDocumentFields
    }
  }
  ${TYPE_DOCUMENT_FIELDS}
`;

export const DELETE_TYPE_DOCUMENT = gql`
  mutation DeleteTypeDocument($id: Float!) {
    deleteTypeDocument(where: { id: $id }) {
      __typename
    }
  }
`;
