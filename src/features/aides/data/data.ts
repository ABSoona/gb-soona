//import { AideStatus } from '@/model/aide/Aide'


/*export const aideStatusColor = new Map<AideStatus, string>([
  ['en_cours', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  [
    'terminee',
    'bg-neutral-300/40 border-neutral-300',
  ],
  [
    'suspendue',
    'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  ],
])*/
export const aideStatusTypes =
[
  { label: 'Suspendue', value: 'suspendue' },
  { label: 'Active', value: 'active' },

 ] as const

 export const aideFrquenceTypes =
 [
  { label: 'Une fois', value: 'UneFois' },
  { label: 'Chaque semaine', value: 'Hebdomadaire' },
  { label: 'Chaque 2 semaine ', value: 'BiMensuelle' },
   { label: 'Chaque mois', 
   value: 'Mensuelle' 
  },   
   { label: 'Chaque 3 mois', value: 'Trimestrielle' },
   


  ] as const
 
 

  export const aideCredieteurTypes =
  [
    { label: 'Le Bénéficiaire', value: 'LeBNFiciaire' },
    { label: 'Un Créancier', value: 'UnCrAncier' },
  
   ] as const
