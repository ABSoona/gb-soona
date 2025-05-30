import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Demande } from '@/model/demande/Demande';
import { useNavigate } from '@tanstack/react-router';
import {
    ColumnDef,
    ColumnFiltersState,
    RowData,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { useDemandes } from '../context/demandes-context';
import { DataTablePagination } from './data-table-pagination';
import { DataTableToolbar } from './data-table-toolbar';

declare module '@tanstack/react-table' {
    interface ColumnMeta<TData extends RowData, TValue> {
        className: string;
    }
}
export enum detailOpenOption { 'sheet', 'page' };
interface DataTableProps {
    columns: ColumnDef<Demande>[];
    data: Demande[];
    hideTools?: boolean;
    showDetailIn?: detailOpenOption;
    hideActions?: boolean
}

export function DemandesTable({ columns, data, hideTools = false, hideActions = false, showDetailIn = detailOpenOption.page }: DataTableProps) {
    const [rowSelection, setRowSelection] = useState({});
    const navigate = useNavigate();
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(

        {
            contactId: false,
            Age: false,
            agesEnfants: false,
            nombreEnfants: false,
            autresAides: false,
            facturesEnergie: false,
            loyer: false,
            revenus:false,
            contactNom: false,
            contactPrenom: false,
            situationFamiliale: false,
            remarques: false,
            revenusConjoint: false,
            id: false,
            status: true,
            charges:false,
            dettes : false,
            contactAge: false,
            situationProfessionnelle:false,
            resteAVivre:false


        }

    );

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = useState<SortingState>([]);

    // 🔥 Utilisation du filtre par période
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
        },
        enableMultiRowSelection: false,
        enableRowSelection: false,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    });
    // 🔥 Appliquer le filtre `createdAt` dès que `dateRange` change


    const { setOpenDemande: setOpen, setCurrentRow } = useDemandes();

    return (
        <div className="space-y-4">
            {/* 🔥 Passer `setDateRange` à `DataTableToolbar` */}
            {!hideTools && <DataTableToolbar table={table} />}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="group/row">
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        className={header.column.columnDef.meta?.className ?? ''}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow style={{ cursor: 'pointer' }}
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    className="group/row"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={cell.column.columnDef.meta?.className ?? ''}

                                            onClick={(e) => {
                                                if (cell.column.id !== 'actions') {
                                                    if (showDetailIn == detailOpenOption.page) {

                                                        navigate({
                                                            to: `/demandes/${row.original.id.toString()}/`,
                                                            params: { id: row.original.id.toString() },
                                                            // Ajout du paramètre de recherche
                                                        });



                                                    }
                                                    else {
                                                        setCurrentRow(row.original)
                                                        setOpen('view')
                                                    }
                                                }
                                            }}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Aucune demande
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {/* Afficher la Pagination seulement si hideTools est false */}
            {!hideTools && <DataTablePagination table={table} />}
        </div>
    );
}
