'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SelectDropdown } from '@/components/select-dropdown';
import { Demande } from '@/model/demande/Demande';
import { useDemandeService } from '@/api/demande/demandeService';
import { toast } from '@/hooks/use-toast';
import { handleServerError } from '@/utils/handle-server-error';
import { Textarea } from '@/components/ui/textarea';
import { ContactSearchCombobox } from './contact-search';

// 📌 Schéma de validation du formulaire avec Zod
const formSchema = z.object({
  contactId: z.any(), // Contact ID en string
  status: z.enum(['recue', 'en_commision', 'clôturée', 'refusée', 'en_visite']),
  remarques: z.string().optional(),
});

type DemandeForm = z.infer<typeof formSchema>;

interface Props {
  currentRow?: Demande;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DemandesActionDialog({ currentRow, open, onOpenChange }: Props) {
  const { createDemande, updateDemande, refetch, creating, updating } = useDemandeService();

  const isEdit = !!currentRow;
  const form = useForm<DemandeForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          contactId: currentRow?.contact?.nom || '',
          status: currentRow?.status || 'recue',
          remarques: currentRow?.remarques || '',
        }
      : {
          contactId: '',
          status: 'recue',
          remarques: '',
        },
  });

  const onSubmit = async (values: DemandeForm) => {
    const demandePayload = {
      contact: { id: Number(values.contactId) }, // Utilisation du contact ID sélectionné
      status: values.status,
      remarques: values.remarques,
    };

    try {
      if (isEdit && currentRow?.id) {
        await updateDemande(currentRow.id, demandePayload);
        toast({ title: 'Demande mise à jour avec succès !' });
      } else {
        await createDemande(demandePayload);
        toast({ title: 'Nouvelle demande créée avec succès !' });
      }

    //  refetch?.();
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('❌ Erreur lors de la soumission :', error);
      handleServerError(error);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(state) => {
        form.reset();
        onOpenChange(state);
      }}
    >
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-left">
          <SheetTitle>{isEdit ? 'Modifier la Demande' : 'Ajouter une Demande'}</SheetTitle>
          <SheetDescription>
            {isEdit ? 'Mettez à jour la demande ici.' : 'Créez une nouvelle demande ici.'} Cliquez sur "Enregistrer" lorsque vous avez terminé.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-full w-full py-1 pr-4">
          <Form {...form}>
            <form id="demande-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-0.5">
              
            <FormField
                control={form.control}
                name="contactId"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Contact</FormLabel>
                    <FormControl>
                      <ContactSearchCombobox
                        onSelect={(contactId) => {
                          console.log('🔄 Nouveau contact sélectionné :', contactId); // ✅ Vérification
                          field.onChange(contactId); // ✅ Met à jour correctement `form`
                        }}
                        defaultContact={
                          isEdit && currentRow?.contact
                            ? { id: currentRow.contact.id, nom: currentRow.contact.nom ,prenom: currentRow.contact.prenom }
                            : undefined
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 📌 Sélecteur de statut */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Statut</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Choisissez un statut"
                      className="col-span-4"
                      items={[
                        { label: 'Reçue', value: 'recue' },
                        { label: 'En commission', value: 'en_commision' },
                        { label: 'Clôturée', value: 'clôturée' },
                        { label: 'Refusée', value: 'refusée' },
                        { label: 'En visite', value: 'en_visite' },
                      ]}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 📌 Champ Remarques */}
              <FormField
                control={form.control}
                name="remarques"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Remarques</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ajoutez une remarque" className="col-span-4 min-h-[150px]" autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollArea>
        <SheetFooter>
          <Button type="submit" form="demande-form" disabled={creating || updating}>
            {creating || updating ? 'En cours...' : 'Enregistrer'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
