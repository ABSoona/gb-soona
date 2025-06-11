import { gql } from '@apollo/client';

export const VERSEMENT_FIELDS = gql`
  fragment VersementFields on Versement {
    id
    createdAt
    aide {
      id
      contact {
        id
        nom
        prenom
      }
        frequence
    }
    status
    dataVersement
    montant
    document {
      id
      contenu
      name
      typeDocument {
        label
        id
        internalCode
      }
    }
  }
`;

export const VERSEMENT_FIELDS_LIGHT = gql`
  fragment VersementFields on Versement {
    id
   status
   dataVersement
   montant   
   document{id contenu typeDocument {label id
      internalCode }} 
  }
`;

