'use client';

import { useWebsiteDemandeService } from '@/api/website-demande/websiteDemandeService';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { toast } from '@/hooks/use-toast';
import { WebsiteDemande, websiteDemandeSchema } from '@/model/website-demandes/website-demandes.ts';
import { handleServerError } from '@/utils/handle-server-error';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = websiteDemandeSchema.omit({ id: true, updatedAt: true, createdAt: true });
type WebsiteDemandeForm = z.infer<typeof formSchema>;

interface Props {
  currentRow?: WebsiteDemande;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WebsiteDemandeActionDialog({ currentRow, open, onOpenChange }: Props) {
  const { createWebsiteDemande, updateWebsiteDemande, isSubmitting, refetch } = useWebsiteDemandeService();
  const isEdit = !!currentRow;

  const form = useForm<WebsiteDemandeForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? (() => {
        const { createdAt, updatedAt, ...rest } = currentRow;
        return rest;
      })()
      : {
        nomDemandeur: '',
        prenomDemandeur: '',
        ageDemandeur: 0,
        telephoneDemandeur: '',
        emailDemandeur: '',
        adresseDemandeur: '',
        codePostalDemandeur: 0,
        villeDemandeur: '',
        situationProfessionnelle: '',
        situationFamiliale: '',
        revenus: 0,
        revenusConjoint: 0,
        nombreEnfants: 0,
        agesEnfants: '',
        situationProConjoint: '',
        autresAides: '',
        autresCharges: 0,
        apl: 0,
        dettes: 0,
        natureDettes: '',
        facturesEnergie: 0,
        remarques: '',
        status: 'EnCours',

      },
  });

  const onSubmit = async (values: WebsiteDemandeForm) => {
    try {
      console.log('mise jour')
      if (isEdit && currentRow?.id) {
        await updateWebsiteDemande(currentRow.id, values);
        toast({ title: 'Demande mise à jour avec succès !' });
      } else {
        await createWebsiteDemande(values);
        toast({ title: 'Nouvelle demande créée avec succès !' });
      }
      await refetch();
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('❌ Erreur lors de la soumission :', error);
      handleServerError(error);
    }
  };

  const renderField = (name: keyof WebsiteDemandeForm, label: string, type: string = 'text') => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input type={type} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

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
          <SheetTitle>{isEdit ? 'Modifier la demande' : 'Ajouter une demande'}</SheetTitle>
          <SheetDescription>
            {isEdit ? 'Mettez à jour la demande.' : 'Créez une nouvelle demande.'}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-full w-full py-1 pr-4">
          <Form {...form}>
            <form
              id="website-demande-form"
              onSubmit={(e) => {
                console.log(form.formState.errors);
                form.handleSubmit(onSubmit)(e);
                console.log("✅ handleSubmit exécuté !");
              }}
              className="space-y-4 p-0.5"
            >
              {renderField('nomDemandeur', 'Nom')}
              {renderField('prenomDemandeur', 'Prénom')}
              {renderField('ageDemandeur', 'Âge', 'number')}
              {renderField('telephoneDemandeur', 'Téléphone')}
              {renderField('emailDemandeur', 'Email')}
              {renderField('adresseDemandeur', 'Adresse')}
              {renderField('codePostalDemandeur', 'Code postal', 'number')}
              {renderField('villeDemandeur', 'Ville')}
              {renderField('situationProfessionnelle', 'Situation professionnelle')}
              {renderField('situationFamiliale', 'Situation familiale')}
              {renderField('revenus', 'Revenus', 'number')}
              {renderField('revenusConjoint', 'Revenus conjoint', 'number')}
              {renderField('nombreEnfants', 'Nombre d\'enfants', 'number')}
              {renderField('agesEnfants', 'Âges des enfants')}
              {renderField('situationProConjoint', 'Situation pro conjoint')}
              {renderField('autresAides', 'Autres aides')}
              {renderField('autresCharges', 'Autres charges', 'number')}
              {renderField('apl', 'APL', 'number')}
              {renderField('dettes', 'Dettes', 'number')}
              {renderField('natureDettes', 'Nature des dettes')}
              {renderField('facturesEnergie', 'Factures énergie', 'number')}
              {renderField('remarques', 'Remarques')}
              {renderField('status', 'Statut')}
            </form>
          </Form>
        </ScrollArea>
        <SheetFooter>
          <Button type="submit" form="website-demande-form" disabled={isSubmitting} >
            {isSubmitting ? 'En cours...' : 'Enregistrer'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}