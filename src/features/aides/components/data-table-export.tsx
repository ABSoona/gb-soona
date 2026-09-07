import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ArrowTopRightIcon } from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';
import { useState } from 'react';

interface DataTableExportProps<TData> {
  table: Table<TData>;
  // 🔥 Quand la pagination est pilotée par le serveur, `table` ne connaît que
  // la page courante. onExportAll (fourni par le parent) va chercher TOUTES
  // les lignes correspondant aux filtres actuels (sans pagination) pour
  // l'export, au lieu de se limiter aux lignes déjà chargées en mémoire.
  onExportAll?: () => Promise<TData[]>;
}

export function DataTableExport<TData>({ table, onExportAll }: DataTableExportProps<TData>) {
  const [isExporting, setIsExporting] = useState(false);

  const buildCsv = (rows: TData[]) => {
    const headers = table
      .getAllColumns()
      .filter((col) => col.getIsVisible() && col.id !== 'select' && col.id !== 'actions');

    return [
      headers.map((col) => col.id).join(','),
      ...rows.map((rawRow) =>
        headers
          .map((col) => {
            const value = col.accessorFn ? col.accessorFn(rawRow, 0) : (rawRow as any)[col.id];
            return JSON.stringify(value ?? '');
          })
          .join(',')
      ),
    ].join('\n');
  };

  const downloadCsv = (csvContent: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'export_aides.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = async () => {
    if (onExportAll) {
      try {
        setIsExporting(true);
        const rows = await onExportAll();
        if (rows.length === 0) {
          toast({ title: 'Aucune donnée à exporter (avec les filtres actuels).' });
          return;
        }
        downloadCsv(buildCsv(rows));
      } catch (err) {
        toast({ title: "Erreur lors de l'export", variant: 'destructive' });
      } finally {
        setIsExporting(false);
      }
      return;
    }

    // Fallback : pas de fetch serveur fourni, on exporte les lignes déjà en mémoire.
    const rows = table.getFilteredRowModel().rows.map((r) => r.original);
    if (rows.length === 0) {
      toast({ title: 'Aucune donnée à exporter.' });
      return;
    }
    downloadCsv(buildCsv(rows));
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="ml-auto hidden h-8 lg:flex items-center justify-center"
      onClick={exportToCSV}
      disabled={isExporting}
    >
      <ArrowTopRightIcon className="h-4 w-4" />
    </Button>
  );
}
