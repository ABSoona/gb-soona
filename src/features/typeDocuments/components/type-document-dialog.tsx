'use client';

import { useTypeDocumentService } from '@/api/typeDocument/typeDocumentService';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { toast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { typesDocuments } from '../data/data';

const formSchema = z.object({
  label: z.string().min(2, { message: 'Le nom est requis' }),
  rattachement: z.enum(['Contact', 'Demande', 'Suivi','Aide']),
});

type TypeDocumentForm = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TypeDocumentDialog({ open, onOpenChange }: Props) {
  const { createTypeDocument, isSubmitting } = useTypeDocumentService();

  const form = useForm<TypeDocumentForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: '',
      rattachement: 'Contact',
    },
  });

  const onSubmit = async (values: TypeDocumentForm) => {
    try {
      await createTypeDocument({
        ...values,
        isInternal: false,
      });
      toast({ title: 'Type de document créé avec succès !' });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur création typeDocument', error);
      toast({ title: 'Erreur lors de la création', variant: 'destructive' });
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
          <SheetTitle>Ajouter un type de document</SheetTitle>
          <SheetDescription>
            Définissez le nom et l’entité à laquelle ce type est rattaché.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id="typedocument-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4 flex-1"
          >
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Quitance de loyer, Pièce d'identité..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rattachement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rattachement</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    items={[...typesDocuments]}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <SheetFooter>
          <Button
            type="submit"
            form="typedocument-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Création...' : 'Créer'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
