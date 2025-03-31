import { uploadClient } from '@/lib/apollo-upload-client';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_DOCUMENT, UPLOAD_CONTENU, DELETE_DOCUMENT, GET_DOCUMENTS } from './queries';
import axiosInstance from '@/lib/axtios-instance';
import { toast } from '@/hooks/use-toast';
import { saveAs } from 'file-saver';

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

export async function previewDocument(doc: { id: string; contenu: { filename: string } }) {
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


export function useDocumentService(contactId?: number) {
  const [createDocument] = useMutation(CREATE_DOCUMENT);
  const [uploadContenu] = useMutation(UPLOAD_CONTENU, { client: uploadClient });
  const [deleteDocumentMutation] = useMutation(DELETE_DOCUMENT);
  
  const { data, refetch } = useQuery(GET_DOCUMENTS, {
    skip: !contactId,
    variables: {
      where: { contact: { id:  contactId }  },
    },
  });

  const createAndUploadDocument = async (contactId: number, file: File) => {
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
            contact: { id: contactId },
            contenu: "{}",
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
      console.error("Erreur dans createAndUploadDocument", error);
      if (documentId) {
        await deleteDocumentMutation({
          variables: { where: { id: documentId } },
        });
        await refetch();
      }
      throw error;
    }
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
    refetchDocuments: refetch,
  };
}
