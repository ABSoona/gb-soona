'use client';

import { useDemandeService } from '@/api/demande/demandeService';
import { SelectDropdown } from '@/components/select-dropdown';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Demande, demandeSchema, situationFamilleTypes, situationTypes } from '@/model/demande/Demande';
import { handleServerError } from '@/utils/handle-server-error';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useDemandes } from '../context/demandes-context';
import { categorieTypes, demandeStatusTypes } from '../data/data';
import { ContactSearchCombobox } from './contact-search';
import { useUserServicev2 } from '@/api/user/userService.v2';
import { User } from '@/model/user/User';


// 📌 Schéma de validation du formulaire avec Zod
const formSchema = demandeSchema
  .omit({ id: true, contact: true, createdAt: true, demandeActivities: true,acteur :true,proprietaire:true }) // Supprime les champs "id" et "contact"
  .extend({ contactId: z.any(), acteurId: z.any()}) 
  .superRefine((data, ctx) => {
    if (data.situationFamiliale === 'marié') {
      if (!data.situationProConjoint) {
        ctx.addIssue({
          path: ['situationProConjoint'],
          code: z.ZodIssueCode.custom,
          message: 'Champ requis si la personne est mariée',
        });
      }
      if (data.revenusConjoint === undefined || isNaN(data.revenusConjoint)) {
        ctx.addIssue({
          path: ['revenusConjoint'],
          code: z.ZodIssueCode.custom,
          message: 'Champ requis si la personne est mariée',
        });
      }
    }
  }); // Ajoute "contactId"
  

type DemandeForm = z.infer<typeof formSchema>;

interface Props {
  currentRow?: Demande;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refetch: () => void;


}

