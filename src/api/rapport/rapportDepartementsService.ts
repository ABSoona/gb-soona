import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { eachDayOfInterval, endOfDay } from 'date-fns';
import { GET_RAPPORT_DEPARTEMENTS_DATA } from './graphql/queries';

type StatusHistoryEntry = {
  status: string;
  createdAt: string;
};

type ActivityEntry = {
  typeField: string;
  createdAt: string;
};

type DemandeEntry = {
  id: string;
  status: string | null;
  createdAt: string | null;
  decisionDate: string | null;
  contact: { codePostal: number | null } | null;
  demandeStatusHistories: StatusHistoryEntry[];
  demandeActivities: ActivityEntry[];
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

// Même définition "backlog" que le tableau rectificatif mensuel : une
// demande sans historique de statut n'a jamais changé depuis sa création
// (donc son statut actuel est celui qu'elle a toujours eu — les imports en
// masse fixent parfois le statut final directement, sans jamais passer par
// un changement tracé). Si ce statut n'est pas "recue", elle ne compte
// jamais dans le backlog, même sans historique.
type BacklogDemande = {
  departement: string;
  createdAt: Date;
  jamaisRecue: boolean;
  sortieBacklogDate: Date | null;
};

const calculerBacklogDemande = (demande: DemandeEntry): BacklogDemande | null => {
  if (!demande.createdAt) return null;
  const createdAt = new Date(demande.createdAt);

  const premierChangementStatut = [...demande.demandeStatusHistories].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )[0];
  // La 1re activité est toujours la création automatique "Demande Reçue" ;
  // la 2e (s'il y en a une) est le premier évènement réel sur le dossier.
  const activitesTriees = [...(demande.demandeActivities ?? [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const deuxiemeActivite = activitesTriees[1];

  const datesSortieBacklog = [
    premierChangementStatut ? new Date(premierChangementStatut.createdAt) : null,
    deuxiemeActivite ? new Date(deuxiemeActivite.createdAt) : null,
  ].filter((d): d is Date => d !== null);
  const sortieBacklogDate =
    datesSortieBacklog.length > 0
      ? new Date(Math.min(...datesSortieBacklog.map((d) => d.getTime())))
      : null;

  const jamaisRecue = demande.demandeStatusHistories.length === 0 && demande.status !== 'recue';

  return {
    departement: extraireDepartement(demande.contact?.codePostal),
    createdAt,
    jamaisRecue,
    sortieBacklogDate,
  };
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

    const demandesPourBacklog: BacklogDemande[] = [];

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

      const backlogDemande = calculerBacklogDemande(demande);
      if (backlogDemande) demandesPourBacklog.push(backlogDemande);
    });

    // Backlog moyen par département sur la période sélectionnée : moyenne
    // du backlog figé (demandes encore "vierges") mesuré à la fin de
    // chaque jour de la période, plafonné à aujourd'hui.
    const maintenant = new Date();
    const dernierJourACompter = fin < maintenant ? fin : maintenant;
    if (debut <= dernierJourACompter) {
      const joursDeLaPeriode = eachDayOfInterval({ start: debut, end: dernierJourACompter });
      const sommeParDepartement = new Map<string, number>();

      joursDeLaPeriode.forEach((jour) => {
        const cutoff = endOfDay(jour);
        demandesPourBacklog.forEach((d) => {
          if (d.jamaisRecue) return;
          if (d.createdAt > cutoff) return;
          if (d.sortieBacklogDate !== null && d.sortieBacklogDate <= cutoff) return;
          sommeParDepartement.set(d.departement, (sommeParDepartement.get(d.departement) ?? 0) + 1);
        });
      });

      sommeParDepartement.forEach((somme, departement) => {
        getRow(departement).backlog = Math.round(somme / joursDeLaPeriode.length);
      });
    }

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
