import { useState } from 'react';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { contactStatusTypes } from '../data/data';
import { situationTypes } from '@/model/demande/Demande';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { DataTableViewOptions } from './data-table-view-options';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;
    
    // ✅ État pour gérer la plage de dates
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

    // ✅ Mise à jour du filtre "Période"
    const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
        setDateRange(newDateRange); // 🔥 Met à jour l'affichage du DatePicker
        table.getColumn("createdAt")?.setFilterValue(newDateRange);
    };

    // ✅ Réinitialisation des filtres
    const handleResetFilters = () => {
        table.resetColumnFilters(); // 🔥 Réinitialise tous les filtres
        setDateRange(undefined); // 🔥 Vide le `DatePickerWithRange`
    };

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
                
                {/* 🔍 Filtre par nom */}
                <Input
                    placeholder="Filtrer les noms..."
                    value={(table.getColumn('nom')?.getFilterValue() as string) ?? ''}
                    onChange={(event) =>
                        table.getColumn('nom')?.setFilterValue(event.target.value)
                    }
                    className="h-8 w-[150px] lg:w-[250px]"
                />

                <div className="flex gap-x-2">
                    
                    {/* 📅 Filtre par Période */}
                    {table.getColumn('createdAt') && (
                        <DatePickerWithRange 
                            value={dateRange} // ✅ Garde l'état du datepicker synchronisé
                            onChange={handleDateRangeChange} 
                        />
                    )}

                    {/* 📌 Filtre par Statut */}
                    {table.getColumn('status') && (
                        <DataTableFacetedFilter
                            column={table.getColumn('status')}
                            title="Statut"
                            options={contactStatusTypes.map((t) => ({ ...t }))}
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
            <DataTableViewOptions table={table} />
        </div>
    );
}
