import { ColumnDef } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import LongText from '@/components/long-text';
import { Demande, DemandeStatus } from '@/model/demande/Demande';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';
import { demandeStatusColor, demandeStatusTypes, situationFamilleTypes, situationTypes } from '../data/data';
import { SituationPro } from '@/model/contact/Contact';
import { DateRange } from 'react-day-picker';

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
        header: 'Numéro de demande',
        cell: ({ row }) => row.original.id ?? 'N/A',
    },
    {
        accessorKey: 'id',
        header: 'ID Demande',
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
        accessorFn: (row) => `${row.contact?.nom ?? ''} ${row.contact?.prenom ?? ''}`,
        id: 'contactNomPrenom',
        header: 'Demandeur',
        cell: ({ row }) => { return ( <span className='capitalize'>{row.original.contact?.nom ?? 'N/A'} {row.original.contact?.prenom ?? ''}</span>) },
        enableHiding: true,
        filterFn: (row, id, value) => {
            const fullName = `${row.getValue(id)}`.toLowerCase(); // 🔥 Concaténer nom + prénom
            return  fullName.includes(value.toLowerCase()); // 🔍 Vérifie si une partie du texte correspond
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
        accessorFn: (row) => row.contact?.agesEnfants,
        id: 'agesEnfants',
        header: 'Âges des Enfants',
        cell: ({ row }) => row.original.contact?.agesEnfants ?? 'N/A',
    },
    {
        accessorFn: (row) => row.contact?.nombreEnfants,
        id: 'nombreEnfants',
        header: 'Enfants',
        cell: ({ row }) => row.original.contact?.nombreEnfants ?? 0,
    },
    {
        accessorFn: (row) => row.contact?.situationFamiliale,
        id: 'situationFamiliale',
        header: 'Situation Familiale',
        cell: ({ row }) => {
            const situationF =  row.original.contact?.situationFamiliale ?? 'N/A';
            return situationFamilleTypes.find(s => s.value === situationF)?.label ?? 'N/A';
        }
    },
    {
        accessorFn: (row) => row.contact?.situationProfessionnelle,
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
        accessorFn: (row) => row.contact?.revenus,
        id: 'revenus',
        header: 'Revenus',
        cell: ({ row }) => row.original.contact?.revenus?.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR',minimumFractionDigits: 0}) ?? 'N/A',
    },
    {
       // accessorFn: (row) => row.contact?.revenus,
        id: 'charges',
        header: 'Charges',
        cell: ({ row }) =>  
        ((row.original.contact?.facturesEnergie ?? 0) +
        (row.original.contact?.loyer ?? 0)).toLocaleString('fr-FR', {style: 'currency', currency: 'EUR',minimumFractionDigits: 0}) ,
        enableHiding: true,
    },
    {
        accessorFn: (row) => row.contact?.revenusConjoint,
        id: 'revenusConjoint',
        header: 'Revenus Conjoint',
        cell: ({ row }) => row.original.contact?.revenusConjoint?.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR',minimumFractionDigits: 0}) ?? 'N/A',
        enableHiding: true,
    },
    {
        accessorFn: (row) => row.contact?.autresAides,
        id: 'autresAides',
        header: 'Autres Aides',
        cell: ({ row }) => row.original.contact?.autresAides ?? '0',
    },
    {
        accessorFn: (row) => row.contact?.dettes,
        id: 'dettes',
        header: 'Dettes',
        cell: ({ row }) => row.original.contact?.dettes?.toLocaleString() ?? '0',
    },
    {
        accessorFn: (row) => row.contact?.facturesEnergie,
        id: 'facturesEnergie',
        header: 'Factures Énergie',
        cell: ({ row }) => row.original.contact?.facturesEnergie?.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR',minimumFractionDigits: 0}) ?? '0',
    },
    {
        accessorFn: (row) => row.contact?.loyer,
        id: 'loyer',
        header: 'Loyer',
        cell: ({ row }) => row.original.contact?.loyer?.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR',minimumFractionDigits: 0}) ?? 'N/A',
    },
    {
        accessorFn: (row) => row.contact?.resteAVivre,
        id: 'resteAVivre',
        header: 'Reste à Vivre',
        cell: ({ row }) => row.original.contact?.resteAVivre?.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR',minimumFractionDigits: 0}) ?? 'N/A',
    },
   

    // 💰 Aides Associées
    {
        id: 'aides',
        header: 'Aides Antérieures',
        cell: ({ row }) => {
            const aides = row.original.contact?.aides ?? [];
            const totalAides = aides.reduce((total, aide) => total + (aide.montant ?? 0), 0);
            return totalAides.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR',minimumFractionDigits: 0}) ?? '0';
        },
    },

    // 🟡 Statut de la Demande
    {
        accessorKey: 'status',
        header: 'Statut',
        cell: ({ row }) => {
            const status: DemandeStatus = row.getValue('status');
            const statusLabel = demandeStatusTypes.find(s => s.value === status)?.label ?? 'Inconnu';

            return (
                <Badge variant="outline" className={cn('capitalize', demandeStatusColor.get(status))}>
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
