'use client';

import { useContactService } from '@/api/contact/contact-service';
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
import { Contact, contactSchema } from '@/model/contact/Contact';
import { handleServerError } from '@/utils/handle-server-error';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { contactStatusTypes } from '../data/data';
import { DatePicker } from '@/components/ui/date-picker';


// 📌 Schéma de validation du formulaire avec Zod
const formSchema = contactSchema
  .omit({ id: true, aides: true, demandes: true, createdAt: true, updatedAt: true }); // Supprime les champs "id" et "contact"  // Ajoute "contactId"

type ContactForm = z.infer<typeof formSchema>;

interface Props {
  currentRow?: Contact;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactsActionDialog({ currentRow, open, onOpenChange }: Props) {


 

  const isEdit = !!currentRow;
  const whereClause = isEdit ? {where:{id:{equals:currentRow.id}}}:{};
  const { createContact, updateContact, refetch, isSubmitting } = useContactService(whereClause);
  const form = useForm<ContactForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
        nom: currentRow?.nom || '',
        prenom: currentRow?.prenom || '',
        status: currentRow?.status || { value: 'active' },
        remarques: currentRow?.remarques || '',
        age: Number(currentRow?.age),
        telephone: currentRow?.telephone,
        email: currentRow?.email || '',
        ville: currentRow?.ville,
        codePostal: currentRow?.codePostal,
        adresse: currentRow?.adresse,
        dateNaissance: currentRow?.dateNaissance
  ? new Date(currentRow.dateNaissance)
  : undefined


      }
      : {
        nom: '',
        prenom: '',
        status: 'active',
        remarques: '',
        telephone: '',
        email: '',
        ville: '',
        codePostal: 78000,
        adresse: '',
        age: 0,

      },
  });

  const onSubmit = async (values: ContactForm) => {
    console.log("erreur de validation: ");
    const contactPayload = {

      status: values.status,
      remarques: values.remarques,
      nom: values.nom,
      prenom: values.prenom,
      dateNaissance : values.dateNaissance,
      email: values.email,
      telephone: values.telephone,
      ville: values.ville,
      adresse: values.adresse,
      codePostal: Number(values.codePostal),
      age: Number(values.age),



    };

    try {
      if (isEdit && currentRow?.id) {
        await updateContact(currentRow.id, contactPayload);
        toast({ title: 'Contact mise à jour avec succès !' });
      } else {
        console.log(contactPayload);
        await createContact(contactPayload);
        toast({ title: 'Nouveau bénéficiaire créée avec succès !' });
      }

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('❌ Erreur lors de la soumission :', error);
      handleServerError(error);
    }
  };

  return (

    <Sheet
    /*modal={false}*/
      open={open}
      onOpenChange={(state) => {
        form.reset();
        onOpenChange(state);
      }}
    >
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-left">
          <SheetTitle>{isEdit ? 'Modifier le Contact N° ' + currentRow?.id : 'Ajouter un bénéficiaire'}</SheetTitle>
          <SheetDescription>
            {isEdit ? 'Mettez à jour la contact ici.' : 'Créez un nouveau bénéficiaire ici.'} Cliquez sur "Enregistrer" lorsque vous avez terminé.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-full w-full py-1 pr-4">
          <Form {...form}>
            <form id="contact-form" onSubmit={(e) => {
              console.log(form.formState.errors);
              form.handleSubmit(onSubmit)(e);
              console.log("✅ handleSubmit exécuté !");
            }} className="space-y-4 p-0.5">


              <FormField
                control={form.control}
                name='nom'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      Nom
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Nom du contact'
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
                name='prenom'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      Prenom
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Prénom du contact'
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
                name='dateNaissance'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      Date de naissance
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                     
                                           date={field.value}
                                           onDateChange={field.onChange}
                                         />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}

              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Email du contact'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                        type='email'

                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}

              />
              <FormField
                control={form.control}
                name='telephone'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      Téléphone
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ex: +33608744378'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                        type='phone'

                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}

              />
              <FormField
                control={form.control}
                name='adresse'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      Adresse
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Numéro et rue'
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
                name='ville'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      Ville
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ville'
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
                name='codePostal'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      Code Postal
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ex : 78180'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}

                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
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
                      items={[...contactStatusTypes]}
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

          <Button type="submit" form="contact-form" disabled={isSubmitting}>
            {isSubmitting ? 'En cours...' : 'Enregistrer'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
