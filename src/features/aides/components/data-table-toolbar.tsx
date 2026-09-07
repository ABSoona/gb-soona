import { useEffect, useMemo, useState } from 'react';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { aideCredieteurTypes, aideFrquenceTypes, aideStatusTypes } from '../data/data';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { DataTableViewOptions } from './data-table-view-options';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { DataTableExport } from './data-table-export';
import { useUserServicev2 } from '@/api/user/userService.v2';

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    onExportAll?: () => Promise<TData[]>;
}

export function DataTableToolbar<TData>({ table, onExportAll }: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;

    // ✅ État pour gérer les filtres sauvegardés
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [filterName, setFilterName] = useState<string>('');
     const { users } = useUserServicev2(
               { where: { role: { not: "visiteur" } } } 
            );
            const userOptions = useMemo(
                () =>
                  (users ?? []).map((u: any) => ({
                    label: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.id,
                    value: u.id, // IMPORTANT : doit matcher la valeur stockée dans la colonne acteurVersement
                  })),
                [users]
              );
    // ✅ Restaurer les filtres depuis localStorage au chargement
    useEffect(() => {
        // 🔹 Restaurer le filtre "Nom"
        const savedName = localStorage.getItem('filter-name');
        if (savedName) {
            setFilterName(savedName);
            table.getColumn('contactNomPrenom')?.setFilterValue(savedName);
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
                    table.getColumn('dateAide')?.setFilterValue(parsedDateRange);
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
            table.getColumn('dateAide')?.setFilterValue(newDateRange);
            localStorage.setItem('filter-date-range', JSON.stringify(newDateRange));

        }

        // 🔥 Sauvegarde dans localStorage

    };

    // ✅ Réinitialisation complète des filtres
    const handleResetFilters = () => {
        table.resetColumnFilters(); // 🔥 Réinitialise tous les filtres
        setDateRange(undefined);
        setFilterName('');

        // 🔥 Supprime les filtres de `localStorage`
        localStorage.removeItem('filter-name');
        localStorage.removeItem('filter-date-range');

        table.getAllColumns().forEach(column => {
            if (column.getCanFilter()) {
                localStorage.removeItem(`aide-filters-${column.id}`);
            }
        });
    };

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">

                {/* 🔍 Filtre par nom (avec sauvegarde) */}
                <Input
                    placeholder="Filtrer par noms..."
                    value={filterName}
                    onChange={handleNameFilterChange} // ✅ Mise à jour avec `localStorage`
                    className="h-8 w-[150px] lg:w-[250px]"
                />

                <div className="flex gap-x-2">

                    {/* 📅 Filtre par Période (avec sauvegarde) */}
                    {table.getColumn('dateAide') && (
                        <DatePickerWithRange
                            value={dateRange}
                            onChange={handleDateRangeChange} // ✅ Mise à jour avec `localStorage`
                        />
                    )}



                    {/* 📌 Filtre par Etat */}
                    {table.getColumn('frequence') && (
                        <DataTableFacetedFilter
                            column={table.getColumn('frequence')}
                            title="Frequence"
                            options={aideFrquenceTypes.map((t) => ({ ...t }))}
                        />
                    )}
                    {table.getColumn('crediteur') && (
                        <DataTableFacetedFilter
                            column={table.getColumn('crediteur')}
                            title="Destinataire"
                            options={aideCredieteurTypes.map((t) => ({ ...t }))}
                        />
                    )}
                     {table.getColumn('acteurVersement') && (
                                            <DataTableFacetedFilter
                                                column={table.getColumn('acteurVersement')}
                                                 title="Trésorier"
                                                  options={userOptions}
                                            />
                                        )}
                    {table.getColumn('suspendue') && (
                        <DataTableFacetedFilter
                            column={table.getColumn('suspendue')}
                            title="suspendue"
                            options={[{ label: 'Oui', value: 'false' }, { label: 'Non', value: 'true' }]}
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
            <div><DataTableExport table={table} onExportAll={onExportAll} /></div>


        </div>
    );
}
