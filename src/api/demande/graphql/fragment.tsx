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
    dernierContact
    telegramComiteeAction
    derniereRelance
    nombreRelances
    nombrePersonnes
    recommandation
    decisionDate
    acteur {
      id
      firstName
      lastName
      role
    }
    contact {
      id
    }
  }
`;

export const DEMANDE_SITUATION_HISTORY_FIELDS = gql`
  fragment DemandeSituationHistoryFields on DemandeSituationHistory {
    id
    createdAt
    nombreEnfants
    nombrePersonnes
    agesEnfants
    situationFamiliale
    situationProfessionnelle
    situationProConjoint
    revenus
    revenusConjoint
    loyer
    facturesEnergie
    dettes
    natureDettes
    autresAides
    autresCharges
    apl
    categorieDemandeur
    remarques
    creePar {
      id
      firstName
      lastName
    }
  }
`;

export const DEMANDE_AUTRE_CHARGE_FIELDS = gql`
  fragment DemandeAutreChargeFields on DemandeAutreCharge {
    id
    nom
    montant
    createdAt
    updatedAt
  }
`;

export const DEMANDE_DETTE_DETAIL_FIELDS = gql`
  fragment DemandeDetteDetailFields on DemandeDetteDetail {
    id
    nom
    montant
    createdAt
    updatedAt
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
