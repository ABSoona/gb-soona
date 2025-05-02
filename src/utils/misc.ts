export function formatMontant(montant: number | undefined) {
  if (typeof montant !== 'number') return '0 €';
  return montant.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  });
}