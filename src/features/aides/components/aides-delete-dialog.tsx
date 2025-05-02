import { useAideService } from '@/api/aide/aideService';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Aide } from '@/model/aide/Aide';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useAides } from '../context/aides-context';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: Aide;
}

export function AidesDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const queryClient = useQueryClient();
  const { deleteAide, isSubmitting } = useAideService(); // ✅ Utilisation du service
  const [value, setValue] = useState<number | ''>('');
  const { triggerRefetchAides } = useAides();

  const handleDelete = async () => {
    if (value !== currentRow.montant) {
      toast({ title: 'ID incorrect !', variant: 'destructive' });
      return;
    }

    try {
      await deleteAide(currentRow.id);
      triggerRefetchAides();
      queryClient.invalidateQueries({ queryKey: ['aides'] });
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
      disabled={value !== currentRow.montant || isSubmitting}
      title={
        <span className='text-destructive'>
          <IconAlertTriangle className='mr-1 inline-block' size={18} />
          Supprimer la aide
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p>
            Êtes-vous sûr de vouloir supprimer l'aide de {' '}
            <span className='font-bold'>{currentRow.montant.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}</span> ? Cette action est
            irréversible.
          </p>

          <Label>
            Confirmez en tapant le montant de l'aide :
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))} // ✅ Gestion du champ vide
              placeholder='Entrez le N° pour confirmer la suppression'
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Avertissement !</AlertTitle>
            <AlertDescription>
              Une fois supprimée, cette aide ne pourra pas être restaurée.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={isSubmitting ? 'Suppression...' : 'Supprimer'}
      destructive
    />
  );
}
