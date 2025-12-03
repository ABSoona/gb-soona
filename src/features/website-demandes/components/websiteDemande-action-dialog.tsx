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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { ContactSearchCombobox } from '@/features/aides/components/contact-search';
import { toast } from '@/hooks/use-toast';
import { WebsiteDemande, websiteDemandeSchema } from '@/model/website-demandes/website-demandes.ts';
import { handleServerError } from '@/utils/handle-server-error';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
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
        forceNewContact: false,
        modeBeneficiaire: "nouveau",

      },
  });

  const contactId = form.watch("contactId");
  const mode = form.watch("modeBeneficiaire");
  useEffect(() => {
    if (mode === "nouveau") {
      form.setValue("contactId", undefined);   // ou "" selon ton schéma
    }
  }, [mode, form]);

  const onSubmit = async (values: WebsiteDemandeForm) => {
    try {
      console.log('mise jour')
      const { modeBeneficiaire, ...rest } = values;

      const payload = {
        ...rest,
        forceNewContact: modeBeneficiaire === "nouveau",
      };
      if (isEdit && currentRow?.id) {
        await updateWebsiteDemande(currentRow.id, payload);
        toast({ title: 'Demande mise à jour avec succès !' });
      } else {
        await createWebsiteDemande(payload);
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

  const renderField = <T extends keyof WebsiteDemandeForm>(
    name: T extends any ? (WebsiteDemandeForm[T] extends boolean ? never : T) : never,
    label: string,
    type: string = "text",
    disabled : boolean = false
  ) => (
    <FormField
      control={form.control}
      name={name as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
          <Input disabled={disabled}
            type={type}
            {...field}
            onChange={(e) => {
              if (type === "number") {
                field.onChange(e.target.value === "" ? undefined : Number(e.target.value));
              } else {
                field.onChange(e.target.value);
              }
            }}
          />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const renderSwitch = (name: keyof WebsiteDemandeForm, label: string ,disabled : boolean=false) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <FormLabel>{label}</FormLabel>
          </div>
          <FormControl>
          <Switch disabled={disabled}
  checked={!!field.value}
  onCheckedChange={field.onChange}
/>
          </FormControl>
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
       <FormField
  control={form.control}
  name="modeBeneficiaire"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Choix du bénéficiaire</FormLabel>
      <FormControl>
        <RadioGroup defaultValue='nouveau'
          value={field.value}
          onValueChange={field.onChange}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="nouveau" id="nouveau" />
            <Label htmlFor="nouveau">Créer un nouveau bénéficiaire</Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="existant" id="existant" />
            <Label htmlFor="existant">Associer à un bénéficiaire existant</Label>
          </div>
        </RadioGroup>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
              {mode === "existant" && (<FormField
                              control={form.control}
                              name="contactId"
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  <FormLabel>Remplacer le bébéficiaire par</FormLabel>
                                  <FormControl>
                                    <ContactSearchCombobox 
                                      onSelect={(contactId) => {
                                        console.log('🔄 Nouveau contact sélectionné :', contactId); // ✅ Vérification
                                        field.onChange(contactId); // ✅ Met à jour correctement `form`
                                      }}
                                    
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />)}
            
              {renderField('nomDemandeur', 'Nom',"text",contactId!=null)}
              {renderField('prenomDemandeur', 'Prénom',"text",contactId!=null)}
              
              {renderField('telephoneDemandeur', 'Téléphone',"text",contactId!=null)}
              {renderField('emailDemandeur', 'Email',"text",contactId!=null)}
              {renderField('adresseDemandeur', 'Adresse',"text",contactId!=null)}
              {renderField('codePostalDemandeur', 'Code postal', 'number',contactId!=null)}
              {renderField('villeDemandeur', 'Ville',"text",contactId!=null)}
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
              {renderField('status', 'Etat')}
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