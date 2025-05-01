'use client';

import { z } from 'zod';
import { useForm, useWatch } from 'react-hook-form';
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
import { Aide, aideSchema } from '@/model/aide/Aide';
import { useAideService } from '@/api/aide/aideService';
import { toast } from '@/hooks/use-toast';
import { handleServerError } from '@/utils/handle-server-error';
import { ContactSearchCombobox } from './contact-search';
import { Input } from '@/components/ui/input';
import { aideCredieteurTypes, aideFrquenceTypes, typeAideTypes } from '../data/data';
import { DatePicker } from '@/components/ui/date-picker';
import { Switch } from '@/components/ui/switch';
import { addDays, addMonths, addWeeks } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { useAides } from '../context/aides-context';
import { useEffect, useMemo } from 'react';
import { useDemandeService } from '@/api/demande/demandeService';
import { Demande } from '@/model/demande/Demande';


// 📌 Schéma de validation du formulaire avec Zod
const formSchema = aideSchema.omit({ id: true, contact: true, demande: true,status:true }).extend({ contactId: z.any(), demandeId: z.any() });

type AideForm = z.infer<typeof formSchema>;


interface Props {
  currentRow?: Aide;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showContactSearch?: boolean;
  showDemandeSearch?: boolean;
  forContactId?: number;
  forDemandeId?: number;
}


