import LongText from '@/components/long-text';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableRowActions } from './data-table-row-actions';

import { Contact, ContactStatus } from '@/model/contact/Contact';
import { DateRange } from 'react-day-picker';
import { contactStatusColor, contactStatusTypes } from '../data/data';
import { DataTableColumnHeader } from './data-table-column-header';

const dateRangeFilter: ColumnDef<Contact>['filterFn'] = (row, columnId, filterValue: DateRange | undefined) => {
    if (!filterValue || (!filterValue.from && !filterValue.to)) {
        return true; // Aucun filtre, afficher toutes les lignes
    }

    const rowDate = new Date(row.getValue(columnId));
    return (
        (!filterValue.from || rowDate >= filterValue.from) &&
        (!filterValue.to || rowDate <= filterValue.to)
    );
};


export const aidesColumns: ColumnDef<Contact>[] = [
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
    {
        id: 'search',
        header: 'Recherche',
        accessorFn: row => `${row.nom ?? ''} ${row.prenom ?? ''} ${row.email ?? ''} ${row.telephone ?? ''}  ${row.codePostal ?? ''} ${row.numBeneficiaire ?? ''}`,

        filterFn: (row, id, value) => {
            const v = (value as string)?.toLowerCase?.() ?? '';
            const data = row.getValue(id)?.toString()?.toLowerCase?.() ?? '';
            return data.includes(v);
        },
        enableHiding: false,
    },
    // 📄 Informations de la Demande
    {
        accessorFn: (row) => row.id,
        id: 'numBeneficiaire',
        header: ({ column }) => (
                   <DataTableColumnHeader column={column} title='Numéro' />
                 ),
        cell: ({ row }) => row.original.id ?? '-',
    },
    {
        accessorKey: 'id',
        header: 'ID Bénéficiaire',
        cell: ({ row }) => <LongText className="max-w-36">{row.getValue('id')}</LongText>,
        enableHiding: false,
    },
    {
        accessorKey: 'createdAt',
         header: ({ column }) => (
                    <DataTableColumnHeader column={column} title='Créée le' />
                  ),
        cell: ({ row }) => {
            const date = row.getValue('createdAt') as string;
            return date ? new Date(date).toLocaleDateString('fr-FR') : '-';
        },
        filterFn: dateRangeFilter, // Ajout du filtre
    },

    // 👤 Informations du Contact 

    {
        accessorFn: (row) => row.nom,
        id: 'nom',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Nom' />
          ),
        cell: ({ row }) => `${row.original.nom ?? '-'}`,
        enableHiding: true,
    },
    {
        accessorFn: (row) => row.prenom,
        id: 'prenom',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Prénom' />
          ),
        cell: ({ row }) => `${row.original?.prenom ?? '-'}`,
        enableHiding: true,
    },
    {
        accessorFn: (row) => row?.age,
        id: 'age',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Age' />
          ),
        cell: ({ row }) => row.original?.age ? new Date().getFullYear() - row.original.age : '-'
    },
    {
        accessorFn: (row) => row?.telephone,
        id: 'telephone',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Téléphone' />
          ),
        cell: ({ row }) => row.original?.telephone ?? '-',
    },
    {
        accessorFn: (row) => row?.email,
        id: 'email',

        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Email' />
          ),
        cell: ({ row }) => row.original?.email ?? '-',
    },


    // 🟡 Etat de la Demande
    {
        accessorKey: 'status',
         header: ({ column }) => (
                    <DataTableColumnHeader column={column} title='Etat' />
                  ),
        cell: ({ row }) => {
            const status: ContactStatus = row.getValue('status');
            const statusLabel = contactStatusTypes.find(s => s.value === status)?.label ?? 'Inconnu';

            return (
                <Badge variant="outline" className={cn('capitalize', contactStatusColor.get(status))}>
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
