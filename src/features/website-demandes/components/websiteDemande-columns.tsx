import { WebsiteDemande, WsDemandeStatus } from '@/model/website-demandes/website-demandes';
import { ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle2, Clock4, XCircle } from 'lucide-react';
import { JSX } from 'react';
import { WsDemandeStatusColor, wsDemandeStatusTypes } from '../data/data';
import { DataTableRowActions } from './data-table-row-actions';

export const websiteDemandeColumns: ColumnDef<WebsiteDemande>[] = [
  {
    id: 'statusIcon',
    header: '',
    cell: ({ row }) => {
      const status: WsDemandeStatus = row.getValue('status');
      const statusLabel = wsDemandeStatusTypes.find(s => s.value === status)?.label ?? 'Inconnu';

      const iconMap: Record<WsDemandeStatus, JSX.Element> = {
        EnCours: <Clock4 className="h-5 w-5 text-blue-500" />,
        EnErreur: <XCircle className="h-5 w-5 text-red-500" />,
        Trait: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        Recue: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
      };

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="pl-1">{iconMap[status]}</div>
            </TooltipTrigger>
            <TooltipContent>{statusLabel}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },

  {
    id: 'status',
    accessorKey: 'status',
    header: 'Etat',
    cell: ({ row }) => {
      const status: WsDemandeStatus = row.getValue('status');
      const statusLabel = wsDemandeStatusTypes.find(s => s.value === status)?.label ?? 'Inconnu';

      return (
        <Badge variant="outline" className={cn('capitalize', WsDemandeStatusColor.get(status))}>
          {statusLabel}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableHiding: false,
    enableSorting: true,
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: 'Reçue le',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      const raw = row.getValue('createdAt');
      console.log('🕒 createdAt value:', raw);
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
  },
  {
    accessorFn: (row) => `${row.nomDemandeur ?? ''} ${row.prenomDemandeur ?? ''}`,
    id: 'nom Prenom',
    header: 'Nom complet',
    cell: ({ row }) => <span className="capitalize">{row.original.nomDemandeur} {row.original.prenomDemandeur}</span>,
  },

  {
    accessorKey: 'telephoneDemandeur',
    header: 'Téléphone',
    id: 'Téléphone',
  },
  {
    accessorKey: 'emailDemandeur',
    header: 'Email',
    id: 'Email',
  },
  {
    accessorKey: 'erreur',
    id: 'erreur',
    header: 'Erreur',
  },
  /* {
    accessorKey: 'nomDemandeur',
    id: 'nomDemandeur',
    header: 'Nom',
  },
  {
    accessorKey: 'prenomDemandeur',
    id: 'prenomDemandeur',
    header: 'Prénom',
  },
  {
    accessorKey: 'ageDemandeur',
    header: 'Âge',
  },
 
  {
    accessorKey: 'adresseDemandeur',
    header: 'Adresse',
  },
  {
    accessorKey: 'codePostalDemandeur',
    header: 'Code Postal',
  },
  {
    accessorKey: 'villeDemandeur',
    header: 'Ville',
  },
  {
    accessorKey: 'situationProfessionnelle',
    header: 'Situation Pro',
  },
  {
    accessorKey: 'situationFamiliale',
    header: 'Situation Familiale',
  },
  {
    accessorKey: 'revenus',
    header: 'Revenus',
  },
  {
    accessorKey: 'revenusConjoint',
    header: 'Revenus Conjoint',
  },
  {
    accessorKey: 'nombreEnfants',
    header: 'Enfants',
  },
  {
    accessorKey: 'agesEnfants',
    header: 'Âges enfants',
  },
  {
    accessorKey: 'situationProConjoint',
    header: 'Situation Pro Conjoint',
  },
  {
    accessorKey: 'autresAides',
    header: 'Autres Aides',
  },
  {
    accessorKey: 'autresCharges',
    header: 'Autres Charges',
  },
  {
    accessorKey: 'apl',
    header: 'APL',
  },
  {
    accessorKey: 'dettes',
    header: 'Dettes',
  },
  {
    accessorKey: 'natureDettes',
    header: 'Nature Dettes',
  },
  {
    accessorKey: 'facturesEnergie',
    header: 'Factures Énergie',
  },
  {
    accessorKey: 'remarques',
    header: 'Remarques',
    cell: ({ row }) => <div className="max-w-64">{row.getValue('remarques')}</div>,
  },
 
  {
    accessorKey: 'updatedAt',
    header: 'Modifiée le',
    cell: ({ row }) => new Date(row.getValue('updatedAt')).toLocaleDateString('fr-FR'),
  }, */
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
  {
    id: 'search',
    header: 'Recherche',
    accessorFn: row => `${row.nomDemandeur ?? ''} ${row.prenomDemandeur ?? ''} ${row.emailDemandeur ?? ''} ${row.telephoneDemandeur ?? ''}`,
    cell: '',
    filterFn: (row, id, value) => {
      const v = (value as string)?.toLowerCase?.() ?? '';
      const data = row.getValue(id)?.toString()?.toLowerCase?.() ?? '';
      return data.includes(v);
    },
    enableHiding: false,
  }

];
