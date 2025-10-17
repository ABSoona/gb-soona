import LongText from '@/components/long-text';
import { Aide, AideFrequence } from '@/model/aide/Aide';
import { ColumnDef } from '@tanstack/react-table';
import { addMonths, isBefore, isEqual } from 'date-fns';
import { Check, XCircleIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { aideCredieteurTypes, aideFrquenceTypes, aideStatusTypes, typeAideTypes } from '../data/data';
import { DataTableRowActions } from './data-table-row-actions';
import { DataTableRowDocuments } from '../../versements/components/data-table-row-documents';
import { Progress } from '@/components/ui/progress';

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
        cell: ({ row }) => { return (<span className='capitalize'>{row.original.contact?.nom ?? '-'} {row.original.contact?.prenom ?? ''}</span>) },
        enableHiding: true,
        filterFn: (row, id, value) => {
            const fullName = `${row.getValue(id)}`.toLowerCase(); // 🔥 Concaténer nom + prénom
            return fullName.includes(value.toLowerCase()); // 🔍 Vérifie si une partie du texte correspond
        },

    },

    // 📄 Informations de la Aide

    {

        accessorKey: 'id',
        header: 'ID Aide',
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
        accessorFn: (row) => row.typeField,
        id: 'typeField',
        header: 'Type',
        cell: ({ row }) => typeAideTypes.find(e => e.value === row.original?.typeField)?.label ?? '-',
        enableHiding: true,
    },
    {
        accessorFn: (row) => row.montant,
        id: 'montant',
        header: 'montant',
        cell: ({ row }) => row.original?.montant?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }) ?? '-',
        enableHiding: true,
    },

    {
        accessorFn: (row) => row.frequence,
        id: 'frequence',
        header: 'Frequence',
        cell: ({ row }) => {
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
        header: 'Nb de versements',
        cell: ({ row }) => row.getValue('nombreVersements')

    },
    {
        accessorFn: (row) => row.dateAide,
        id: 'dateAide',
        header: 'Date de début',
        cell: ({ row }) => {
            const date = row.getValue('dateAide') as string;
            return date ? new Date(date).toLocaleDateString('fr-FR') : '-';
        },
        filterFn: dateRangeFilter, // Ajout du filtre
    },
    {
        accessorFn: (row) => row.crediteur,
        id: 'crediteur',
        header: 'Destinataire',
        cell: ({ row }) => {

            return aideCredieteurTypes.find(s => s.value === row.getValue('crediteur'))?.label ?? '';
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        id: 'progressionVersements',
        header: 'Progression',
        cell: ({ row }) => {
          const total = row.original.nombreVersements ?? 1;
          const versements = row.original.versements ?? [];
          const effectues = versements.filter(v => v.status === 'Verse').length;
          const progress = Math.min((effectues / total) * 100, 100);
      
          return (
            <div className="relative w-full max-w-[180px]">
              <Progress className='hsl(var(--chart-2))' value={progress} />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-medium pointer-events-none">
                {effectues} / {total}
              </span>
            </div>
          );
        },
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.status,
        id: 'status',
        header: 'Statut',
        cell: ({ row }) => {

            return aideStatusTypes.find(s => s.value === row.getValue('status'))?.label ?? '';
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    /* {
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
 */

    /* {
         accessorFn: (row) => row.dateExpiration,
         id: 'dateExpiration',
         header: 'Expire le',
         cell: ({ row }) => {
             const date = row.getValue('dateExpiration') as string;
             return date ? new Date(date).toLocaleDateString('fr-FR') : '-';
         },
         filterFn: dateRangeFilter, // Ajout du filtre
     },*/

    {
        accessorFn: (row) => row.reetudier,
        id: 'reetudier',
        header: 'Réetudier',
        cell: ({ row }) => {

            return row.original.reetudier ?
                <div className="flex items-center justify-center h-full"> <Check size={20} className='align-middle' /></div> :
                ''
        },
    },

    // 🟡 Etat de la Aide
    /* {
         id : 'status',
         accessorKey: 'status',
         header: 'Etat',
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
