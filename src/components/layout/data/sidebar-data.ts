import {

  IconBrowserCheck,
  IconChecklist,
  IconCoinEuro,
  IconHelp,
  IconLayoutDashboard,
  IconLockAccess,
  IconNotification,
  IconPalette,
  IconSettings,
  IconTaxEuro,
  IconTool,
  IconUserCog,
  IconUsers,
} from '@tabler/icons-react'

import { type SidebarData } from '../types'
import { UserIcon } from 'lucide-react'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Tableau de bord',
          url: '/',
          icon: IconLayoutDashboard,
        },
     /*   {
          title: 'Tasks',
          url: '/tasks',
          icon: IconChecklist,
        },     */
        {
          title: 'Demandes',
          url: '/demandes',
          icon: IconChecklist,
        },   
        {
          title: 'Contacts',
          url: '/contacts',
          icon: UserIcon,
        },      
        {
          title: 'Aides',
          url: '/Aides',
          icon: IconCoinEuro,
        },      
      
      ],
    },
  /*  {
      title: 'Pages',
      items: [
        {
          title: 'Auth',
          icon: IconLockAccess,
          items: [
            {
              title: 'Sign In',
              url: '/sign-in',
            },
            {
              title: 'Sign In (2 Col)',
              url: '/sign-in-2',
            },
            {
              title: 'Sign Up',
              url: '/sign-up',
            },
            {
              title: 'Forgot Password',
              url: '/forgot-password',
            },
            {
              title: 'OTP',
              url: '/otp',
            },
          ],
        },
        
      ],
    },*/
    {
      title: 'Autres',
      items: [
        {
          title: 'Réglages',
          icon: IconSettings,
          items: [
            {
              title: 'Utilisateurs',
              url: '/users',
              icon: IconUsers,
            },
            {
              title: 'Profile',
              url: '/settings',
              icon: IconUserCog,
            },
           
          ],
        },
        {
          title: 'Documentation',
          url: '/help-center',
          icon: IconHelp,
        },
      ],
    },
  ],
}
