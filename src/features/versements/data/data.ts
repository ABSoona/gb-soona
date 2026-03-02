//import { VersementStatus } from '@/model/versement/Versement'

import { VersementStatus } from "@/model/versement/versement"


export const versementStatusColor = new Map<VersementStatus, string>([
  ['AVerser','bg-neutral-300/40 border-neutral-300' ],
  [
    'Verse',  'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200', 
  ],
  [
    'Planifie',  'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200', 
  ],
  [
    'Annulee',   'bg-gray-100/30 text-gray-900 border-gray-200 dark:bg-gray-200 dark:text-gray-300 dark:border-gray-700',
  ]
])





export const versementStatusTypes =
  [
    { label: 'A verser', value: 'AVerser' },
    { label: 'Versé', value: 'Verse' },
    { label: 'Planifié', value: 'Planifie' },
    { label: 'Annulé', value: 'Annulee' },

  ] as const
