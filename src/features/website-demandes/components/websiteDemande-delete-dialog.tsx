import { useWebsiteDemandeService } from '@/api/website-demande/websiteDemandeService';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { WebsiteDemande } from '@/model/website-demandes/website-demandes.ts';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useWebsiteDemandes } from '../context/website-demandes-context';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: WebsiteDemande;
}

export function WebsiteDemandeDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const queryClient = useQueryClient();
  const { deleteWebsiteDemande, isSubmitting } = useWebsiteDemandeService();
  const [value, setValue] = useState('');
  const { triggerRefetchWebsiteDemandes } = useWebsiteDemandes();

  const handleDelete = async () => {
    if (value !== currentRow.nomDemandeur) {
      toast({ title: 'Nom incorrect !', variant: 'destructive' });
      return;
    }

    try {
      await deleteWebsiteDemande(currentRow.id);
      triggerRefetchWebsiteDemandes();
      queryClient.invalidateQueries({ queryKey: ['websiteDemandes'] });
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
      disabled={value !== currentRow.nomDemandeur || isSubmitting}
      title={
        <span className="text-destructive">
          <IconAlertTriangle className="mr-1 inline-block" size={18} />
          Supprimer la demande
        </span>
      }
      desc={
        <div className="space-y-4">
          <p>
            Êtes-vous sûr de vouloir supprimer la demande de{' '}
            <span className="font-bold">{currentRow.nomDemandeur}</span> ? Cette action est
            irréversible.
          </p>

          <Label>
            Confirmez en tapant le nom du demandeur :
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Entrez le nom pour confirmer la suppression"
            />
          </Label>

          <Alert variant="destructive">
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
