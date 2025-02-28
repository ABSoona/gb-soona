import { gql } from '@apollo/client';

export const CONTACT_FIELDS = gql`
  fragment ContactFields on Contact {
    id
    nom
    prenom
    age
    agesEnfants
    autresAides
    createdAt
    dettes
    natureDettes
    autresCharges
    apl
    facturesEnergie
    loyer
    numBeneficiaire
    nombreEnfants
    remarques
    resteAVivre
    revenus
    revenusConjoint
    situationFamiliale
    situationProfessionnelle
    status
    updatedAt
    createdAt
    email
    telephone
    adresse
    codePostal
    ville
  }
`;
