import { gql } from '@apollo/client';

export const WEBSITE_DEMANDE_FIELDS = gql`
  fragment WebsiteDemandeFields on WebsiteDemande {
    id
    nomDemandeur
    prenomDemandeur
    ageDemandeur
    telephoneDemandeur
    emailDemandeur
    adresseDemandeur
    codePostalDemandeur
    villeDemandeur
    situationProfessionnelle
    situationFamiliale
    revenus
    revenusConjoint
    nombreEnfants
    agesEnfants
    situationProConjoint
    autresAides
    autresCharges
    apl
    dettes
    natureDettes
    facturesEnergie
    remarques
    status
    erreur
    createdAt
    updatedAt
  }
`;