export function DemandesActionDialog({ currentRow, open, onOpenChange,refetch }: Props) {


  
  const { users } = useUserServicev2(
     { where: { role: { not: "visiteur" } } } 
  );

  const isEdit = !!currentRow;
  const whereClause = isEdit ? {where:{id : {equals:currentRow.id}}}:{where:{id:{equals:0}}} 
  const { createDemande, updateDemande,  isSubmitting } = useDemandeService();
  const form = useForm<DemandeForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
    ? {
        contactId: currentRow?.contact?.id ?? '',
        status: currentRow?.status ?? 'recue',
        remarques: currentRow?.remarques ?? '',
        nombreEnfants: currentRow?.nombreEnfants ?? 0,
        agesEnfants: currentRow?.agesEnfants ?? '',
        situationFamiliale: currentRow?.situationFamiliale ?? undefined,
        situationProfessionnelle: currentRow?.situationProfessionnelle ?? undefined,
        situationProConjoint: currentRow?.situationProConjoint ?? undefined,
        revenus: currentRow?.revenus ?? 0,
        revenusConjoint: currentRow?.revenusConjoint ?? 0,
        loyer: currentRow?.loyer ?? 0,
        facturesEnergie: currentRow?.facturesEnergie ?? 0,
        dettes: currentRow?.dettes ?? 0,
        natureDettes: currentRow?.natureDettes ?? '',
        autresAides: currentRow?.autresAides ?? '',
        autresCharges: currentRow?.autresCharges ?? 0,
        apl: currentRow?.apl ?? 0,
        categorieDemandeur: currentRow?.categorieDemandeur ?? undefined,
        acteurId: currentRow?.acteur?.id ?? undefined,
      }
    : {
        contactId: '',
        status: 'recue',
        remarques: '',
        nombreEnfants: 0,
        agesEnfants: '',
        situationFamiliale: undefined,
        situationProfessionnelle: undefined,
        situationProConjoint: undefined,
        revenus: 0,
        revenusConjoint: 0,
        loyer: 0,
        facturesEnergie: 0,
        dettes: 0,
        natureDettes: '',
        autresAides: '',
        autresCharges: 0,
        apl: 0,
        categorieDemandeur: undefined,
        acteurId: undefined,
      }
  
  });
  const situationFamiliale = form.watch("situationFamiliale");
  const dettes = form.watch("dettes");
  const nombreEnfants = form.watch("nombreEnfants");
  const onSubmit = async (values: DemandeForm) => {
    console.log("erreur de validation: ");
    const demandePayload = {
      contact: { id: Number(values.contactId) }, // Utilisation du contact ID sélectionné
      acteur : {id : values.acteurId},
      status: values.status,
      remarques: values.remarques,
      revenus: Number(values.revenus),
      nombreEnfants: Number(values.nombreEnfants),
      agesEnfants: values.agesEnfants,
      situationFamiliale: values.situationFamiliale,
      situationProfessionnelle: values.situationProfessionnelle,
      situationProConjoint: values.situationProConjoint,
      revenusConjoint: Number(values.revenusConjoint),
      loyer: Number(values.loyer),
      facturesEnergie: (values.facturesEnergie),
      dettes: Number(values.dettes),
      natureDettes: values.natureDettes,
      autresAides: values.autresAides,
      autresCharges: Number(values.autresCharges),
      apl: Number(values.apl),
      categorieDemandeur: values.categorieDemandeur,
      proprietaire: !isEdit? {id : values.acteurId}:null,

    };

    try {
      if (isEdit && currentRow?.id) {
        await updateDemande(currentRow.id, demandePayload);
        
        toast({ title: 'Demande mise à jour avec succès !' });
      } else {
        console.log(demandePayload);
        await createDemande(demandePayload);
       
        toast({ title: 'Nouvelle demande créée avec succès !' });
      }
      onOpenChange(false);
      await refetch();
      form.reset();

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
            <form id="demande-form" onSubmit={(e) => {
              console.log(form.formState.errors);
              form.handleSubmit(onSubmit)(e);
              console.log("✅ handleSubmit exécuté !");
            }} className="space-y-4 p-0.5">

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
                            ? { id: currentRow.contact.id, nom: currentRow.contact.nom, prenom: currentRow.contact.prenom }
                            : undefined
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categorieDemandeur"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Catégorie du bénéficiaire</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value?.toString()}
                      onValueChange={field.onChange}
                      placeholder="Choisissez une categorie"
                      className="col-span-4"
                      items={[...categorieTypes]}

                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='nombreEnfants'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      Nombre d'enfants
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='de 1 à 20'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                        type='number'
                        onChange={(e) => {
                          const inputValue = parseInt(e.target.value, 10);
                          field.onChange(inputValue < 0 ? 0 : inputValue);
                        }}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}

              />
              {
                nombreEnfants > 0 && <FormField
                  control={form.control}
                  name='agesEnfants'
                  render={({ field }) => (
                    <FormItem className='space-y-1'>
                      <FormLabel>
                        Ages des enfants
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Ex : 9, 13 et 17 '
                          className='col-span-4'
                          autoComplete='off'
                          {...field}

                        />
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}

                />
              }
              <FormField
                control={form.control}
                name="situationFamiliale"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Situation matrimoniale</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Choisissez une situation"
                      className="col-span-4"
                      items={[...situationFamilleTypes]}

                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="situationProfessionnelle"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Situation professionnelle</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Choisissez une situation"
                      className="col-span-4"
                      items={[...situationTypes]}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              {situationFamiliale === "marié" && <FormField
                control={form.control}
                name="situationProConjoint"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Situation pro. Conjoint</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Choisissez une situation"
                      className="col-span-4"
                      items={[...situationTypes]}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />}


              <FormField
                control={form.control}
                name='revenus'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      Revenus  (€)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Sans centimes, sans singe €'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}


                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}

              />
              {situationFamiliale === "marié" && <FormField
                control={form.control}
                name='revenusConjoint'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      Revenus du conjoint  (€)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Sans centimes, sans singe €'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}

                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />}
              <FormField
                control={form.control}
                name='apl'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      APL  (€)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Sans centimes, sans singe €'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}

              />
              <FormField
                control={form.control}
                name='autresAides'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      Autres aides
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Association, Famille...'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}

              />
              <FormField
                control={form.control}
                name='loyer'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      Loyer mensuel (€)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Sans centimes, sans singe €'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}

              />
              <FormField
                control={form.control}
                name='facturesEnergie'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      Factures Energie (€)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Sans centimes, sans singe €'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}

              />
              <FormField
                control={form.control}
                name='autresCharges'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      Autres charges (€)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Sans centimes, sans singe €'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}

              />

              <FormField
                control={form.control}
                name='dettes'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      Dettes (€)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Sans centimes, sans singe €'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}

              />
              {dettes > 0 && <FormField
                control={form.control}
                name='natureDettes'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      Natures des dettes
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Retard de loyer, Amendes...'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}

              />}

              {/* 📌 Sélecteur de statut */}
              {isEdit && <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Etat</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Choisissez un statut"
                      className="col-span-4"
                      items={[...demandeStatusTypes]}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />}
               <FormField
                control={form.control}
                name="acteurId"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Attribuée à</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Choisissez un membre"
                      className="col-span-4"
      
                      items={users.map((user: User) => {
                        const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
                        const label = (
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-black text-xs text-center font-medium text-white flex items-center justify-center">
                              {initials}
                            </div>
                            <span>{user.firstName} {user.lastName}</span>
                          </div>
                        );
                      
                        return {
                          value: user.id.toString(),
                          label,
                        };
                      })}
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

          <Button type="submit" form="demande-form" disabled={isSubmitting}>
            {isSubmitting ? 'En cours...' : 'Enregistrer'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
