
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Visite } from '@/model/visite/Visite';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useVisites } from '../context/visites-context';
import { useVisiteService } from '@/api/visite/invitationService';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: Visite;
}

export function VisitesDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const queryClient = useQueryClient();
  const { deleteVisite, isSubmitting } = useVisiteService(); // ✅ Utilisation du service
  const [value, setValue] = useState<number | ''>('');
  const { triggerRefetchVisites } = useVisites();

  const handleDelete = async () => {
    if (value !== currentRow.id) {
      toast({ title: 'ID incorrect !', variant: 'destructive' });
      return;
    }

    try {
      await deleteVisite(currentRow.id);
      triggerRefetchVisites();
      queryClient.invalidateQueries({ queryKey: ['visites'] });
      onOpenChange(false);
    } catch (error) {
      console.error('❌ Erreur de suppression:', error);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value !== currentRow.id || isSubmitting}
      title={
        <span className='text-destructive'>
          <IconAlertTriangle className='mr-1 inline-block' size={18} />
          Supprimer la visite
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p>
            Êtes-vous sûr de vouloir supprimer l'visite de {' '}
            <span className='font-bold'>{currentRow.id}</span> ? Cette action est
            irréversible.
          </p>

          <Label>
            Confirmez en tapant le numero de visite :
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))} // ✅ Gestion du champ vide
              placeholder='Entrez le N° pour confirmer la suppression'
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Avertissement !</AlertTitle>
            <AlertDescription>
              Une fois supprimée, cette visite ne pourra pas être restaurée.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={isSubmitting ? 'Suppression...' : 'Supprimer'}
      destructive
    />
  );
}
