// useDocumentActions.ts
import { toast } from '@/hooks/use-toast';
import { useDocumentService } from '@/api/document/documentService';

type WhereClause = {
  contact?: { id: number };
  demande?: { id: number };
};

export function useDocumentActions(where: WhereClause) {
  const { createAndUploadDocument, deleteDocument, refetchDocuments } = useDocumentService({ where });

  const handleFileUpload = async (contactId: number, file: File, typeId: number, demandeId?: number) => {
    try {
      await createAndUploadDocument(contactId, file, typeId, demandeId);
      await refetchDocuments(); // 👈 bien sur les bons documents
      toast({ title: 'Document ajouté avec succès' });
    } catch (error) {
      toast({ title: "Erreur lors de l'upload", variant: 'destructive' });
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      await deleteDocument(docId);
      await refetchDocuments(); // 👈 aussi ici
      toast({ title: 'Document supprimé avec succès' });
    } catch (error) {
      toast({ title: 'Erreur lors de la suppression', variant: 'destructive' });
    }
  };

  return {
    handleFileUpload,
    handleDelete,
  };
}
