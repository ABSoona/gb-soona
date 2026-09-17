import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import {
  differenceInCalendarDays,
  eachMonthOfInterval,
  format,
  parse,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { GET_RAPPORT_MENSUEL_DATA } from './graphql/queries';

type StatusHistoryEntry = {
  status: string;
  createdAt: string;
};

type DemandeEntry = {
  id: string;
  createdAt: string | null;
  demandeStatusHistories: StatusHistoryEntry[];
};

type VisiteEntry = {
  id: string;
  createdAt: string | null;
  status: string | null;
};

export type RapportMensuelRow = {
  mois: string;
  moisLabel: string;
  demandesRecues: number;
  visitesNonAnnulees: number;
  passeesEnCoursRefusee: number;
  delaiMoyenVisiteJours: number | null;
  dossiersAbandonnes: number;
  delaiMoyenEnCoursRefuseeJours: number | null;
};

type MonthBucket = {
  demandesRecues: number;
  visitesNonAnnulees: number;
  passeesEnCoursRefusee: number;
  dossiersAbandonnes: number;
  delaisVisite: number[];
  delaisEnCoursRefusee: number[];
};

const RAPPORT_MOIS_DEBUT = new Date(2026, 0, 1);

const monthKey = (date: Date) => format(date, 'yyyy-MM');

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const moyenneJours = (valeurs: number[]): number | null => {
  if (valeurs.length === 0) return null;
  return Math.round((valeurs.reduce((a, b) => a + b, 0) / valeurs.length) * 10) / 10;
};

const premierStatut = (
  historiques: StatusHistoryEntry[],
  statuts: string[]
): StatusHistoryEntry | undefined => {
  return historiques
    .filter((h) => statuts.includes(h.status))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
};

export function useRapportMensuelService() {
  const { data, loading, error } = useQuery(GET_RAPPORT_MENSUEL_DATA);

  const rows = useMemo<RapportMensuelRow[]>(() => {
    if (!data) return [];

    const demandes: DemandeEntry[] = data.demandes ?? [];
    const visites: VisiteEntry[] = data.visites ?? [];

    const buckets = new Map<string, MonthBucket>();

    const getBucket = (key: string): MonthBucket => {
      let bucket = buckets.get(key);
      if (!bucket) {
        bucket = {
          demandesRecues: 0,
          visitesNonAnnulees: 0,
          passeesEnCoursRefusee: 0,
          dossiersAbandonnes: 0,
          delaisVisite: [],
          delaisEnCoursRefusee: [],
        };
        buckets.set(key, bucket);
      }
      return bucket;
    };

    demandes.forEach((demande) => {
      if (!demande.createdAt) return;
      const dateCreation = new Date(demande.createdAt);

      getBucket(monthKey(dateCreation)).demandesRecues += 1;

      const enVisite = premierStatut(demande.demandeStatusHistories, ['en_visite']);
      if (enVisite) {
        const dateEnVisite = new Date(enVisite.createdAt);
        const diffJours = differenceInCalendarDays(dateEnVisite, dateCreation);
        if (diffJours >= 0) {
          getBucket(monthKey(dateEnVisite)).delaisVisite.push(diffJours);
        }
      }

      const enCoursOuRefusee = premierStatut(demande.demandeStatusHistories, ['EnCours', 'refusée']);
      if (enCoursOuRefusee) {
        const dateEnCoursOuRefusee = new Date(enCoursOuRefusee.createdAt);
        const bucket = getBucket(monthKey(dateEnCoursOuRefusee));
        bucket.passeesEnCoursRefusee += 1;
        const diffJours = differenceInCalendarDays(dateEnCoursOuRefusee, dateCreation);
        if (diffJours >= 0) {
          bucket.delaisEnCoursRefusee.push(diffJours);
        }
      }

      const abandonnee = premierStatut(demande.demandeStatusHistories, ['Abandonnée']);
      if (abandonnee) {
        getBucket(monthKey(new Date(abandonnee.createdAt))).dossiersAbandonnes += 1;
      }
    });

    visites.forEach((visite) => {
      if (!visite.createdAt || visite.status === 'Annulee') return;
      getBucket(monthKey(new Date(visite.createdAt))).visitesNonAnnulees += 1;
    });

    if (buckets.size === 0) return [];

    const moisTries = Array.from(buckets.keys()).sort();
    const premierMoisDonnees = parse(moisTries[0] + '-01', 'yyyy-MM-dd', new Date());
    const dernierMois = parse(moisTries[moisTries.length - 1] + '-01', 'yyyy-MM-dd', new Date());
    const premierMois = premierMoisDonnees < RAPPORT_MOIS_DEBUT ? RAPPORT_MOIS_DEBUT : premierMoisDonnees;

    if (premierMois > dernierMois) return [];

    return eachMonthOfInterval({ start: premierMois, end: dernierMois }).map((date) => {
      const key = monthKey(date);
      const bucket = getBucket(key);
      return {
        mois: key,
        moisLabel: capitalize(format(date, 'MMMM yyyy', { locale: fr })),
        demandesRecues: bucket.demandesRecues,
        visitesNonAnnulees: bucket.visitesNonAnnulees,
        passeesEnCoursRefusee: bucket.passeesEnCoursRefusee,
        delaiMoyenVisiteJours: moyenneJours(bucket.delaisVisite),
        dossiersAbandonnes: bucket.dossiersAbandonnes,
        delaiMoyenEnCoursRefuseeJours: moyenneJours(bucket.delaisEnCoursRefusee),
      };
    });
  }, [data]);

  return { rows, loading, error };
}
