import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Check, Paperclip } from 'lucide-react';
import { Row } from '@tanstack/react-table';
import { Versement } from '@/model/versement/versement';
import { useDocumentActions } from '@/features/documents/useDocumentActions';
import { useTypeDocumentService } from '@/api/typeDocument/typeDocumentService';
import { TypeDocument } from '@/model/typeDocument/typeDocument';
import { useVersementMutations, useVersementService } from '@/api/versement/versementService';
import { useApolloClient } from '@apollo/client';
import { getVersementsByAideId } from '@/api/versement/versementService'; // à créer comme décrit
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

interface DataTableRowActionsProps {
  row: Row<Versement>;
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [autresVersements, setAutresVersements] = useState<Versement[]>([]);

  const { handleFileUpload } = useDocumentActions({ versements: { id: row.original.id } });
  const { updateVersement } = useVersementMutations();
  const { typeDocuments = [] }: { typeDocuments: TypeDocument[] } = useTypeDocumentService({
    where: { internalCode: { equals: 'preuve_virement' } }
  });

  const client = useApolloClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || typeDocuments.length === 0) return;

    const versement = row.original;
    const aideId = versement.aide.id;

    // 1. Upload pour le versement actuel
    await handleFileUpload(versement.aide.contact.id, file, typeDocuments[0].id, 0, 0, versement.id);
    await updateVersement(versement.id, { status: 'Verse' });

    // 2. Si récurrent, demander confirmation pour les autres
    if (versement.aide.frequence !== 'UneFois') {
      const allVersements = await getVersementsByAideId(client, aideId);
      const autres = allVersements.filter((v:Versement) => v.id !== versement.id);
      setAutresVersements(autres);
      setPendingFile(file);
      setShowDialog(true);
    }
  };

  const confirmApplyToAll = async () => {
    const contactId = row.original.aide.contact.id;
    for (const v of autresVersements) {
      await handleFileUpload(contactId, pendingFile!, typeDocuments[0].id, 0, 0, v.id);
      //await updateVersement(v.id, { status: 'Verse' });
    }
    setShowDialog(false);
    setPendingFile(null);
  };

  const updateStatus = async () => {
    await updateVersement(row.original.id, { status: 'Verse' });
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[320px]">
          <DropdownMenuItem onClick={() => inputRef.current?.click()}>
            {!row.original.document ? "Attacher la preuve" : "Remplacer la preuve"}
            <DropdownMenuShortcut>
              <Paperclip size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={updateStatus}>
            Marquer comme versé
            <DropdownMenuShortcut>
              <Check size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* ✅ Boîte de confirmation */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Attacher la preuve aux autres versements ?</AlertDialogTitle>
          </AlertDialogHeader>
          <p>Souhaitez-vous également attacher cette preuve aux {autresVersements.length} autres versements de cette aide ?</p>
          <AlertDialogFooter>
            <AlertDialogCancel>Non</AlertDialogCancel>
            <AlertDialogAction onClick={confirmApplyToAll}>Oui</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
