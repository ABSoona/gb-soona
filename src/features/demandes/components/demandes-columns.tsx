import LongText from '@/components/long-text';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Demande, DemandeStatus, SituationPro, categorieDemandeur, situationFamilleTypes, situationTypes } from '@/model/demande/Demande';
import { ColumnDef } from '@tanstack/react-table';
import { DateRange } from 'react-day-picker';
import { categorieTypes, demandeStatusColor, demandeStatusTypes } from '../data/data';
import { DataTableRowActions } from './data-table-row-actions';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { userTypes } from '@/features/users/data/data';

const dateRangeFilter: ColumnDef<Demande>['filterFn'] = (row, columnId, filterValue: DateRange | undefined) => {
    if (!filterValue || (!filterValue.from && !filterValue.to)) {
        return true; // Aucun filtre, afficher toutes les lignes
    }

    const rowDate = new Date(row.getValue(columnId));
    return (
        (!filterValue.from || rowDate >= filterValue.from) &&
        (!filterValue.to || rowDate <= filterValue.to)
    );
};


export const columns: ColumnDef<Demande>[] = [
    // Sélection des lignes
    /* {
         id: 'select',
         header: ({ table }) => (
             <Checkbox
                 checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                 onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                 aria-label="Select all"
                 className="translate-y-[2px]"
             />
         ),
         cell: ({ row }) => (
             <Checkbox
                 checked={row.getIsSelected()}
                 onCheckedChange={(value) => row.toggleSelected(!!value)}
                 aria-label="Select row"
                 className="translate-y-[2px]"
             />
         ),
         enableSorting: false,
         enableHiding: false,
     },*/

    // 📄 Informations de la Demande
    {

        accessorFn: (row) => row.id,
        id: 'numeroDemande',
        header: 'N°',
        cell: ({ row }) => row.original.id ?? 'N/A',
    },
    {

        accessorKey: 'id',
        header: 'ID Demande',
        cell: ({ row }) => <LongText className="max-w-36">{row.getValue('id')}</LongText>,
        enableHiding: false,
    },
    {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: 'Reçue le',
        cell: ({ row }) => {
            const date = row.getValue('createdAt') as string;
            return date ? new Date(date).toLocaleDateString('fr-FR') : 'N/A';
        },
        filterFn: dateRangeFilter, // Ajout du filtre
    },

    // 👤 Informations du Contact 
    {
        accessorFn: (row) => `${row.contact?.nom ?? ''} ${row.contact?.prenom ?? ''}`,
        id: 'contactNomPrenom',
        header: 'Bénéficiaire',
        cell: ({ row }) => { return (<span className='capitalize'>{row.original.contact?.nom ?? 'N/A'} {row.original.contact?.prenom ?? ''}</span>) },
        enableHiding: true,
        filterFn: (row, id, value) => {
            const fullName = `${row.getValue(id)}`.toLowerCase(); // 🔥 Concaténer nom + prénom
            return fullName.includes(value.toLowerCase()); // 🔍 Vérifie si une partie du texte correspond
        },

    },
    {
        accessorFn: (row) => row?.categorieDemandeur,
        id: 'categorieDemandeur',
        header: 'Catégorie',
        cell: ({ row }) => {
            const categorieDemandeur: categorieDemandeur = row.getValue('categorieDemandeur');
            return categorieTypes.find(s => s.value === categorieDemandeur)?.label ?? 'N/A';
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorFn: (row) => `${row?.acteur?.firstName ?? ''} ${row?.acteur?.lastName ?? ''}`,
        id: 'acteur',
        header: 'Attribué à',
        cell: ({ row }) => {
          const acteur = row.original?.acteur;
          const fullName = `${acteur?.firstName ?? 'N/A'} ${acteur?.lastName ?? ''}`;
          const role = acteur?.role;
          const userType = userTypes.find(({ value }) => value === role);
      
          return (
            <div className='flex items-center gap-x-2'>
              {userType?.icon && (
                <userType.icon size={18} className='text-muted-foreground' />
              )}
              <span className='capitalize'>{fullName}</span>
            </div>
          );
        },
        enableHiding: true,
        filterFn: (row, id, value) => {
          const fullName = `${row.getValue(id)}`.toLowerCase();
          return fullName.includes(value.toLowerCase());
        },
      },
      
    {
        id: 'dernierContact',
        accessorKey: 'dernierContact',
        header: 'Entretien tél',
        cell: ({ row }) => {
            const dateStr = row.getValue('dernierContact') as string;
            if (!dateStr) return 'Jamais';
        
            const date = new Date(dateStr);
            return `${formatDistanceToNow(date, { addSuffix: true, locale: fr })}`;
          },
        filterFn: dateRangeFilter, // Ajout du filtre
    },
    {
        id: 'derniereRelance',
        accessorKey: 'derniereRelance',
        header: 'Dernière relance',
        cell: ({ row }) => {
          const dateStr = row.getValue('derniereRelance') as string;
          if (!dateStr) return 'Jamais';
      
          const date = new Date(dateStr);
          return `${formatDistanceToNow(date, { addSuffix: true, locale: fr })}`;
        },
        filterFn: dateRangeFilter,
      },
    {
        accessorFn: (row) => row?.nombreRelances,
        id: 'nombreRelances',
        header: 'Relancé',
        cell: ({ row }) => {
          const relances = row.original.nombreRelances;
      
          if (!relances) return 'Jamais'; // couvre null, undefined, et 0
          return `${relances} fois`;
        },
      },
    
    
   
    {
        accessorFn: (row) => row.contact?.nom,
        id: 'contactNom',
        header: 'Nom',
        cell: ({ row }) => `${row.original.contact?.nom ?? 'N/A'} ${row.original.contact?.prenom ?? ''}`,
        enableHiding: true,
    },
    {
        accessorFn: (row) => row.contact?.prenom,
        id: 'contactPrenom',
        header: 'Prénom',
        cell: ({ row }) => `${row.original.contact?.prenom ?? 'N/A'} ${row.original.contact?.prenom ?? ''}`,
        enableHiding: true,
    },
    {
        accessorFn: (row) => row.contact?.age,
        id: 'contactAge',
        header: 'Âge',
        cell: ({ row }) => row.original.contact?.age ?? 'N/A',
    },
    {
        accessorFn: (row) => row?.agesEnfants,
        id: 'agesEnfants',
        header: 'Âges des Enfants',
        cell: ({ row }) => row.original?.agesEnfants ?? 'N/A',
    },
    {
        accessorFn: (row) => row?.nombreEnfants,
        id: 'nombreEnfants',
        header: 'Enfants',
        cell: ({ row }) => row.original?.nombreEnfants ?? 0,
    },
    {
        accessorFn: (row) => row?.situationFamiliale,
        id: 'situationFamiliale',
        header: 'Situation Familiale',
        cell: ({ row }) => {
            const situationF = row.original?.situationFamiliale ?? 'N/A';
            return situationFamilleTypes.find(s => s.value === situationF)?.label ?? 'N/A';
        }
    },
    {
        accessorFn: (row) => row?.situationProfessionnelle,
        id: 'situationProfessionnelle',
        header: 'Situation Pro',
        cell: ({ row }) => {
            const situationPro: SituationPro = row.getValue('situationProfessionnelle');
            return situationTypes.find(s => s.value === situationPro)?.label ?? 'N/A';
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
   

    {
        accessorFn: (row) => row?.revenus,
        id: 'revenus',
        header: 'Revenus',
        cell: ({ row }) => row.original?.revenus?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }) ?? 'N/A',
    },
    {
        // accessorFn: (row) => row.contact?.revenus,
        id: 'charges',
        accessorKey: 'charges',
        header: 'Charges',
        cell: ({ row }) =>
            ((row.original?.facturesEnergie ?? 0) +
                (row.original?.loyer ?? 0)).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }),
        enableHiding: true,
    },
    {
        accessorFn: (row) => row?.revenusConjoint,
        id: 'revenusConjoint',
        header: 'Revenus Conjoint',
        cell: ({ row }) => row.original?.revenusConjoint?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }) ?? 'N/A',
        enableHiding: true,
    },
    {
        accessorFn: (row) => row?.autresAides,
        id: 'autresAides',
        header: 'Autres Aides',
        cell: ({ row }) => row.original?.autresAides ?? '',
    },
    {
        accessorFn: (row) => row?.dettes,
        id: 'dettes',
        header: 'Dettes',
        cell: ({ row }) => row.original?.dettes?.toLocaleString() ?? '0',
    },
    {
        accessorFn: (row) => row?.facturesEnergie,
        id: 'facturesEnergie',
        header: 'Factures Énergie',
        cell: ({ row }) => row.original?.facturesEnergie?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }) ?? '0',
    },
    {
        accessorFn: (row) => row?.loyer,
        id: 'loyer',
        header: 'Loyer',
        cell: ({ row }) => row.original?.loyer?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }) ?? 'N/A',
    },
    {
        //accessorFn: (row) => row?.resteAVivre,
        accessorKey: 'resteAVivre',
        id: 'resteAVivre',
        header: 'Reste à Vivre',
        cell: ({ row }) => (
            (row.original?.revenusConjoint ?? 0) +
            (row.original?.apl ?? 0) +
            (row.original?.revenus ?? 0) -
            (row.original?.facturesEnergie ?? 0) -
            (row.original?.autresCharges ?? 0) -
            (row.original?.loyer ?? 0))
            .toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }),
    },


    // 💰 Aides Associées
    {
        id: 'aides',
        header: 'Aides Antérieures',
        cell: ({ row }) => {
            const aides = row.original.contact?.aides ?? [];
            const totalAides = aides.reduce((total, aide) => total + (aide.montant ?? 0), 0);
            return totalAides.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }) ?? '0';
        },
    },

    // 🟡 Statut de la Demande
    {
        id: 'status',
        accessorKey: 'status',
        header: 'Statut',
        cell: ({ row }) => {
            const status: DemandeStatus = row.getValue('status');
            const statusLabel = demandeStatusTypes.find(s => s.value === status)?.label ?? 'Inconnu';

            return (
                <Badge variant="outline" className={cn('firt-letter:uppercase', demandeStatusColor.get(status))}>
                    {statusLabel}
                </Badge>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },

    // ⚙️ Actions
    {
        id: 'actions',
        cell: DataTableRowActions,


    },
];
