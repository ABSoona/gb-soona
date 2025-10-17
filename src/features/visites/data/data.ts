import { VisiteStatus } from "@/model/visite/Visite"

export const visiteStatusColor = new Map<VisiteStatus, string>([
 /*  [ 'Programee','bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300' ],
  [
    'Annulee',  'bg-red-100/30 text-red-900 dark:text-red-200 border-red-200', 
  ],
  [
    'Realisee',  'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200', 
  ]*/
]) 





export const visiteStatusTypes =
  [
    { label: 'Attribuée', value: 'Programee' },
    { label: 'Réalisée', value: 'Realisee' },
    { label: 'Annulée', value: 'Annulee' },
    { label: 'Planifiée', value: 'Planifiee' },

  ] as const
