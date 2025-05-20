import { uploadClient } from '@/lib/apollo-upload-client';
import axiosInstance from '@/lib/axtios-instance';
import { Document } from '@/model/document/Document';
import { useMutation, useQuery } from '@apollo/client';
import { saveAs } from 'file-saver';
import { CREATE_DOCUMENT, DELETE_DOCUMENT, GET_DOCUMENTS, UPDATE_DOCUMENT, UPLOAD_CONTENU } from './queries';
import { toast } from '@/hooks/use-toast';
import { handleServerError } from '@/utils/handle-server-error';

export async function downloadDocument(docId: string, filename: string) {
  try {
    const response = await axiosInstance.get(`/documents/${docId}/contenu`, {
      responseType: 'blob',
    });

    const safeFilename = filename
      .replace(/[^a-zA-Z0-9.-]/g, '-')
      .replace(/-+/g, '-');

    // ✅ Téléchargement propre avec file-saver
    saveAs(response.data, safeFilename);
  } catch (error) {
    console.error('Erreur lors du téléchargement du document :', error);
  }
}

export async function previewDocument(doc: Document) {
  const response = await axiosInstance.get(`/documents/${doc.id}/contenu`, {
    responseType: 'blob',
  });

  const blob = response.data;
  const ext = doc.contenu.filename.split('.').pop()?.toLowerCase();
  const supported = ['pdf', 'png', 'jpg', 'jpeg'];

  return {
    url: URL.createObjectURL(blob),
    type: supported.includes(ext || '') ? ext : 'unsupported',
    mimeType: blob.type,
  };
}


export function useDocumentService(variables?: any) {
  const [createDocument] = useMutation(CREATE_DOCUMENT);
  const [uploadContenu] = useMutation(UPLOAD_CONTENU, { client: uploadClient });
  const [deleteDocumentMutation] = useMutation(DELETE_DOCUMENT);
  const [updateDocumentMutation] = useMutation(UPDATE_DOCUMENT);

  const { data, refetch } = useQuery(GET_DOCUMENTS, {

    variables: variables || {},
    fetchPolicy: 'network-only',
    onCompleted: (newData) => {
      console.log("✅ DEMANDES chargées :", newData);
    }
  });

  const createAndUploadDocument = async (contactId: number, file: File, typeId: number, demandeId?: number,aideId?: number,versementId?:number,visiteId?:number) => {
    let documentId: string | null = null;

    try {
      const extension = file.name.split('.').pop();
      const basename = file.name.split('.').slice(0, -1).join('.');

      // Nettoyage du nom
      const safeName = basename
        .replace(/[^a-zA-Z0-9.-]/g, '-')
        .replace(/-+/g, '-') + '.' + extension;

      // On recrée le fichier avec le nom modifié
      const renamedFile = new File([file], safeName, { type: file.type });

      // Crée le document vide (contenu JSON par défaut)
      const { data: createRes } = await createDocument({
        variables: {
          data: {
            contact: contactId && contactId!=0 ? { id: contactId } : null,
            contenu: "{}",
            demande: demandeId ? { id: demandeId } : null,
            typeDocument: { id: typeId },
            aide:aideId?{id:aideId}:null,
            versements: versementId?{ id: versementId }:null,
            name:versementId?"Preuve de virement":(visiteId?"Rapport de visite":"Nouveau document"),
            visites :visiteId?{id:visiteId}:null,
          },
        },
      });

      documentId = createRes?.createDocument?.id;
      if (!documentId) throw new Error("Document ID non récupéré");

      // Upload du fichier renommé
      const { data: uploadRes } = await uploadContenu({
        variables: {
          file: renamedFile,
          where: { id: documentId },
        },
      });

      await refetch();
      return uploadRes?.uploadContenu;
    } catch (error) {
      handleServerError(error);
     
      if (documentId) {
        await deleteDocumentMutation({
          variables: { where: { id: documentId } },
        });
        await refetch();
      }
      throw error;
    }
  };

  const updateDocument = async (id: string, data: any) => {
    if (!id) {
      toast({
        title: 'Erreur',
        description: 'ID du document requis.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { id: _, ...updateData } = data;
      await updateDocumentMutation({ variables: { id, data: updateData } });
      await refetch();
      return data?.updateDocument;
    } catch (error) {
     handleServerError(error);
     throw error;    } 
  };

  

  const deleteDocument = async (documentId: string) => {
    try {
      const { data } = await deleteDocumentMutation({
        variables: {
          where: { id: documentId },
        },
      });
      await refetch();
      return data?.deleteDocument;
    } catch (error) {
      console.error("Erreur dans deleteDocument", error);
      throw error;
    }
  };

  return {
    documents: data?.documents || [],
    createAndUploadDocument,
    deleteDocument,
    updateDocument,
    refetchDocuments: refetch,
  };
}
