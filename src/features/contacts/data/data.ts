import {

  IconExternalLink,
  IconShield,
  IconUsersGroup,

} from '@tabler/icons-react'
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
])
 //A deplacer plus tard dans Contact/data
 


export const situationFamilleTypes = [
  {
    label: 'Marié(e)',
    value: 'marié',
    icon: IconShield,
  },
  {
    label: 'Divorcé(e)',
    value: 'divorcé',
    icon: IconUsersGroup,
  },
  {
    label: 'Célibataire',
    value: 'célibataire',
    icon: IconExternalLink,
  },
  {
    label: 'Veuf(ve)',
    value: 'veuf',
    icon: IconExternalLink,
  },
] as const
//A deplacer plus tard dans Contact/data
export const situationTypes = [
  {
    label: 'Sans emploi',
    value: 'sans_emploi',
    icon: IconShield,
  },
  {
    label: 'Employé',
    value: 'employé',
    icon: IconUsersGroup,
  },
  {
    label: 'Indépendant',
    value: 'indépendant',
    icon: IconExternalLink,
  },
  {
    label: 'Retraité',
    value: 'retraité',
    icon: IconExternalLink,
  },
] as const
export const contactStatusTypes = [
  {
    label: 'Bénéficiare',
    value: 'beneficiare',
    icon: IconShield,
  },
  {
    label: 'Balcklisté',
    value: 'blacklisté',
    icon: IconUsersGroup,
  },
  {
    label: 'Indépendant',
    value: 'indépendant',
    icon: IconExternalLink,
  },
  {
    label: 'Retraité',
    value: 'retraité',
    icon: IconExternalLink,
  },
] as const





 