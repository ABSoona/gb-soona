import LongText from '@/components/long-text';
import { Versement, VersementStatus } from '@/model/versement/versement';
import { ColumnDef } from '@tanstack/react-table';
import { addDays, addMonths, isBefore, isEqual } from 'date-fns';
import {  XCircleIcon } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Badge } from "@/components/ui/badge";
import { DateRange } from 'react-day-picker';
import { DataTableRowActions } from './data-table-row-actions';
import { versementStatusColor, versementStatusTypes } from '../data/data';
import { demandeStatusColor } from '@/features/demandes/data/data';
import { cn } from '@/lib/utils';
import { DataTableRowDocuments } from './data-table-row-documents';
import { DataTableColumnHeader } from './data-table-column-header';
import { userTypes } from '@/features/users/data/data';

const dateRangeFilter: ColumnDef<Versement>['filterFn'] = (row, columnId, filterValue: DateRange | undefined) => {
    if (!filterValue || (!filterValue.from && !filterValue.to)) {
        return true; // Aucun filtre, afficher toutes les lignes
    }

    const rowDate = new Date(row.getValue(columnId));
    return (
        (!filterValue.from || rowDate >= filterValue.from) &&
        (!filterValue.to || rowDate <= filterValue.to)
    );
};


export const columns: ColumnDef<Versement>[] = [
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



    // 📄 Informations de la Versement

    {

        accessorKey: 'id',
        header: 'ID Versement',
        cell: ({ row }) => <LongText className="max-w-36">{row.getValue('id')}</LongText>,
        enableHiding: false,
    },
    {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: 'Créée le',
        cell: ({ row }) => {
            const date = row.getValue('createdAt') as string;
            return date ? new Date(date).toLocaleDateString('fr-FR') : '-';
        },
        filterFn: dateRangeFilter, // Ajout du filtre
    },

   

    // 👤 Informations du Contact 




    {
        accessorFn: (row) => row.dataVersement,
        id: 'dataVersement',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Date d'écheance" />
        ),
        cell: ({ row }) => {
            const date = row.getValue('dataVersement') as string;
            return date ? new Date(date).toLocaleDateString('fr-FR') : '-';
        },
        filterFn: dateRangeFilter, // Ajout du filtre
        enableSorting: true,
    },
    {
        accessorFn: (row) => row.montant,
        id: 'montant',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Montant' />
        ),
        cell: ({ row }) => row.original?.montant?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }) ?? '-',
        enableHiding: true,
    },
    
    {
        accessorFn: (row) => row?.aide?.acteurVersement?.id ?? "", // <-- ID, pas le nom
        id: "acteurVersement",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Trésorier" />
        ),
        cell: ({ row }) => {
          const acteur = row.original?.aide.acteurVersement;
          const fullName = `${acteur?.firstName ?? "-"} ${acteur?.lastName?.[0]?.toUpperCase() ?? ""}`;
          const role = acteur?.role;
          const userType = userTypes.find(({ value }) => value === role);
      
          return (
            <div className="flex items-center gap-x-2">
              {userType?.icon && <userType.icon size={18} className="text-muted-foreground" />}
              <span className="capitalize">{fullName}</span>
            </div>
          );
        },
        filterFn: (row, id, value) => {
          const rowUserId = String(row.getValue(id) ?? "");
      
          // faceted filter => value est souvent string[]
          if (!value || (Array.isArray(value) && value.length === 0)) return true;
          return Array.isArray(value) ? value.includes(rowUserId) : rowUserId === String(value);
        },
        enableHiding: true,
      },

    {
        accessorFn: (row) => `${row.aide.contact?.nom ?? ''} ${row.aide.contact?.prenom ?? ''}`,
        id: 'contactNomPrenom',
        header: 'Bénéficiaire',
        cell: ({ row }) => {
          const contact = row.original.aide.contact;
          const fullName = `${contact?.nom ?? '-'} ${contact?.prenom ?? ''}`;
          return contact ? (
            <Link
              to="/contacts/$id"
              params={{ id: contact.id.toString() }}
              className="text-blue-600 hover:underline capitalize"
            >
              {fullName}
            </Link>
          ) : (
            <span className='capitalize'>{fullName}</span>
          );
        },
        enableHiding: true,
        filterFn: (row, id, value) => {
          const fullName = `${row.getValue(id)}`.toLowerCase();
          return fullName.includes(value.toLowerCase());
        },
      },

    {
        id: 'status',
        accessorKey: 'status',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Statut' />
        ),
        cell: ({ row }) => {
            const status: VersementStatus = row.getValue('status');
            const statusLabel = versementStatusTypes.find(s => s.value === status)?.label ?? 'Inconnu';

            return (
                <Badge variant="outline" className={cn('firt-letter:uppercase', versementStatusColor.get(status))}>
                    {statusLabel}
                </Badge>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },

    {

        id: 'enRetard',
        header: '',
        cell: ({ row }) => {
            return (
                (new Date(row.original.dataVersement) < addDays(new Date(),-1) && row.original.status === 'AVerser') ? <Badge variant="outline" className='bg-red-100/30 text-red-900 dark:text-red-200 border-red-200'>En retard</Badge> : '')
        },

        enableHiding: true,
        filterFn: (row, id, value) => {
            return new Date(row.original.dataVersement) < addDays(new Date(),-1) && row.original.status === 'AVerser'
        },

    },
    {
        id: 'documents',
        cell: DataTableRowDocuments,


    },

    // ⚙️ Actions
    {
        id: 'actions',
        cell: DataTableRowActions,


    },
];
