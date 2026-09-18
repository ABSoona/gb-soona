import { gql } from '@apollo/client';

export const GET_RAPPORT_MENSUEL_DATA = gql`
  query GetRapportMensuelData {
    demandes(orderBy: [{ createdAt: Asc }]) {
      id
      createdAt
      demandeStatusHistories(orderBy: { createdAt: Asc }) {
        status
        createdAt
      }
    }
    visites(orderBy: [{ createdAt: Asc }]) {
      id
      createdAt
      status
    }
  }
`;

export const GET_RAPPORT_DEPARTEMENTS_DATA = gql`
  query GetRapportDepartementsData {
    demandes {
      id
      status
      createdAt
      decisionDate
      contact {
        codePostal
      }
    }
  }
`;
