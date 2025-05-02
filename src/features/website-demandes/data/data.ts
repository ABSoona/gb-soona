import { WsDemandeStatus } from "@/model/website-demandes/website-demandes"

export const WsDemandeStatusColor = new Map<WsDemandeStatus, string>([
  ['Recue', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['EnCours', 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300'],
  [
    'Trait',
    'bg-neutral-300/40 border-neutral-300',
  ],
  [
    'EnErreur',
    'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  ],
])

export const wsDemandeStatusTypes =
  [
    { label: 'En cours', value: 'EnCours' },
    { label: 'Reçue', value: 'Recue' },
    { label: 'Traitée', value: 'Trait' },
    { label: 'En erreur', value: 'EnErreur' },

  ] as const


