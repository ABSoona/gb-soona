import { Button } from '@/components/ui/button';
import { ArrowTopRightIcon } from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';

interface DataTableExportProps<TData> {
  table: Table<TData>;
}

export function DataTableExport<TData>({ table }: DataTableExportProps<TData>) {

  // Fonction d'export en CSV
  const exportToCSV = () => {
    const rows = table.getFilteredRowModel().rows; // Récupérer les lignes affichées
    if (rows.length === 0) {
      alert("Aucune donnée à exporter !");
      return;
    }

    const headers = table.getAllColumns()
      .filter(col => col.getIsVisible) // Filtrer les colonnes affichables
      .map(col => col.id); // Récupérer les noms des colonnes

    const csvContent = [
      headers.join(','), // Ajouter les en-têtes
      ...rows.map(row =>
        headers.map(header => JSON.stringify(row.getValue(header) ?? '')).join(',')
      ) // Ajouter les données des lignes
    ].join('\n');

    // Créer un objet Blob pour le téléchargement
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'export_aides.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="ml-auto hidden h-8 lg:flex"
      onClick={exportToCSV}
    >
      <ArrowTopRightIcon className="mr-2 h-4 w-4" />
      Exporter
    </Button>
  );
}
