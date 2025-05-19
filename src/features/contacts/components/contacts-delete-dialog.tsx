import { useContactService } from '@/api/contact/contact-service';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Contact } from '@/model/contact/Contact';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: Contact;
}

export function ContactsDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const queryClient = useQueryClient();
  const { deleteContact, isSubmitting } = useContactService(); // ✅ Utilisation du service
  const [value, setValue] = useState<number | ''>('');

  const handleDelete = async () => {
    if (value !== currentRow.id) {
      toast({ title: 'ID incorrect !', variant: 'destructive' });
      return;
    }

    try {
      await deleteContact(currentRow.id);
     // queryClient.invalidateQueries({ queryKey: ['contacts'] });
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
          Supprimer la contact
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p>
            Êtes-vous sûr de vouloir supprimer la contact N°{' '}
            <span className='font-bold'>{currentRow.id}</span> ? Cette action est
            irréversible.
          </p>

          <Label>
            Confirmez en tapant le N° de bénéficiaire :
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))} // ✅ Gestion du champ vide
              placeholder='Entrez le N° pour confirmer la suppression'
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Avertissement !</AlertTitle>
            <AlertDescription>
              Une fois supprimée, cette contact ne pourra pas être restaurée.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={isSubmitting ? 'Suppression...' : 'Supprimer'}
      destructive
    />
  );
}
