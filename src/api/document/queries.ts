import { gql } from "@apollo/client";
import { DOCUMENT_FIELDS } from "./fragment";


// MUTATION 1 - Crée le document vide
export const CREATE_DOCUMENT = gql`
  mutation createDocument($data: DocumentCreateInput!) {
    createDocument(data: $data) {
      id
    }
  }
`;
// MUTATION 2 - Upload le contenu après création
export const UPLOAD_CONTENU = gql`
  mutation uploadContenu($file: Upload!, $where: DocumentWhereUniqueInput!) {
    uploadContenu(file: $file, where: $where) {
      id
      contenu
      updatedAt
    }
  }
`;

export const UPDATE_DOCUMENT = gql`
   mutation updateDocument($id: String! , $data: DocumentUpdateInput!) {
    updateDocument(where: {id : $id}, data: $data) {
      ...DocumentFields
    }
  }
     ${DOCUMENT_FIELDS}
`;
// MUTATION 3 - Supprime le document
export const DELETE_DOCUMENT = gql`
  mutation deleteDocument($where: DocumentWhereUniqueInput!) {
    deleteDocument(where: $where) {
      id
    }
  }
`;
// QUERY - Liste des documents du contact
export const GET_DOCUMENTS = gql`
  query documents($where: DocumentWhereInput) {
    documents(where: $where) {
      id
      createdAt
      updatedAt
      contenu
      name
      typeDocument {  
        id
        label
        rattachement
        internalCode
       }
    }
  }
`;
