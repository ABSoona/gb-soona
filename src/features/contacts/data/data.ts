import { ContactStatus } from '@/model/contact/Contact'
import {

  IconExternalLink,
  IconShield,
  IconUsersGroup,

} from '@tabler/icons-react'



export const contactStatusTypes = [
  {
    label: 'Active',
    value: 'active',
    icon: IconShield,
  },
  {
    label: 'Balcklisté',
    value: 'blacklisté',
    icon: IconUsersGroup,
  },
 
] as const


export const contactStatusColor = new Map<ContactStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  [
    'blacklisté',
    'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  ],
])


 