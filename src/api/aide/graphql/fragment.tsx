import { gql } from '@apollo/client';

export const AIDE_FIELDS = gql`
  fragment AideFields on Aide {
    id
    typeField
    montant
    dateAide
    dateExpiration
    paiementRecurrent
    createdAt
    updatedAt
  }
`;