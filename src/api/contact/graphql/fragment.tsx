import { gql } from '@apollo/client';

export const CONTACT_FIELDS = gql`
  fragment ContactFields on Contact {
    id
    nom
    prenom
    age
    remarques    
    status
    updatedAt
    createdAt
    email
    telephone
    adresse
    codePostal
    ville
    numBeneficiaire


  }
`;
