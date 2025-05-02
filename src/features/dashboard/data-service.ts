import { useAideService } from '@/api/aide/aideService';
import { useDemandeService } from '@/api/demande/demandeService';
import { Aide } from '@/model/aide/Aide';
import { addMonths, addWeeks, eachDayOfInterval, format, isBefore, isEqual } from 'date-fns';

import { useContactService } from '@/api/contact/contact-service';
import { Demande } from '@/model/demande/Demande';
import { useMemo } from 'react';

export function calculateDailyAmounts(aides: Aide[], startDate: Date, endDate: Date) {
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const result = days.map((day) => {
    let dailyReste = 0;

    aides.forEach((aide) => {
      const montantParVersement = aide.montant ?? 0;
      const nombreVersements = aide.nombreVersements ?? 1;
      const dateAide = new Date(aide.dateAide);
      const suspendue = aide.suspendue;
      const frequence = aide.frequence;

      if (suspendue) return;

      let nextPaymentDate = dateAide;
      let versementsRestants = nombreVersements;
      let nbVersementsEffectues = 0;

      while (versementsRestants > 0) {
        if (isBefore(nextPaymentDate, day) || isEqual(nextPaymentDate, day)) {
          nbVersementsEffectues++;
        }

        // Passer à la prochaine échéance
        if (frequence === 'Mensuelle') {
          nextPaymentDate = addMonths(nextPaymentDate, 1);
        } else if (frequence === 'Hebdomadaire') {
          nextPaymentDate = addWeeks(nextPaymentDate, 1);
        } else if (frequence === 'BiMensuelle') {
          nextPaymentDate = addWeeks(nextPaymentDate, 2);
        } else {
          // Cas "Une fois"
          break;
        }

        versementsRestants--;
      }

      const montantRestant = Math.max(0, (nombreVersements - nbVersementsEffectues) * montantParVersement);
      dailyReste += montantRestant;
    });

    return {
      date: format(day, 'yyyy-MM-dd'),
      restantsCumul: dailyReste,
    };
  });

  return result;
}


interface DashboardStats {
  totalVerse: number;
  totalReste: number;
  totalDemandes: number;
  nouvellesDemandes: number;
  DemandesEnAttente: number;
  DemandesEnVisite: number;
  DemandesEncommission: number;
  totalContacts: number;
  loading: boolean;
}

function calculateTotals(aides: Aide[], startDate: Date, endDate: Date) {
  let totalVerse = 0;
  let totalReste = 0;
  const contactsMontants: Record<string, number> = {};

  for (const aide of aides) {
    const montantParVersement = aide.montant ?? 0;
    const nombreVersements = aide.nombreVersements ?? 1;
    const dateAide = new Date(aide.dateAide);
    const suspendue = aide.suspendue;
    const frequence = aide.frequence;

    if (suspendue || !aide.contact?.id) continue;

    let nextDate = dateAide;
    let versePourCetteAide = 0;

    for (let i = 0; i < nombreVersements; i++) {
      if (nextDate >= startDate && nextDate <= endDate) {
        totalVerse += montantParVersement;
        versePourCetteAide += montantParVersement;
      } else if (nextDate > endDate) {
        break;
      }

      if (frequence === 'Mensuelle') {
        nextDate = addMonths(nextDate, 1);
      } else if (frequence === 'Hebdomadaire') {
        nextDate = addWeeks(nextDate, 1);
      } else {
        break;
      }
    }

    contactsMontants[aide.contact.id] =
      (contactsMontants[aide.contact.id] || 0) + versePourCetteAide;

    const totalDue = montantParVersement * nombreVersements;
    const reste = totalDue - versePourCetteAide;
    if (reste > 0 && dateAide <= endDate) {
      totalReste += reste;
    }
  }

  const totalMontant = Object.values(contactsMontants).reduce((a, b) => a + b, 0);
  const nbContacts = Object.keys(contactsMontants).length;

  return {
    totalVerse,
    totalReste,

    nbContacts,
  };
}

export function useDashboardStats(dateRange: { from: Date; to: Date }): DashboardStats {
  const { aides, loading: loadingAides } = useAideService({
    where: {
      dateAide: {
        gte: dateRange.from,
        lte: dateRange.to,
      },
    },
  });

  const { demandes, loading: loadingDemandes } = useDemandeService({
    where: {
      createdAt: {
        gte: dateRange.from,
        lte: dateRange.to,
      },
    },
  });

  const { contacts, loading: loadingContacts } = useContactService({
    where: {
      createdAt: {
        gte: dateRange.from,
        lte: dateRange.to,
      },
    },
  });

  const { totalVerse, totalReste, nbContacts } = useMemo(
    () => calculateTotals(aides, dateRange.from, dateRange.to),
    [aides, dateRange]
  );

  return {
    totalVerse,
    totalReste,
    totalDemandes: demandes.length,
    nouvellesDemandes: demandes.filter((n: Demande) => n.status === 'recue').length,
    DemandesEnAttente: demandes.filter((n: Demande) => n.status === 'EnAttente').length,
    DemandesEncommission: demandes.filter((n: Demande) => n.status === 'en_commision').length,
    DemandesEnVisite: demandes.filter((n: Demande) => n.status === 'en_visite').length,
    totalContacts: contacts.length,
    loading: loadingAides || loadingDemandes || loadingContacts,
  };
}
