import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Input } from '@/components/ui/input';
import { situationFamilleTypes, situationTypes } from '@/model/demande/Demande';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { categorieTypes, demandeStatusTypes } from '../data/data';
import { DataTableExport } from './data-table-export';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { DataTableViewOptions } from './data-table-view-options';

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
}
export const departementOptions = Array.from({ length: 95 }, (_, i) => {
    const code = (i + 1).toString().padStart(2, "0")
    return { label: code, value: code }
  })
export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;

    // ✅ État pour gérer les filtres sauvegardés
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [filterName, setFilterName] = useState<string>('');
    const [decisionDateRange, setDecisionDateRange] = useState<DateRange | undefined>();

    // ✅ Restaurer les filtres depuis localStorage au chargement
    useEffect(() => {
        // 🔹 Restaurer le filtre "Nom"
        const savedName = localStorage.getItem('filter-name');
        if (savedName) {
            setFilterName(savedName);
            table.getColumn('contactNomPrenom')?.setFilterValue(savedName);
        }
        // 🔹 Restaurer le filtre "decisionDate"
            const savedDecisionRange = localStorage.getItem('filter-decision-date-range');
            if (savedDecisionRange && savedDecisionRange !== "undefined") {
                try {
                    const storedDecisionRange = JSON.parse(savedDecisionRange);
                    if (storedDecisionRange) {
                        const parsedDecisionRange = {
                            from: new Date(storedDecisionRange.from),
                            to: new Date(storedDecisionRange.to),
                        };
                        setDecisionDateRange(parsedDecisionRange);
                        table.getColumn('decisionDate')?.setFilterValue(parsedDecisionRange);
                    }
                } catch (error) {
                    console.error("Erreur lors de la récupération du filtre decisionDate :", error);
                    localStorage.removeItem('filter-decision-date-range');
                }
            } else {
                setDecisionDateRange(undefined);
            }


        // 🔹 Restaurer le filtre "Période" (et éviter qu'il soit écrasé)
        const savedDateRange = localStorage.getItem('filter-date-range');
        if (savedDateRange && savedDateRange !== "undefined") {
            try {
                const stroredDateRange = JSON.parse(savedDateRange);
                if (stroredDateRange) {
                    const parsedDateRange = {
                        from: new Date(stroredDateRange.from),
                        to: new Date(stroredDateRange.to),
                    };
                    setDateRange(parsedDateRange);
                    table.getColumn('createdAt')?.setFilterValue(parsedDateRange);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération du filtre date-range :", error);
                localStorage.removeItem('filter-date-range'); // 🔥 Supprime les données corrompues
            }
        } else {
            // 🔥 Si aucun filtre de date n'est sauvegardé, éviter de l’écraser avec undefined
            setDateRange(undefined);
        }
    }, []);
    // ✅ Mise à jour du filtre "Nom"
    const handleNameFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newName = event.target.value;
        setFilterName(newName);
        table.getColumn('contactNomPrenom')?.setFilterValue(newName);

        // 🔥 Sauvegarde dans localStorage
        localStorage.setItem('filter-name', newName);
    };

    // ✅ Mise à jour du filtre "Période"
    const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
        if (newDateRange?.from != null && newDateRange?.to != null) {

            setDateRange(newDateRange);
            table.getColumn('createdAt')?.setFilterValue(newDateRange);
            localStorage.setItem('filter-date-range', JSON.stringify(newDateRange));

        }

        // 🔥 Sauvegarde dans localStorage

    };
    const handleDecisionDateChange = (newRange: DateRange | undefined) => {
        if (newRange?.from != null && newRange?.to != null) {
            setDecisionDateRange(newRange);
            table.getColumn('decisionDate')?.setFilterValue(newRange);
    
            // Sauvegarde
            localStorage.setItem('filter-decision-date-range', JSON.stringify(newRange));
        }
    };

    // ✅ Réinitialisation complète des filtres
    const handleResetFilters = () => {
        table.resetColumnFilters(); // 🔥 Réinitialise tous les filtres
        setDateRange(undefined);
        setDecisionDateRange(undefined);
        setFilterName('');

        // 🔥 Supprime les filtres de `localStorage`
        localStorage.removeItem('filter-name');
        localStorage.removeItem('filter-date-range');
        localStorage.removeItem('filter-decision-date-range');

        table.getAllColumns().forEach(column => {
            if (column.getCanFilter()) {
                localStorage.removeItem(`demande-filters-${column.id}`);
            }
        });
    };

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">

                {/* 🔍 Filtre par nom (avec sauvegarde) */}
                <Input
                    placeholder="Filtrer les noms..."
                    value={filterName}
                    onChange={handleNameFilterChange} // ✅ Mise à jour avec `localStorage`
                    className="h-8 w-[150px] lg:w-[250px]"
                />

                <div className="flex gap-x-2">

                    {/* 📅 Filtre par Période (avec sauvegarde) */}
                    {table.getColumn('createdAt') && (
                        <DatePickerWithRange
                            value={dateRange}
                            onChange={handleDateRangeChange} // ✅ Mise à jour avec `localStorage`
                            placeholder={"Date réception"}
                             
                        />
                    )}
                    {table.getColumn('decisionDate') && (
                        <DatePickerWithRange
                            value={decisionDateRange}
                            onChange={handleDecisionDateChange}
                            placeholder={"Date décision"}
                        />
                    )}
                    {/* Filtre "Département" désactivé temporairement : il dépendait du
                    filtrage client sur le jeu de données complet ; avec la pagination
                    serveur il faudrait un champ dénormalisé sur Demande pour le refaire
                    proprement côté serveur. */}
                    {/* 📌 Filtre par Etat */}
                    {table.getColumn('status') && (
                        <DataTableFacetedFilter
                            column={table.getColumn('status')}
                            title="Statut"
                            options={demandeStatusTypes.map((t) => ({ ...t }))}
                        />
                    )}

                    {/* 📌 Filtre par Situation Professionnelle */}
                    {/* {table.getColumn('situationProfessionnelle') && (
                        <DataTableFacetedFilter
                            column={table.getColumn('situationProfessionnelle')}
                            title="Situation Pro."
                            options={situationTypes.map((t) => ({ ...t }))}
                        />
                    )} */}
                    {/* 📌 Filtre par Situation Professionnelle */}
                    {/* table.getColumn('situationFamiliale') && (
                        <DataTableFacetedFilter
                            column={table.getColumn('situationFamiliale')}
                            title="Situation Famil."
                            options={situationFamilleTypes.map((t) => ({ ...t }))}
                        />
                    ) */}
                    {/* 📌 Filtre par categorie */}
                    {table.getColumn('categorieDemandeur') && (
                        <DataTableFacetedFilter
                            column={table.getColumn('categorieDemandeur')}
                            title="Catégorie"
                            options={categorieTypes.map((t) => ({ ...t }))}
                        />
                    )}

                </div>

                {/* 🔄 Bouton de réinitialisation des filtres */}
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={handleResetFilters} // ✅ Corrige la réinitialisation complète
                        className="h-8 px-2 lg:px-3"
                    >
                        Réinitialiser
                        <Cross2Icon className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* ⚙️ Options d'affichage des colonnes */}
            <div className='mx-2'><DataTableViewOptions table={table} /></div>
            <div><DataTableExport table={table} /></div>


        </div>
    );
}
