import LongText from '@/components/long-text';
import { Versement, VersementStatus } from '@/model/versement/versement';
import { ColumnDef } from '@tanstack/react-table';
import { addMonths, isBefore, isEqual } from 'date-fns';
import { XCircleIcon } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { DateRange } from 'react-day-picker';
import { DataTableRowActions } from './data-table-row-actions';
import { versementStatusColor, versementStatusTypes } from '../data/data';
import { demandeStatusColor } from '@/features/demandes/data/data';
import { cn } from '@/lib/utils';
import { DataTableRowDocuments } from './data-table-row-documents';
import { DataTableColumnHeader } from './data-table-column-header';

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
            return date ? new Date(date).toLocaleDateString('fr-FR') : 'N/A';
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
            return date ? new Date(date).toLocaleDateString('fr-FR') : 'N/A';
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
        cell: ({ row }) => row.original?.montant?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }) ?? 'N/A',
        enableHiding: true,
    },

    {
        accessorFn: (row) => `${row.aide.contact?.nom ?? ''} ${row.aide.contact?.prenom ?? ''}`,
        id: 'contactNomPrenom',
        header: 'Bénéficiaire',
        cell: ({ row }) => { return (<span className='capitalize'>{row.original.aide.contact?.nom ?? 'N/A'} {row.original.aide.contact?.prenom ?? ''}</span>) },
        enableHiding: true,
        filterFn: (row, id, value) => {
            const fullName = `${row.getValue(id)}`.toLowerCase(); // 🔥 Concaténer nom + prénom
            return fullName.includes(value.toLowerCase()); // 🔍 Vérifie si une partie du texte correspond
        },

    },

    {
        id: 'status',
        accessorKey: 'status',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Etat' />
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
                (new Date(row.original.dataVersement) < new Date() && row.original.status === 'AVerser') ? <Badge variant="outline" className='bg-red-100/30 text-red-900 dark:text-red-200 border-red-200'>En retard</Badge> : '')
        },

        enableHiding: true,
        filterFn: (row, id, value) => {
            return row.original.dataVersement < new Date() && row.original.status === 'AVerser'
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
