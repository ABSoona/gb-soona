import { Button } from '@/components/ui/button';
import { ArrowTopRightIcon } from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';

interface DataTableExportProps<TData> {
  table: Table<TData>;
}

export function DataTableExport<TData>({ table }: DataTableExportProps<TData>) {

  // Fonction d'export en CSV
  const exportToCSV = () => {
    const rows = table.getFilteredRowModel().rows; // ✅ toutes les lignes, pas juste celles de la page visible
  
    if (rows.length === 0) {
      alert("Aucune donnée à exporter !");
      return;
    }
  
    const headers = table.getAllColumns()
      .filter(col => col.getIsVisible?.()) // ✅ appeler la fonction pour vérifier la visibilité
      .map(col => col.id);
  
    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        headers.map(header => JSON.stringify(row.getValue(header) ?? '')).join(',')
      )
    ].join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'export_visites.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
        variant="outline"
        size="sm"
        className="ml-auto hidden h-8 lg:flex items-center justify-center"
        onClick={exportToCSV}
      >
        <ArrowTopRightIcon className="h-4 w-4" />
      </Button>
  );
}
