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
import { Aide, aideSchema, AideType } from '@/model/aide/Aide';
import { useAideService } from '@/api/aide/aideService';
import { toast } from '@/hooks/use-toast';
import { handleServerError } from '@/utils/handle-server-error';
import { ContactSearchCombobox } from './contact-search';
import { Input } from '@/components/ui/input';
import { aideCredieteurTypes, aideFrquenceTypes } from '../data/data';
import { DatePicker } from '@/components/ui/date-picker';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon } from 'lucide-react';
import { addMonths, addWeeks } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { useAides } from '../context/aides-context';


// 📌 Schéma de validation du formulaire avec Zod
const formSchema = aideSchema.omit({ id: true, contact: true }).extend({ contactId: z.any() });

type AideForm = z.infer<typeof formSchema>;


interface Props {
  currentRow?: Aide;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showContactSearch?: boolean;
  forContactId? : number
}


export function AidesActionDialog({ currentRow, open, onOpenChange, showContactSearch = true,forContactId }: Props) {
  const { createAide, updateAide, refetch, creating, updating } = useAideService();

  const isEdit = !!currentRow;
  const { triggerRefetchAides } = useAides();

  const form = useForm<AideForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
        contactId: currentRow?.contact?.id || '',
        typeField: currentRow?.typeField,
        montant: Number(currentRow?.montant) || 0,
        dateAide: new Date(currentRow.dateAide),
        dateExpiration: currentRow?.dateExpiration && new Date(currentRow?.dateExpiration),
        // paiementRecurrent: currentRow?.paiementRecurrent || false,
        frequence: currentRow?.frequence,
        suspendue: false,
        nombreVersements: Number(currentRow.nombreVersements) || 1,
        crediteur: currentRow.crediteur || 'LeBNFiciaire',
        infosCrediteur: currentRow.crediteur == 'UnCrAncier' ? currentRow.infosCrediteur : '',
        remarque: currentRow.remarque,
        

      }
      : {
        contactId: forContactId ?? '',
        typeField: 'FinanciRe',
        montant: 0,
        dateAide: new Date(Date.now()),
        dateExpiration: new Date(Date.now()),
        //  paiementRecurrent: false,
        frequence: 'UneFois',
        suspendue: false,
        nombreVersements: 1,
        crediteur: 'LeBNFiciaire',
        infosCrediteur: '',
        remarque: ''
      },
  });

  
  const onSubmit = async (values: AideForm) => {
    console.log(form.formState.errors);
    const contactId = forContactId ?? values.contactId; // priorité au forContactId
    const aidePayload = {
      contact: { id: Number(contactId) },
      typeField: values.typeField,
      montant: Number(values.montant),
      dateAide: values.dateAide,
      dateExpiration: values.dateExpiration || null,
      // paiementRecurrent: values.paiementRecurrent,
      frequence: values.frequence,
      suspendue: values.suspendue,
      nombreVersements: (paiementRecurrent == 'UneFois' ? 1 : Number(values.nombreVersements)),
      crediteur: values.crediteur,
      infosCrediteur: values.infosCrediteur,
      remarque: values.remarque
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
  const crediteur = form.watch("crediteur");

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
          <SheetTitle>{isEdit ? 'Modifier l\'Aide' : 'Ajouter une Aide'}</SheetTitle>
          <SheetDescription>
            {isEdit ? 'Mettez à jour l\'aide ici.' : 'Créez une nouvelle aide ici.'} Cliquez sur "Enregistrer" lorsque vous avez terminé.
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
              )} />
              <FormField control={form.control} name="frequence" render={({ field }) => (
                <FormItem>
                  <FormLabel>Fréquence</FormLabel>
                  <SelectDropdown defaultValue={field.value} onValueChange={field.onChange} items={[...aideFrquenceTypes]} />
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="dateAide" render={({ field }) => (
                <FormItem>
                  <FormLabel>   {paiementRecurrent == "UneFois" ? 'Date du versement' : 'Date du 1er versement'}</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value}
                      onDateChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="crediteur" render={({ field }) => (
                <FormItem>
                  <FormLabel>Créditeur</FormLabel>
                  <SelectDropdown defaultValue={field.value} onValueChange={field.onChange} items={[...aideCredieteurTypes]} />
                  <FormMessage />
                </FormItem>
              )} />

              {paiementRecurrent !== "UneFois" && (
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
                      Dernier versement le {
                        field.value && form.getValues('dateAide')
                          ? (() => {
                            const startDate = new Date(form.getValues('dateAide'));
                            const nbVersements = Number(field.value);

                            switch (form.getValues('frequence')) {
                              case 'Hebdomadaire':
                                return addWeeks(startDate, nbVersements - 1).toLocaleDateString('fr-FR');
                              case 'BiMensuelle':
                                return addWeeks(startDate, (nbVersements - 1) * 2).toLocaleDateString('fr-FR');
                              case 'Mensuelle':
                                return addMonths(startDate, nbVersements - 1).toLocaleDateString('fr-FR');
                              case 'Trimestrielle':
                                return addMonths(startDate, (nbVersements - 1) * 3).toLocaleDateString('fr-FR');
                              case 'UneFois':
                                return startDate.toLocaleDateString('fr-FR');
                              default:
                                return '';
                            }
                          })()
                          : ''
                      }
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
              {crediteur == 'UnCrAncier' && <FormField control={form.control} name="infosCrediteur" render={({ field }) => (
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

              {/* <FormField 
                control={form.control}
                name="paiementRecurrent"
                
                render={({ field }) => (
                  <FormItem className="grid grid-cols-[auto_1fr] items-center gap-2">
                      
                    <FormControl>
                      <Switch 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm leading-none" >Versement récurrent</FormLabel>
                 
                    <FormMessage />
                  </FormItem>
                )}
              /> */}


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
          <Button type="submit" form="aide-form" disabled={creating || updating}>{creating || updating ? 'En cours...' : 'Enregistrer'}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
