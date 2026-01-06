import { useAideService } from '@/api/aide/aideService';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Aide } from '@/model/aide/Aide';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useAides } from '../context/aides-context';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: Aide;
}

function parseAmount(input: string): number {
  // Autorise "12", "12.", "12.5", "12,5", " 12 345,67 "
  const cleaned = input
    .replace(/\s/g, '') // enlève les espaces
    .replace(',', '.'); // virgule -> point

  // États intermédiaires qu'on considère comme "pas encore un nombre"
  if (cleaned === '' || cleaned === '.' || cleaned === '-' || cleaned === '-.') {
    return NaN;
  }

  return Number(cleaned);
}

function equalsMoney(a: number, b: number): boolean {
  // comparaison au centime (évite les soucis de float)
  return Math.round(a * 100) === Math.round(b * 100);
}

export function AidesDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const queryClient = useQueryClient();
  const { deleteAide, isSubmitting } = useAideService();
  const { triggerRefetchAides } = useAides();

  // ✅ On stocke la saisie en string (sinon le "." / "12." saute)
  const [value, setValue] = useState<string>('');

  const parsedValue = useMemo(() => parseAmount(value), [value]);

  const isValid = useMemo(() => {
    if (Number.isNaN(parsedValue)) return false;
    const montant = currentRow.montant ?? NaN;
    if (Number.isNaN(montant)) return false;
    return equalsMoney(parsedValue, montant);
  }, [parsedValue, currentRow.montant]);

  const handleDelete = async () => {
    if (!isValid) {
      toast({ title: 'Montant incorrect !', variant: 'destructive' });
      return;
    }

    try {
      await deleteAide(currentRow.id);
      triggerRefetchAides();
      queryClient.invalidateQueries({ queryKey: ['aides'] });
      onOpenChange(false);
      setValue('');
    } catch (error) {
      console.error('❌ Erreur de suppression:', error);
      toast({ title: 'Erreur lors de la suppression', variant: 'destructive' });
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setValue('');
      }}
      handleConfirm={handleDelete}
      disabled={!isValid || isSubmitting}
      title={
        <span className="text-destructive">
          <IconAlertTriangle className="mr-1 inline-block" size={18} />
          Supprimer la aide
        </span>
      }
      desc={
        <div className="space-y-4">
          <p>
            Êtes-vous sûr de vouloir supprimer l'aide de{' '}
            <span className="font-bold">
              {Number(currentRow.montant ?? 0).toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
              })}
            </span>{' '}
            ? Cette action est irréversible.
          </p>

          <Label>
            Confirmez en tapant le montant de l'aide :
            <Input
              // ✅ Important: ne pas utiliser Number() ici
              // ✅ inputMode aide sur mobile à avoir le clavier décimal
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Entrez le montant pour confirmer la suppression"
            />
          </Label>

          <Alert variant="destructive">
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
