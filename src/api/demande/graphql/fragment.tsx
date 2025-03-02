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
    createdAt
    updatedAt
    contact {  
      id}
  } 
`;