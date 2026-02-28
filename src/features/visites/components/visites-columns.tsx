import LongText from '@/components/long-text';
import { Visite, VisiteStatus } from '@/model/visite/Visite';
import { ColumnDef } from '@tanstack/react-table';
import { addDays, addMonths, isBefore, isEqual } from 'date-fns';
import { XCircleIcon } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Badge } from "@/components/ui/badge";
import { DateRange } from 'react-day-picker';

import { visiteStatusColor, visiteStatusTypes } from '../data/data';
import { demandeStatusColor } from '@/features/demandes/data/data';
import { cn } from '@/lib/utils';

import { DataTableColumnHeader } from './data-table-column-header';
import { userTypes } from '@/features/users/data/data';


const dateRangeFilter: ColumnDef<Visite>['filterFn'] = (row, columnId, filterValue: DateRange | undefined) => {
    if (!filterValue || (!filterValue.from && !filterValue.to)) {
        return true; // Aucun filtre, afficher toutes les lignes
    }

    const rowDate = new Date(row.getValue(columnId));
    return (
        (!filterValue.from || rowDate >= filterValue.from) &&
        (!filterValue.to || rowDate <= filterValue.to)
    );
};


export const columns: ColumnDef<Visite>[] = [
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



    // 📄 Informations de la Visite

    {

        accessorKey: 'id',
        header: 'ID Visite',
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
        accessorFn: (row) => row.dateVisite,
        id: 'dateVisite',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Date de la visite" />
        ),
        cell: ({ row }) => {
            const date = row.getValue('dateVisite') as string;
            return date ? new Date(date).toLocaleDateString('fr-FR') : '-';
        },
        filterFn: dateRangeFilter, // Ajout du filtre
        enableSorting: true,
    },
    {
        accessorFn: (row) => row?.demande.contact?.id ?? "", // <-- ID, pas le nom
        id: "beneficiaire",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Béneficiaire" />
        ),
      
        cell: ({ row }) => {
            const beneficiaire = row.original?.demande.contact;
            const fullName = `${beneficiaire?.nom ?? "-"} ${beneficiaire?.prenom ?? ""}`;
            return beneficiaire ? (
              <Link
                to="/contacts/$id"
                params={{ id: beneficiaire?.id.toString()}}
                className="text-blue-600 hover:underline capitalize"
              >
                {fullName}
              </Link>
            ) : (
              <span className='capitalize'>{fullName}</span>
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
        accessorFn: (row) => row?.acteur?.superieur?.id ?? "", // <-- ID, pas le nom
        id: "superieur",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Membre" />
        ),
        cell: ({ row }) => {
            const acteur = row.original?.acteur.superieur;
            const fullName = `${acteur?.firstName ?? "-"} ${acteur?.lastName ?? ""}`;
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
        accessorFn: (row) => row?.acteur?.id ?? "", // <-- ID, pas le nom
        id: "acteur",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Visiteur" />
        ),
        cell: ({ row }) => {
            const acteur = row.original?.acteur;
            const fullName = `${acteur?.firstName ?? "-"} ${acteur?.lastName ?? ""}`;
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



    /*  {
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
       }, */

    {
        id: 'status',
        accessorKey: 'status',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Statut' />
        ),
        cell: ({ row }) => {
            const status: VisiteStatus = row.getValue('status');
            const statusLabel = visiteStatusTypes.find(s => s.value === status)?.label ?? 'Inconnu';

            return (
                <Badge variant="outline" className={cn('firt-letter:uppercase', visiteStatusColor.get(status))}>
                    {statusLabel}
                </Badge>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },



    // ⚙️ Actions
   /*  {
        id: 'actions',
        cell: DataTableRowActions,


    }, */
];
