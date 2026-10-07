import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import {
  differenceInCalendarDays,
  eachMonthOfInterval,
  endOfMonth,
  format,
  parse,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { GET_RAPPORT_MENSUEL_DATA } from './graphql/queries';

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
  createdAt: string | null;
  demandeStatusHistories: StatusHistoryEntry[];
  demandeActivities: ActivityEntry[];
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
  demandesAcceptees: number;
  demandesRefusees: number;
  delaiMoyenVisiteJours: number | null;
  dossiersAbandonnes: number;
  delaiMoyenEnCoursRefuseeJours: number | null;
  delaiMoyenPriseEnChargeJours: number | null;
  backlogFinDeMois: number;
};

type MonthBucket = {
  demandesRecues: number;
  visitesNonAnnulees: number;
  passeesEnCoursRefusee: number;
  demandesAcceptees: number;
  demandesRefusees: number;
  dossiersAbandonnes: number;
};

type DelaisDemande = {
  moisIndex: number;
  delaiVisiteJours: number | null;
  delaiTraitementJours: number | null;
  delaiPriseEnChargeJours: number | null;
};

type BacklogDemande = {
  createdAt: Date;
  // Date a laquelle la demande quitte le "backlog" (premier changement de
  // statut OU deuxieme activite, la premiere des deux a survenir — la
  // premiere activite est toujours la creation automatique "Demande
  // Reçue"). `null` si elle n'en est jamais sortie a ce jour.
  sortieBacklogDate: Date | null;
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
          demandesAcceptees: 0,
          demandesRefusees: 0,
          dossiersAbandonnes: 0,
        };
        buckets.set(key, bucket);
      }
      return bucket;
    };

    // Délais par demande, rattachés au mois de création (createdAt) de la demande,
    // utilisés ensuite pour une moyenne glissante sur 3 mois.
    const delaisParDemande: DelaisDemande[] = [];

    // Pour le backlog figé à fin de mois : une demande par ligne, avec la
    // date a laquelle elle a cesse d'etre "vierge" (voir BacklogDemande).
    const demandesPourBacklog: BacklogDemande[] = [];

    demandes.forEach((demande) => {
      if (!demande.createdAt) return;
      const dateCreation = new Date(demande.createdAt);

      getBucket(monthKey(dateCreation)).demandesRecues += 1;

      const premierChangementStatut = [...demande.demandeStatusHistories]
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
      // La 1re activité est toujours la création automatique "Demande Reçue" ;
      // la 2e (s'il y en a une) est le premier évènement réel sur le dossier.
      const activitesTriees = [...(demande.demandeActivities ?? [])]
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const deuxiemeActivite = activitesTriees[1];

      const datesSortieBacklog = [
        premierChangementStatut ? new Date(premierChangementStatut.createdAt) : null,
        deuxiemeActivite ? new Date(deuxiemeActivite.createdAt) : null,
      ].filter((d): d is Date => d !== null);
      const sortieBacklogDate =
        datesSortieBacklog.length > 0
          ? new Date(Math.min(...datesSortieBacklog.map((d) => d.getTime())))
          : null;

      demandesPourBacklog.push({ createdAt: dateCreation, sortieBacklogDate });

      const enVisite = premierStatut(demande.demandeStatusHistories, ['en_visite']);
      let delaiVisiteJours: number | null = null;
      if (enVisite) {
        const diff = differenceInCalendarDays(new Date(enVisite.createdAt), dateCreation);
        if (diff >= 0) delaiVisiteJours = diff;
      }

      const enCoursOuRefusee = premierStatut(demande.demandeStatusHistories, ['EnCours', 'refusée']);
      let delaiTraitementJours: number | null = null;
      if (enCoursOuRefusee) {
        const bucketTraitement = getBucket(monthKey(new Date(enCoursOuRefusee.createdAt)));
        bucketTraitement.passeesEnCoursRefusee += 1;
        if (enCoursOuRefusee.status === 'EnCours') bucketTraitement.demandesAcceptees += 1;
        else if (enCoursOuRefusee.status === 'refusée') bucketTraitement.demandesRefusees += 1;
        const diff = differenceInCalendarDays(new Date(enCoursOuRefusee.createdAt), dateCreation);
        if (diff >= 0) delaiTraitementJours = diff;
      }

      // Délai de prise en charge : même règle que le rapport d'activité
      // (reception -> premiere prise de contact, ou a defaut premier
      // passage en statut EnAttenteDocs).
      const premierePriseContact = (demande.demandeActivities ?? [])
        .filter((a) => ['priseContactEchec', 'priseContactReussie'].includes(a.typeField))
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
      const enAttenteDocs = premierStatut(demande.demandeStatusHistories, ['EnAttenteDocs']);
      const evenementPriseEnCharge = premierePriseContact ?? enAttenteDocs;
      let delaiPriseEnChargeJours: number | null = null;
      if (evenementPriseEnCharge) {
        const diff = differenceInCalendarDays(new Date(evenementPriseEnCharge.createdAt), dateCreation);
        if (diff >= 0) delaiPriseEnChargeJours = diff;
      }

      delaisParDemande.push({
        moisIndex: moisIndex(dateCreation),
        delaiVisiteJours,
        delaiTraitementJours,
        delaiPriseEnChargeJours,
      });

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
      const delaisPriseEnChargeFenetre: number[] = [];
      delaisParDemande.forEach((d) => {
        if (d.moisIndex < indexMoisMin || d.moisIndex > indexMoisCourant) return;
        if (d.delaiVisiteJours !== null) delaisVisiteFenetre.push(d.delaiVisiteJours);
        if (d.delaiTraitementJours !== null) delaisTraitementFenetre.push(d.delaiTraitementJours);
        if (d.delaiPriseEnChargeJours !== null) delaisPriseEnChargeFenetre.push(d.delaiPriseEnChargeJours);
      });

      // Backlog figé à la fin du mois de la ligne : demandes déjà créées à
      // cette date et toujours "vierges" (statut recue, aucune activité
      // au-delà de la création) à ce moment précis dans le temps.
      const finDeMois = endOfMonth(date);
      const backlogFinDeMois = demandesPourBacklog.reduce((count, d) => {
        if (d.createdAt > finDeMois) return count;
        if (d.sortieBacklogDate !== null && d.sortieBacklogDate <= finDeMois) return count;
        return count + 1;
      }, 0);

      return {
        mois: key,
        moisLabel: capitalize(format(date, 'MMMM yyyy', { locale: fr })),
        demandesRecues: bucket.demandesRecues,
        visitesNonAnnulees: bucket.visitesNonAnnulees,
        passeesEnCoursRefusee: bucket.passeesEnCoursRefusee,
        demandesAcceptees: bucket.demandesAcceptees,
        demandesRefusees: bucket.demandesRefusees,
        delaiMoyenPriseEnChargeJours: moyenneJours(delaisPriseEnChargeFenetre),
        delaiMoyenVisiteJours: moyenneJours(delaisVisiteFenetre),
        dossiersAbandonnes: bucket.dossiersAbandonnes,
        delaiMoyenEnCoursRefuseeJours: moyenneJours(delaisTraitementFenetre),
        backlogFinDeMois,
      };
    });
  }, [data]);

  return { rows, loading, error };
}
