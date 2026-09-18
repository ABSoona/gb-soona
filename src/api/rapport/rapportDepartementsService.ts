import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_RAPPORT_DEPARTEMENTS_DATA } from './graphql/queries';

type DemandeEntry = {
  id: string;
  status: string | null;
  createdAt: string | null;
  decisionDate: string | null;
  contact: { codePostal: number | null } | null;
};

export type RapportDepartementRow = {
  departement: string;
  recues: number;
  acceptees: number;
  refusees: number;
  backlog: number;
};

const STATUTS_ACCEPTEE = ['clôturée', 'en_commision', 'en_visite', 'EnCours'];
const STATUTS_REFUSEE = ['refusée', 'Abandonnée'];

const NON_COMMUNIQUE = 'Non communiqué';

const extraireDepartement = (codePostal: number | null | undefined): string => {
  if (!codePostal) return NON_COMMUNIQUE;
  return codePostal.toString().padStart(5, '0').substring(0, 2);
};

const dansLaPeriode = (dateIso: string | null, debut: Date, fin: Date): boolean => {
  if (!dateIso) return false;
  const date = new Date(dateIso);
  return date >= debut && date <= fin;
};

export function useRapportDepartementsService(debut?: Date, fin?: Date) {
  const { data, loading, error } = useQuery(GET_RAPPORT_DEPARTEMENTS_DATA);

  const { rows, totals } = useMemo(() => {
    if (!data || !debut || !fin) return { rows: [] as RapportDepartementRow[], totals: null };

    const demandes: DemandeEntry[] = data.demandes ?? [];
    const parDepartement = new Map<string, RapportDepartementRow>();

    const getRow = (departement: string): RapportDepartementRow => {
      let row = parDepartement.get(departement);
      if (!row) {
        row = { departement, recues: 0, acceptees: 0, refusees: 0, backlog: 0 };
        parDepartement.set(departement, row);
      }
      return row;
    };

    demandes.forEach((demande) => {
      const departement = extraireDepartement(demande.contact?.codePostal);

      if (dansLaPeriode(demande.createdAt, debut, fin)) {
        getRow(departement).recues += 1;
      }

      if (demande.status && dansLaPeriode(demande.decisionDate, debut, fin)) {
        if (STATUTS_ACCEPTEE.includes(demande.status)) {
          getRow(departement).acceptees += 1;
        } else if (STATUTS_REFUSEE.includes(demande.status)) {
          getRow(departement).refusees += 1;
        }
      }

      if (demande.status === 'recue') {
        getRow(departement).backlog += 1;
      }
    });

    const rows = Array.from(parDepartement.values()).sort((a, b) => {
      if (a.departement === NON_COMMUNIQUE) return 1;
      if (b.departement === NON_COMMUNIQUE) return -1;
      return a.departement.localeCompare(b.departement);
    });

    const totals = rows.reduce(
      (acc, row) => ({
        recues: acc.recues + row.recues,
        acceptees: acc.acceptees + row.acceptees,
        refusees: acc.refusees + row.refusees,
        backlog: acc.backlog + row.backlog,
      }),
      { recues: 0, acceptees: 0, refusees: 0, backlog: 0 }
    );

    return { rows, totals };
  }, [data, debut, fin]);

  return { rows, totals, loading, error };
}