export function AidesActionDialog({ currentRow, open, onOpenChange, showContactSearch = true, showDemandeSearch = true, forContactId, forDemandeId }: Props) {


  
  const { createAide, updateAide, refetch, isSubmitting } = useAideService();

  const isEdit = !!currentRow;
  const { triggerRefetchAides } = useAides();
  const defaultFormValues: AideForm = isEdit && currentRow
  ? {
      contactId: currentRow.contact?.id || '',
      typeField: currentRow.typeField,
      montant: Number(currentRow.montant),
      dateAide: new Date(currentRow.dateAide),
      dateExpiration: currentRow.dateExpiration ? new Date(currentRow.dateExpiration) : undefined,
      frequence: currentRow.frequence,
      suspendue: currentRow.suspendue ?? false,
      nombreVersements: currentRow.nombreVersements ?? 2,
      crediteur: currentRow.crediteur ?? 'LeBNFiciaire',
      infosCrediteur: currentRow.infosCrediteur ?? '',
      remarque: currentRow.remarque ?? '',
      demandeId: currentRow.demande?.id?.toString() ?? '',
      reetudier: currentRow.reetudier ?? false,
    }
  : {
      contactId: forContactId ?? '',
      typeField: 'FinanciRe',
      montant: 0,
      dateAide: new Date(),
      dateExpiration: addMonths(new Date(), 1),
      frequence: 'UneFois',
      suspendue: false,
      nombreVersements: 2,
      crediteur: 'LeBNFiciaire',
      infosCrediteur: '',
      remarque: '',
      demandeId: forDemandeId?.toString() ?? '',
      reetudier: false,
    };
    const form = useForm<AideForm>({
      resolver: zodResolver(formSchema),
      defaultValues: defaultFormValues,
    });
    
  const selectedContactId = useWatch({
    control: form.control,
    name: 'contactId',
  });
  
  const { demandes } = useDemandeService(
    selectedContactId
      ? { where: { contact: { id: Number(selectedContactId) } } }
      : { where: { id: { equals: 0 } } } // requête vide
  );
  useEffect(() => {
    if (!selectedContactId && form.getValues('demandeId') !== '') {
      form.setValue('demandeId', '');
    }
  }, [selectedContactId, form]);
  
  const onSubmit = async (values: AideForm) => {
    console.log(form.formState.errors);
    const contactId = forContactId ?? values.contactId; // priorité au forContactId
    const demandeId = forDemandeId ?? values.demandeId;
    const aidePayload = {
      contact: { id: Number(contactId) },
      typeField: values.typeField,
      montant: Number(values.montant),
      dateAide: values.dateAide,
      dateExpiration:   values.dateExpiration ,
      // paiementRecurrent: values.paiementRecurrent,
      frequence: values.frequence,
      suspendue: values.suspendue,
      nombreVersements: (paiementRecurrent == 'UneFois' ? 1 : Number(values.nombreVersements)),
      crediteur: values.crediteur,
      infosCrediteur: values.infosCrediteur,
      remarque: values.remarque,
      demande: { id: Number(demandeId) },
      reetudier : values.reetudier,
      status:"EnCours"
    };

    try {
      if (isEdit && currentRow?.id) {
        await updateAide(currentRow.id, aidePayload);
        toast({ title: 'Aide mise à jour avec succès !' });
      } else {
        await createAide(aidePayload);
        toast({ title: 'Nouvelle aide créée avec succès !' });
      }
      triggerRefetchAides();
      form.reset();
      onOpenChange(false);


    } catch (error) {
      console.error('❌ Erreur lors de la soumission :', error);
      handleServerError(error);
    }
  };
  const paiementRecurrent = form.watch("frequence");
  const typeAide = useWatch({ control: form.control, name: 'typeField' });
  const crediteur = useWatch({ control: form.control, name: 'crediteur' });
  const reetudier =  useWatch({ control: form.control, name: 'reetudier' });
  function calculerDateDernierVersement(dateAide: Date, frequence: string, nombreVersements: number): Date | null {
    if (!dateAide || !frequence || !nombreVersements) return null;
    switch (frequence) {
      case 'Hebdomadaire':
        return addWeeks(dateAide, nombreVersements - 1);
      case 'BiMensuelle':
        return addWeeks(dateAide, (nombreVersements - 1) * 2);
      case 'Mensuelle':
        return addMonths(dateAide, nombreVersements - 1);
      case 'Trimestrielle':
        return addMonths(dateAide, (nombreVersements - 1) * 3);
      case 'UneFois':
        return dateAide;
      default:
        return null;
    }
  }
  const dateAide = useWatch({ control: form.control, name: 'dateAide' });
const frequence = useWatch({ control: form.control, name: 'frequence' });
const nombreVersements = useWatch({ control: form.control, name: 'nombreVersements' });

useEffect(() => {
  if (isEdit) return; // ✅ NE RIEN FAIRE si on édite une aide existante

  const nb = Number(nombreVersements || 1);

  if (typeAide === 'AssistanceAdministrative') {
    form.setValue('dateExpiration', addMonths(dateAide, 3));
  } else if (frequence === 'UneFois') {
    form.setValue('dateExpiration', addDays(dateAide, 27));
  } else {
    const newDateExpiration = calculerDateDernierVersement(dateAide, frequence, nb);
    if (newDateExpiration) {
      form.setValue('dateExpiration', newDateExpiration);
    }
  }
}, [dateAide, frequence, nombreVersements, typeAide, isEdit]);
    
const dernierVersement = calculerDateDernierVersement(dateAide, frequence, Number(nombreVersements || 1));
  return (
    <Sheet
      open={open}
      onOpenChange={(state) => {
        onOpenChange(state);
    
        if (state) {
          form.reset(defaultFormValues);
        }
      }}
    >
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-left">
          <SheetTitle>{isEdit ? 'Modifier l\'Aide' : 'Ajouter une Aide'}</SheetTitle>
          <SheetDescription>
            {isEdit ? 'Mettez à jour l\'aide ici.' : 'Créez une nouvelle aide ici.'} Cliquez sur "Enregistrer" lorsque vous avez terminé .
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-full w-full py-1 pr-4">
          <Form {...form}>
            <form id="aide-form" onSubmit={(e) => {
              console.log(form.formState.errors);
              form.handleSubmit(onSubmit)(e);
              console.log("✅ handleSubmit exécuté !");
            }}
              className="space-y-4 p-0.5">
              {showContactSearch && <FormField
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
              />}
              {showDemandeSearch && <FormField
                control={form.control}
                name="demandeId"
                render={({ field }) => {
                  
                  return(<FormItem className="space-y-1">
                    <FormLabel>Pour la demande</FormLabel>
                    <FormControl>
                      <SelectDropdown
                        placeholder="Choisissez une demande"
                        value={typeof field.value === 'number' ? field.value.toString() : field.value ?? ''}
                        onValueChange={field.onChange}
                        isControlled={true}
                        items={demandes.map((e: Demande) => ({
                          value: e.id.toString(),
                          label: `Demande N° ${e.id} du ${new Date(e.createdAt).toLocaleDateString('fr-FR')}`,
                        }))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>)
                }}
              />}
              <FormField control={form.control} name="typeField" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <SelectDropdown defaultValue={field.value} onValueChange={field.onChange} items={[...typeAideTypes]} />
                  <FormMessage />
                </FormItem>
              )} />
              {typeAide === "FinanciRe" &&
                <FormField control={form.control} name="montant" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Monta,t Dans le signe € '
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />}
              {typeAide === "FinanciRe" &&
                <FormField control={form.control} name="frequence" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fréquence</FormLabel>
                    <SelectDropdown defaultValue={field.value} onValueChange={field.onChange} items={[...aideFrquenceTypes]} />
                    <FormMessage />
                  </FormItem>
                )} />}

              <FormField control={form.control} name="dateAide" render={({ field }) => (
                <FormItem>
                  <FormLabel>   {typeAide === "FinanciRe" ? (paiementRecurrent == "UneFois" ? 'Date du versement' : 'Date du 1er versement') : 'Date de début'}</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value}
                      onDateChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
             
              {typeAide === "FinanciRe" &&
                <FormField control={form.control} name="crediteur" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Créditeur</FormLabel>
                    <SelectDropdown defaultValue={field.value} onValueChange={field.onChange} items={[...aideCredieteurTypes]} />
                    <FormMessage />
                  </FormItem>
                )} />}
              {crediteur == 'UnCrAncier' && typeAide === "FinanciRe" && <FormField control={form.control} name="infosCrediteur" render={({ field }) => (
                <FormItem>
                  <FormLabel>Détails sur le créditeur</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Organisme, Raison sociale...'
                      className='col-span-4'
                      autoComplete='off'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />}
              {paiementRecurrent !== "UneFois" && typeAide === "FinanciRe" && (
                <FormField control={form.control} name="nombreVersements" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de versements</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}

                      />
                    </FormControl>
                    <FormLabel>
                      Dernier versement le {dernierVersement?.toLocaleDateString('fr-FR') ?? ''}

                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )} />
              )}


               { <FormField 
                control={form.control}
                name="reetudier"
                
                render={({ field }) => (
                  <FormItem className="grid grid-cols-[auto_1fr] items-center gap-2">
                      
                    <FormControl>
                      <Switch 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm leading-none" >Réétudier la demande</FormLabel>
                 
                    <FormMessage />
                  </FormItem>
                )}
              /> }
               {(typeAide === 'AssistanceAdministrative' || ( typeAide === 'FinanciRe' && reetudier)) &&
                <FormField control={form.control} name="dateExpiration" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de réexamen</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        onDateChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
               }

              <FormField control={form.control} name="remarque" render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      className='col-span-4'
                      autoComplete='off'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              {paiementRecurrent !== "UneFois" && (<FormField
                control={form.control}
                name="suspendue"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-[auto_1fr] items-center gap-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm leading-none">Suspendue</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              )}



            </form>
          </Form>
        </ScrollArea>
        <SheetFooter>
          <Button type="submit" form="aide-form" disabled={isSubmitting}>{isSubmitting ? 'En cours...' : 'Enregistrer'}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
