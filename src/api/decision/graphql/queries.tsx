import { gql } from '@apollo/client';
import { AIDE_FIELDS } from '@/api/aide/graphql/fragment';

export const DECISION_FIELDS = gql`
  fragment DecisionFields on Decision {
    id
    type
    motivation
    createdAt
    comite {
      id
      date
    }
    acteur {
      id
      firstName
      lastName
    }
    aides {
      ...AideFields
    }
    situationHistory {
      situationFamiliale
      situationProfessionnelle
      nombreEnfants
      revenus
      revenusConjoint
      loyer
      facturesEnergie
      dettes
      natureDettes
      autresAides
      autresCharges
      apl
      remarques
    }
  }
  ${AIDE_FIELDS}
`;

export const GET_DECISIONS_BY_DEMANDE = gql`
  query GetDecisionsByDemande($demandeId: Int!) {
    decisionsByDemande(demandeId: $demandeId) {
      ...DecisionFields
    }
  }
  ${DECISION_FIELDS}
`;

export const CREATE_DECISION = gql`
  mutation CreateDecision($data: CreateDecisionInput!) {
    createDecision(data: $data) {
      ...DecisionFields
    }
  }
  ${DECISION_FIELDS}
`;

export const UPDATE_DECISION_MOTIVATION = gql`
  mutation UpdateDecisionMotivation($decisionId: Int!, $motivation: String!) {
    updateDecisionMotivation(decisionId: $decisionId, motivation: $motivation) {
      ...DecisionFields
    }
  }
  ${DECISION_FIELDS}
`;

export const ATTACH_AIDE_TO_DECISION = gql`
  mutation AttachAideToDecision($decisionId: Int!, $aideId: Int!) {
    attachAideToDecision(decisionId: $decisionId, aideId: $aideId) {
      ...DecisionFields
    }
  }
  ${DECISION_FIELDS}
`;

export const GET_COMITES = gql`
  query GetComites {
    comites {
      id
      date
      nombreTraites
      nombreApprouves
      nombreRefuses
      nombreAjournes
    }
  }
`;

export const GET_DECISIONS_BY_COMITE = gql`
  query GetDecisionsByComite($comiteId: Int!) {
    decisionsByComite(comiteId: $comiteId) {
      ...DecisionFields
      demande {
        id
        contact {
          id
          nom
          prenom
        }
      }
    }
  }
  ${DECISION_FIELDS}
`;
