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
    // Seuls les versements versés figurent dans l'export comptable (le back
    // ignore les autres) : sans ce filtre, une sélection "A verser" ou une
    // période à venir aboutissait à un 404 affiché "Ressource non trouvée".
    const versementIds = table
      .getFilteredRowModel()
      .rows.map((row) => row.original as unknown as Versement)
      .filter((versement) => versement.status === 'Verse')
      .map((versement) => versement.id);

    if (versementIds.length === 0) {
      toast({
        title: 'Aucun versement versé à exporter',
        description:
          "L'export comptable ne contient que les versements au statut « Versé ». Vérifiez les filtres actifs (statut, période, trésorier).",
        variant: 'destructive',
      });
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
