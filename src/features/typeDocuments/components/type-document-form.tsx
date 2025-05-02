'use client';

import { useTypeDocumentService } from '@/api/typeDocument/typeDocumentService';
import { SelectDropdown } from '@/components/select-dropdown';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { TypeDocument } from '@/model/typeDocument/typeDocument';
import { zodResolver } from '@hookform/resolvers/zod';
import { DotsHorizontalIcon, LockClosedIcon } from '@radix-ui/react-icons';
import { IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { typesDocuments } from '../data/data';

const formSchema = z.object({
  labels: z.record(z.string()),
  rattachements: z.record(z.union([z.literal('Contact'), z.literal('Demande'), z.literal('Suivi')])),
});
type TypeDocumentFormValues = z.infer<typeof formSchema>;

type Props = {
  typeDocuments: TypeDocument[];
};

export function TypeDocumentForm({ typeDocuments }: Props) {
  const {
    updateTypeDocument,
    deleteTypeDocument,
    loading,
  } = useTypeDocumentService();

  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);

  const form = useForm<TypeDocumentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      labels: {},
      rattachements: {},
    },
  });

  useEffect(() => {
    if (typeDocuments.length > 0) {
      const labels: Record<string, string> = {};
      const rattachements: Record<string, 'Contact' | 'Demande' | 'Suivi'> = {};

      typeDocuments.forEach((doc: TypeDocument) => {
        const id = doc.id.toString();
        labels[id] = doc.label;
        rattachements[id] = doc.rattachement;
      });

      form.reset({ labels, rattachements });
    }
  }, [typeDocuments, form]);

  async function onSubmit(data: TypeDocumentFormValues) {
    try {
      const ops = typeDocuments.map(async (doc) => {
        const id = doc.id;
        const label = data.labels[id];
        const rattachement = data.rattachements[id];


        return updateTypeDocument(id, { label, rattachement });
      });

      await Promise.all(ops);
      toast({ title: 'Types de documents mis à jour avec succès.' });
    } catch (error) {
      console.error('Erreur de mise à jour :', error);
      toast({ title: 'Erreur lors de la mise à jour.', variant: 'destructive' });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="max-w-2xl space-y-4">
          {typeDocuments.map((doc: TypeDocument) => (
            <FormItem
              key={doc.id}
              className="flex flex-row items-center justify-between rounded-lg border p-4"
            >
              <div className="space-y-0.5 flex items-center gap-2">
                <FormField
                  control={form.control}
                  name={`labels.${doc.id}`}
                  render={({ field }) =>
                    editingLabelId === doc.id.toString() ? (
                      <input
                        type="text"
                        autoFocus
                        className="text-base font-medium border rounded px-2 py-1"
                        {...field}
                        onBlur={() => setEditingLabelId(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setEditingLabelId(null);
                          }
                        }}
                      />
                    ) : (
                      <FormLabel
                        className={`first-letter:uppercase text-base font-medium ${doc.isInternal ? 'text-muted-foreground cursor-not-allowed' : 'cursor-pointer'}`}
                        onClick={() => {
                          if (!doc.isInternal) setEditingLabelId(doc.id.toString());
                        }}
                      >
                        {field.value}
                      </FormLabel>
                    )
                  }
                />
                {doc.isInternal && <LockClosedIcon className="text-muted-foreground" />}
              </div>

              <div className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name={`rattachements.${doc.id}`}
                  render={({ field }) => (
                    <FormControl>
                      <SelectDropdown
                        value={field.value}
                        onValueChange={(val) => {
                          if (doc.isInternal) return;
                          if (val === 'Contact' || val === 'Demande' || val === 'Suivi') {
                            form.setValue(`rattachements.${doc.id}`, val);
                          }
                        }}
                        placeholder="Rattachement"
                        className={`w-[140px] ${doc.isInternal ? 'opacity-50 pointer-events-none' : ''}`}
                        items={[...typesDocuments]}
                        isControlled
                      />
                    </FormControl>
                  )}
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`h-8 w-8 p-0 ${doc.isInternal ? 'opacity-50 pointer-events-none' : 'data-[state=open]:bg-muted'}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DotsHorizontalIcon className="h-4 w-4" />
                      <span className="sr-only">Ouvrir le menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[160px]">
                    {!doc.isInternal && (
                      <DropdownMenuItem
                        onClick={async () => {
                          await deleteTypeDocument(doc.id);
                          toast({ title: `Type "${doc.label}" supprimé.` });
                        }}
                        className="!text-red-500"
                      >
                        Supprimer
                        <DropdownMenuShortcut>
                          <IconTrash size={16} />
                        </DropdownMenuShortcut>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </FormItem>
          ))}

          <Button type="submit" disabled={loading}>
            Mettre à jour
          </Button>
        </div>
      </form>
    </Form>
  );
}
