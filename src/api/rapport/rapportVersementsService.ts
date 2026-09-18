import { useMemo } from 'react';
import { format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useVersementService } from '@/api/versement/versementService';
import { Versement } from '@/model/versement/versement';

export type RapportVersementRow = {
  mois: string;
  moisLabel: string;
  nombreVersements: number;
  montantTotal: number;
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export function useRapportVersementsMensuelsService(debut?: Date, fin?: Date) {
  // status n'accepte qu'une égalité stricte côté GraphQL (VersementWhereInput.status
  // est un enum simple, pas un filtre {in}/{not}) : on récupère tout sur la période
  // et on exclut "Annulee" côté client.
  const { versements, loading, error } = useVersementService(
    debut && fin
      ? {
          where: {
            dataVersement: { gte: debut.toISOString(), lte: fin.toISOString() },
          },
        }
      : undefined
  );

  const { rows, montantTotalPeriode } = useMemo(() => {
    if (!debut || !fin || !versements?.length) {
      return { rows: [] as RapportVersementRow[], montantTotalPeriode: 0 };
    }

    const buckets = new Map<string, { nombreVersements: number; montantTotal: number }>();

    versements
      .filter((versement: Versement) => versement.status !== 'Annulee')
      .forEach((versement: Versement) => {
        const date = new Date(versement.dataVersement);
        const key = format(date, 'yyyy-MM');
        const bucket = buckets.get(key) ?? { nombreVersements: 0, montantTotal: 0 };
        bucket.nombreVersements += 1;
        bucket.montantTotal += versement.montant;
        buckets.set(key, bucket);
      });

    const rows = Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, bucket]) => {
        const date = parse(key + '-01', 'yyyy-MM-dd', new Date());
        return {
          mois: key,
          moisLabel: capitalize(format(date, 'MMMM yyyy', { locale: fr })),
          nombreVersements: bucket.nombreVersements,
          montantTotal: bucket.montantTotal,
        };
      });

    const montantTotalPeriode = rows.reduce((acc, row) => acc + row.montantTotal, 0);

    return { rows, montantTotalPeriode };
  }, [versements, debut, fin]);

  return { rows, montantTotalPeriode, loading, error };
}
