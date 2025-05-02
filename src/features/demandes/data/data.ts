import { DemandeStatus } from '@/model/demande/Demande'

export const demandeStatusColor = new Map<DemandeStatus, string>([
  ['recue', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['en_visite', 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300'],
  ['en_commision', 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300'],
  [
    'clôturée',
    'bg-neutral-300/40 border-neutral-300',
  ],
  [
    'refusée',
    'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  ],
  ['EnCours', 'bg-teal-100/50 text-teal-900 dark:text-teal-200 border-teal-200'],

])
export const demandeStatusTypes =
  [
    { label: 'Reçue', value: 'recue' },
    { label: 'En commission', value: 'en_commision' },
    { label: 'En visite', value: 'en_visite' },
    { label: 'Clôturée', value: 'clôturée' },
    { label: 'Refusée', value: 'refusée' },
    { label: 'En cours', value: 'EnCours' },
    { label: 'Abandonnée', value: 'Abandonnée' },
    { label: 'En attente', value: 'EnAttente' },

  ] as const


export const categorieTypes =
  [
    { label: 'Lourdement endetté', value: 'LourdementEndett' },
    { label: 'Nécessiteux', value: 'NCessiteux' },
    { label: 'Pauvre', value: 'Pauvre' },

  ] as const





