import {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getFacetedUniqueValues,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { WebsiteDemande } from '@/model/website-demandes/website-demandes.ts';
import { useWebsiteDemandes } from '../context/website-demandes-context';
import { DataTablePagination } from './data-table-pagination';
import { DataTableToolbar } from './data-table-toolbar';
import { useState } from 'react';

interface Props {
  columns: ColumnDef<WebsiteDemande>[];
  data: WebsiteDemande[];
  hideTools?: boolean;
  hideActions?: boolean;
}

export function WebsiteDemandeTable({ columns, data, hideTools = false, hideActions = false }: Props) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([ { id: 'status', value: ['EnErreur']}]);

//  const { setOpenDemande: setOpen, setCurrentRow } = useWebsiteDemandes();
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(

    {
                
         id: false,
         adresseDemandeur:false,
         codePostalDemandeur:false,
         villeDemandeur:false,
         situationProfessionnelle:false,
         situationFamiliale:false,
         situationProConjoint:false,
         updatedAt:false,
         status:false
       
        
     }
   
);
  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      sorting,
      columnFilters,
      columnVisibility
    },
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
    initialState: {
      columnFilters: [
        {
          id: 'status',
          value: ['EnErreur'],
        },
      ],
    },
  });

 
  return (
    <div className="space-y-4">
      {!hideTools && <DataTableToolbar table={table} />}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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

      {!hideTools && <DataTablePagination table={table} />}
    </div>
  );
}
