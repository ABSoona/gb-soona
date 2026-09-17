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
};

type DelaisDemande = {
  moisIndex: number;
  delaiVisiteJours: number | null;
  delaiTraitementJours: number | null;
};

const RAPPORT_MOIS_DEBUT = new Date(2026, 0, 1);
const FENETRE_GLISSANTE_MOIS = 3;

const monthKey = (date: Date) => format(date, 'yyyy-MM');

const moisIndex = (date: Date) => date.getFullYear() * 12 + date.getMonth();

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
        };
        buckets.set(key, bucket);
      }
      return bucket;
    };

    // Délais par demande, rattachés au mois de création (createdAt) de la demande,
    // utilisés ensuite pour une moyenne glissante sur 3 mois.
    const delaisParDemande: DelaisDemande[] = [];

    demandes.forEach((demande) => {
      if (!demande.createdAt) return;
      const dateCreation = new Date(demande.createdAt);

      getBucket(monthKey(dateCreation)).demandesRecues += 1;

      const enVisite = premierStatut(demande.demandeStatusHistories, ['en_visite']);
      let delaiVisiteJours: number | null = null;
      if (enVisite) {
        const diff = differenceInCalendarDays(new Date(enVisite.createdAt), dateCreation);
        if (diff >= 0) delaiVisiteJours = diff;
      }

      const enCoursOuRefusee = premierStatut(demande.demandeStatusHistories, ['EnCours', 'refusée']);
      let delaiTraitementJours: number | null = null;
      if (enCoursOuRefusee) {
        getBucket(monthKey(new Date(enCoursOuRefusee.createdAt))).passeesEnCoursRefusee += 1;
        const diff = differenceInCalendarDays(new Date(enCoursOuRefusee.createdAt), dateCreation);
        if (diff >= 0) delaiTraitementJours = diff;
      }

      delaisParDemande.push({ moisIndex: moisIndex(dateCreation), delaiVisiteJours, delaiTraitementJours });

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
      const indexMoisCourant = moisIndex(date);
      const indexMoisMin = indexMoisCourant - (FENETRE_GLISSANTE_MOIS - 1);

      const delaisVisiteFenetre: number[] = [];
      const delaisTraitementFenetre: number[] = [];
      delaisParDemande.forEach((d) => {
        if (d.moisIndex < indexMoisMin || d.moisIndex > indexMoisCourant) return;
        if (d.delaiVisiteJours !== null) delaisVisiteFenetre.push(d.delaiVisiteJours);
        if (d.delaiTraitementJours !== null) delaisTraitementFenetre.push(d.delaiTraitementJours);
      });

      return {
        mois: key,
        moisLabel: capitalize(format(date, 'MMMM yyyy', { locale: fr })),
        demandesRecues: bucket.demandesRecues,
        visitesNonAnnulees: bucket.visitesNonAnnulees,
        passeesEnCoursRefusee: bucket.passeesEnCoursRefusee,
        delaiMoyenVisiteJours: moyenneJours(delaisVisiteFenetre),
        dossiersAbandonnes: bucket.dossiersAbandonnes,
        delaiMoyenEnCoursRefuseeJours: moyenneJours(delaisTraitementFenetre),
      };
    });
  }, [data]);

  return { rows, loading, error };
}
