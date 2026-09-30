import { useState } from 'react';
import { saveAs } from 'file-saver';
import { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import axiosInstance from '@/lib/axtios-instance';
import { FileArchive } from 'lucide-react';
import { Versement } from '@/model/versement/versement';

interface Props<TData> {
  table: Table<TData>;
}

export function ExportCacButton<TData>({ table }: Props<TData>) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    const versementIds = table
      .getFilteredRowModel()
      .rows.map((row) => (row.original as unknown as Versement).id);

    if (versementIds.length === 0) {
      toast({ title: 'Aucun versement à exporter pour ces filtres', variant: 'destructive' });
      return;
    }

    setIsExporting(true);
    try {
      const response = await axiosInstance.post(
        '/versements/export-cac',
        { versementIds },
        { responseType: 'blob' }
      );
      const today = new Date().toLocaleDateString('fr-FR').replace(/\//g, '-');
      saveAs(response.data as Blob, `export-comptable-${today}.zip`);
    } catch (_error) {
      // L'intercepteur axios affiche déjà un toast d'erreur.
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8"
      onClick={handleExport}
      disabled={isExporting}
    >
      <FileArchive className="h-4 w-4" />
      {isExporting ? 'Export en cours...' : 'Export comptable'}
    </Button>
  );
}
