import { ColumnDef } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import LongText from '@/components/long-text';
import { DataTableRowActions } from './data-table-row-actions';

import { DateRange } from 'react-day-picker';
import { Contact, ContactStatus } from '@/model/contact/Contact';
import { contactStatusTypes , contactStatusColor } from '../data/data';

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
        accessorFn: row => `${row.nom ?? ''} ${row.prenom ?? ''} ${row.email ?? ''} ${row.telephone?? ''}  ${row.codePostal ?? ''} ${row.numBeneficiaire ?? ''}`,

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
        header: 'Numéro',
        cell: ({ row }) => row.original.id ?? 'N/A',
    },
    {
        accessorKey: 'id',
        header: 'ID Contact',
        cell: ({ row }) => <LongText className="max-w-36">{row.getValue('id')}</LongText>,
        enableHiding: false,
    },
    {
        accessorKey: 'createdAt',
        header: 'Créée le',
        cell: ({ row }) => {
            const date = row.getValue('createdAt') as string;
            return date ? new Date(date).toLocaleDateString('fr-FR') : 'N/A';
        },
        filterFn: dateRangeFilter, // Ajout du filtre
    },

    // 👤 Informations du Contact 
   
    {
        accessorFn: (row) => `${row.nom ?? 'N/A'} ${row.prenom ?? ''}`,
        id: 'nom',
        header: 'Nom',
        cell: ({ row }) => `${row.original.nom ?? 'N/A'}`,
        enableHiding: true,
    },
    {
        accessorFn: (row) => row.prenom,
        id: 'prenom',
        header: 'Prénom',
        cell: ({ row }) => `${row.original?.prenom ?? 'N/A'}`,
        enableHiding: true,
    },
    {
        accessorFn: (row) => row?.age,
        id: 'age',
        header: 'Âge',
        cell: ({ row }) => row.original?.age ?? 'N/A',
    },
    {
        accessorFn: (row) => row?.telephone,
        id: 'telephone',
        header: 'Téléphone',
        cell: ({ row }) => row.original?.telephone ?? 'N/A',
    },
    {
        accessorFn: (row) => row?.email,
        id: 'email',
        header: 'Email',
        cell: ({ row }) => row.original?.email ?? 'N/A',
    },


    // 🟡 Statut de la Demande
    {
        accessorKey: 'status',
        header: 'Statut',
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
