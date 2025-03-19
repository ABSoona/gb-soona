import { gql } from '@apollo/client';

export const AIDE_FIELDS = gql`
  fragment AideFields on Aide {
    id
    typeField
    montant
    dateAide
    frequence
    dateExpiration
    nombreVersements
    createdAt
    updatedAt
    suspendue
    crediteur
    infosCrediteur
    remarque
    contact {  
      id}
 
  }
`;