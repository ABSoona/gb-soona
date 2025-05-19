// useDocumentActions.ts
import { useDocumentService } from '@/api/document/documentService';
import { toast } from '@/hooks/use-toast';
import { number } from 'zod';

type WhereClause = {
  contact?: { id: number };
  demande?: { id: number };
  aide?: {id: number};
  versements? :{id:number} // versements mal nommé dans l'api il doit ^tre versement (sans s)
};

export function useDocumentActions(where: WhereClause) {
  const { createAndUploadDocument, deleteDocument, refetchDocuments } = useDocumentService({ where });

  const handleFileUpload = async (contactId: number,  file: File, typeId: number, demandeId?: number,aideId?:number,versementId?:number,visiteId?:number) => {
    try {
      await createAndUploadDocument(contactId, file, typeId, demandeId,aideId,versementId,visiteId);
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
