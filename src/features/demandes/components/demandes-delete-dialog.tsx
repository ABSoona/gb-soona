import { useDemandeService } from '@/api/demande/demandeService';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Demande } from '@/model/demande/Demande';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useDemandes } from '../context/demandes-context';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: Demande;
  refetch: () => void;
}

export function DemandesDeleteDialog({ open, onOpenChange, currentRow ,refetch}: Props) {
  const queryClient = useQueryClient();
  const { deleteDemande, isSubmitting } = useDemandeService(); // ✅ Utilisation du service
  const [value, setValue] = useState<number | ''>('');

  const handleDelete = async () => {
    if (value !== currentRow.id) {
      toast({ title: 'ID incorrect !', variant: 'destructive' });
      return;
    }

    try {
      await deleteDemande(currentRow.id);
      await refetch();
      queryClient.invalidateQueries({ queryKey: ['demandes'] });
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
          Supprimer la demande
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p>
            Êtes-vous sûr de vouloir supprimer la demande N°{' '}
            <span className='font-bold'>{currentRow.id}</span> ? Cette action est
            irréversible.
          </p>

          <Label>
            Confirmez en tapant le N° de demande :
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))} // ✅ Gestion du champ vide
              placeholder='Entrez le N° pour confirmer la suppression'
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Avertissement !</AlertTitle>
            <AlertDescription>
              Une fois supprimée, cette demande ne pourra pas être restaurée.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={isSubmitting ? 'Suppression...' : 'Supprimer'}
      destructive
    />
  );
}
