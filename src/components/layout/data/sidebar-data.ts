import {
  IconFile,
  IconHeartHandshake,
  IconHelp,
  IconLayoutDashboard,
  IconMailDown,
  IconSettings,
  IconUsers
} from '@tabler/icons-react';
import { BadgeEuro, Globe, Squircle, UserIcon } from 'lucide-react';
import { useDemandeService } from '@/api/demande/demandeService';
import type { SidebarData, NavGroup } from '../types';
import { equal } from 'assert';

export function useSidebarData(): SidebarData {
  //const { demandes } = useDemandeService();

  const { stats, loading } = useDemandeService({where :{id :{equals : 0}}});
  // Badges par sous-catégorie (à adapter selon ta logique métier)

  
  const navGroups: NavGroup[] = [
    {
      title: 'General',
      items: [
        {
          title: 'Tableau de bord',
          url: '/',
          icon: IconLayoutDashboard,
        },
        {
          title: 'Demandes',
          icon: IconMailDown,

          items: [
            {
              title: 'Toutes',
              url: '/demandes',
              icon: Squircle,
              badge: stats.total >0? String(stats.total) : undefined,
            },
            {
              title: 'Affectées à moi',
              url: '/demandes/mes-demandes',
              icon: Squircle,
              badge: stats.affecteAMoi > 0 ? String(stats.affecteAMoi) : undefined,
             
            },
            {
              title: 'Nouvelles',
              url: '/demandes/nouvelles',
              icon: Squircle,
              badge: stats.nouvelles > 0 ? String(stats.nouvelles ) : undefined,
              //badgeColor:"bg-red-600",
            },
            {
              title: "Suivies",
              url: '/demandes/en-cours-traitement',
              icon: Squircle,
              badge: stats.suivies > 0 ? String(stats.suivies) : undefined,

            },
             {
              title: 'En visite',
              url: '/demandes/en-visite',
              icon: Squircle,
              badge: stats.enVisite > 0 ? String(stats.enVisite) : undefined,
            }, 
            {
              title: 'En commité',
              url: '/demandes/en-commission',
              icon: Squircle,
              badge: stats.enCommite > 0 ? String(stats.enCommite) : undefined,
            },
          ],
        },
        {
          title: 'Bénéficiaires',
          url: '/contacts',
          icon: UserIcon,
        },
        {
          title: 'Aides',
          url: '/aides',
          icon: IconHeartHandshake,
        },
        {
          title: 'Versements',
          
          icon: BadgeEuro,
          items:[
            {
              title: 'Tous',
              url: '/versements',
              icon: Squircle,
            },
            {
              title: 'A venir',
              url: '/versements/a-verser',
              icon: Squircle,
            },
            {
              title: 'En retard',
              url: '/versements/en-retard',
              icon: Squircle,
            }

          ]
        },
      ],
    },
    {
      title: 'Autres',
      items: [
        {
          title: 'Paramètres',
          icon: IconSettings,
          items: [
            {
              title: 'Equipe',
              url: '/users',
              icon: Squircle,
            },
            {
              title: 'Types de documents',
              url: '/typeDocuments',
              icon: Squircle,
            },
          ],
        },
        {
          title: 'Inscriptions sonna.fr',
          url: '/website-demandes',
          icon: Globe,
        },
        {
          title: 'Documentation',
          url: '/help-center',
          icon: IconHelp,
        },
      ],
    },
  ];

  return {
    user: {
      name: 'satnaing',
      email: 'satnaingdev@gmail.com',
      avatar: '/avatars/shadcn.jpg',
    },
    navGroups,
  };
}
