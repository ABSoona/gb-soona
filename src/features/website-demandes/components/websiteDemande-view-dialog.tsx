'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WebsiteDemande } from '@/model/website-demandes/website-demandes.ts';
import { WebsiteDemandeView } from './websiteDemande-view';
import { useWebsiteDemandes } from '../context/website-demandes-context';

interface Props {
  currentRow?: WebsiteDemande;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WebsiteDemandeViewDialog({ currentRow, open, onOpenChange }: Props) {
  const { setOpenDemande: setOpen, setCurrentRow } = useWebsiteDemandes();

  if (!currentRow) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Détails de la demande</SheetTitle>
          <SheetDescription>
            Visualisez les informations de la demande ci-dessous.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="mt-4">
          <WebsiteDemandeView currentRow={currentRow} />
        </ScrollArea>

        <SheetFooter className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          <Button
            onClick={() => {
              setCurrentRow(currentRow);
              setOpen('edit');
            }}
          >
            Modifier la demande
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
