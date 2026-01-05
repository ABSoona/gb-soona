//import { VersementStatus } from '@/model/versement/Versement'

import { VersementStatus } from "@/model/versement/versement"


export const versementStatusColor = new Map<VersementStatus, string>([
  ['AVerser','bg-neutral-300/40 border-neutral-300' ],
  [
    'Verse',  'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200', 
  ],
  [
    'Planifie',  'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200', 
  ]
])





export const versementStatusTypes =
  [
    { label: 'A verser', value: 'AVerser' },
    { label: 'Versé', value: 'Verse' },
    { label: 'Planifié', value: 'Planifie' },

  ] as const
