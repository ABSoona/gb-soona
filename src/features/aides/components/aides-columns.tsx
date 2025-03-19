import { ColumnDef } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import LongText from '@/components/long-text';
import { Aide, AideFrequence } from '@/model/aide/Aide';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';
import { aideCredieteurTypes, aideFrquenceTypes} from '../data/data';
import { differenceInWeeks, differenceInMonths, isBefore, addWeeks, addMonths, isEqual } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';

const dateRangeFilter: ColumnDef<Aide>['filterFn'] = (row, columnId, filterValue: DateRange | undefined) => {
    if (!filterValue || (!filterValue.from && !filterValue.to)) {
        return true; // Aucun filtre, afficher toutes les lignes
    }

    const rowDate = new Date(row.getValue(columnId));
    return (
        (!filterValue.from || rowDate >= filterValue.from) &&
        (!filterValue.to || rowDate <= filterValue.to)
    );
};


export const columns: ColumnDef<Aide>[] = [
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
        accessorFn: (row) => `${row.contact?.nom ?? ''} ${row.contact?.prenom ?? ''}`,
        id: 'contactNomPrenom',
        header: 'Bénéficiaire',
        cell: ({ row }) => { return ( <span className='capitalize'>{row.original.contact?.nom ?? 'N/A'} {row.original.contact?.prenom ?? ''}</span>) },
        enableHiding: true,
        filterFn: (row, id, value) => {
            const fullName = `${row.getValue(id)}`.toLowerCase(); // 🔥 Concaténer nom + prénom
            return  fullName.includes(value.toLowerCase()); // 🔍 Vérifie si une partie du texte correspond
        },
        
    },

    // 📄 Informations de la Aide
   
    {
        
        accessorKey: 'id',
        header: 'ID Aide',
        cell: ({ row }) => <LongText className="max-w-36">{row.getValue('id')}</LongText>,
        enableHiding: false,
    },
    {   id: 'createdAt',
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
        accessorFn: (row) => row.montant,
        id: 'montant',
        header: 'montant',
        cell: ({ row }) => row.original?.montant?.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR',minimumFractionDigits: 0}) ?? 'N/A',
        enableHiding: true,
    },
  
    {
        accessorFn: (row) => row.frequence,
        id: 'frequence',
        header: 'Frequence',
        cell: ({ row }) =>{
            const frequenceAide: AideFrequence = row.getValue('frequence');
            return aideFrquenceTypes.find(s => s.value === frequenceAide)?.label ?? '';
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
          },
    },
    {
        accessorFn: (row) => row.nombreVersements,
        id: 'nombreVersements',
        header: 'Nombres de versements',
        cell: ({ row }) => row.getValue('nombreVersements')

    },
    {
        accessorFn: (row) => row.dateAide,
        id: 'dateAide',
        header: 'Date de début',
        cell: ({ row }) => {
            const date = row.getValue('dateAide') as string;
            return date ? new Date(date).toLocaleDateString('fr-FR') : 'N/A';
        },
        filterFn: dateRangeFilter, // Ajout du filtre
    },
    {
        accessorFn: (row) => row.crediteur,
        id: 'crediteur',
        header: 'Crédieteur',
        cell: ({ row }) =>{

            return aideCredieteurTypes.find(s => s.value === row.getValue('crediteur'))?.label ?? '';
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
          },
    },
    {
        id: 'verse',
        header: 'Versé',
        cell: ({ row }) => {
            const montantParVersement = row.original.montant ?? 0;
            const dateAide = new Date(row.original.dateAide);
            const nombreVersements = row.original.nombreVersements ?? 1;
            const suspendue = row.original.suspendue;
            const today = new Date();
    
            if (isBefore(today, dateAide)) {
                return '0,00 €';
            }
    
            if (row.original.frequence === 'UneFois') {
                return montantParVersement.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
            }
    
            // Nombre de versements effectués depuis dateAide jusqu'à today
            let nbVersementsEffectues = 0;
            let nextPaymentDate = dateAide;
    
            for (let i = 0; i < nombreVersements; i++) {
                if (isBefore(nextPaymentDate, today) || isEqual(nextPaymentDate, today)) {
                    nbVersementsEffectues++;
                    // Ajouter la logique de fréquence (par exemple mensuel ici)
                    nextPaymentDate = addMonths(nextPaymentDate, 1); // ou addWeeks() etc selon frequence
                } else {
                    break;
                }
            }
    
            if (suspendue) nbVersementsEffectues = 0;
    
            const montantVerse = (nbVersementsEffectues * montantParVersement).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
            return montantVerse;
        }
    },
  
    
    {
        id: 'resteAVerser',
        header: 'Reste à verser',
        cell: ({ row }) => {
            const montantParVersement = row.original.montant ?? 0;
            const nombreVersements = row.original.nombreVersements ?? 1;
            const dateAide = new Date(row.original.dateAide);
            const suspendue = row.original.suspendue;
            const today = new Date();
    
            if (row.original.frequence === 'UneFois') {
                return '0,00 €';
            }
    
            let nbVersementsEffectues = 0;
            let nextPaymentDate = dateAide;
    
            for (let i = 0; i < nombreVersements; i++) {
                if (isBefore(nextPaymentDate, today) || isEqual(nextPaymentDate, today)) {
                    nbVersementsEffectues++;
                    nextPaymentDate = addMonths(nextPaymentDate, 1);
                } else {
                    break;
                }
            }
    
            if (suspendue) nbVersementsEffectues = 0;
    
            const montantRestant = Math.max(0, (nombreVersements - nbVersementsEffectues) * montantParVersement).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
            return montantRestant;
        }
    },
    
    
   /* {
        accessorFn: (row) => row.dateExpiration,
        id: 'dateExpiration',
        header: 'Expire le',
        cell: ({ row }) => {
            const date = row.getValue('dateExpiration') as string;
            return date ? new Date(date).toLocaleDateString('fr-FR') : 'N/A';
        },
        filterFn: dateRangeFilter, // Ajout du filtre
    },*/
    
    {
        accessorFn: (row) => row.suspendue,
        id: 'suspendue',
        header: 'Suspendue',
        cell: ({ row }) => {
            
                
            
         return    row.original.suspendue ? 
         <div   > <XCircleIcon  className='align-middle'/></div> : 
           ''
        },
    },
   
    // 🟡 Statut de la Aide
   /* {
        id : 'status',
        accessorKey: 'status',
        header: 'Statut',
        cell: ({ row }) => {
            const status: AideStatus = row.getValue('status');
            const statusLabel = aideStatusTypes.find(s => s.value === status)?.label ?? 'Inconnu';

            return (
                <Badge variant="outline" className={cn('capitalize', aideStatusColor.get(status))}>
                    {statusLabel}
                </Badge>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
          },
    },*/

    // ⚙️ Actions
    {
        id: 'actions',
        cell: DataTableRowActions,
           
    
    },
];
