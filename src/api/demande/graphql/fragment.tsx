import { gql } from '@apollo/client';

export const DEMANDE_FIELDS = gql`
  fragment DemandeFields on Demande {
    id
    agesEnfants
    autresAides
    createdAt
    dettes
    natureDettes
    autresCharges
    apl
    facturesEnergie
    loyer    
    nombreEnfants
    revenus
    revenusConjoint
    situationFamiliale
    situationProfessionnelle
    situationProConjoint
    status
    remarques
    categorieDemandeur
    updatedAt
    contact {
      id
    }
  }
`;

export const DEMANDE_ACTIVITY_FIELDS = gql`
  fragment DemandeActivityFields on DemandeActivity {
    id
    titre
    message
    typeField
    createdAt
    updatedAt
    user {
      id
      firstName
      lastName
    }
  }
`;
