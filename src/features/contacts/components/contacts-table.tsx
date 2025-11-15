import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Contact } from '@/model/contact/Contact';
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
import { DataTablePagination } from './data-table-pagination';
import { DataTableToolbar } from './data-table-toolbar';

declare module '@tanstack/react-table' {
    interface ColumnMeta<TData extends RowData, TValue> {
        className: string;
    }
}

interface DataTableProps {
    columns: ColumnDef<Contact>[];
    data: Contact[];
    hideTools?: boolean;
}

export function ContactsTable({ columns, data, hideTools = false }: DataTableProps) {
    const [rowSelection, setRowSelection] = useState({});
    const navigate = useNavigate();
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        !hideTools
            ? {
                contactId: false,
                contactAge: false,
                agesEnfants: false,
                nombreEnfants: false,
                autresAides: false,
                facturesEnergie: false,
                loyer: false,
                contactNom: false,
                contactPrenom: false,
                remarques: false,
                revenusConjoint: false,
                id: false,
                search: false
            }
            : {
                contactId: false,
                contactAge: false,
                agesEnfants: false,
                nombreEnfants: false,
                autresAides: false,
                facturesEnergie: false,
                loyer: false,
                contactNom: false,
                contactPrenom: false,
                remarques: false,
                resteAVivre: false,
                revenusConjoint: false,
                id: false,
                age: false,
                dettes: false,
                numBeneficiaire: false,
                revenus: false,
                situationFamiliale: false,
                situationProfessionnelle: false,
                updatedAt: false,
                numeroContact: false,
                charges: false,
                aides: false,
            }
    );

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = useState<SortingState>([]);

    // 🔥 Utilisation du filtre par période
    const [dateRange] = useState<DateRange | undefined>();

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


    //  const { setOpen, setCurrentRow } = useContacts();

    return (
        <div className="space-y-4">
            {/* 🔥 Passer `setDateRange` à `DataTableToolbar` */}
            <DataTableToolbar table={table} />

            <div className="rounded-md border">
                <Table className='text-xs'>
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
                                                    navigate({ to: `/contacts/$id`, params: { id: row.original.id.toString() } })
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
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {/* Afficher la Pagination seulement si hideTools est false */}
            <DataTablePagination table={table} />
        </div>
    );
}
