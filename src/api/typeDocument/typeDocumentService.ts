
import { toast } from '@/hooks/use-toast';
import { handleServerError } from '@/utils/handle-server-error';
import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import {
  CREATE_TYPE_DOCUMENT,
  DELETE_TYPE_DOCUMENT,
  GET_TYPE_DOCUMENTS,
  UPDATE_TYPE_DOCUMENT,
} from './graphql/queries';

export function useTypeDocumentService(variables?: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_TYPE_DOCUMENTS, {
    variables,
    fetchPolicy: 'network-only',
    onCompleted: (newData) => {
      console.log('✅ TypeDocuments chargés :', newData);
    },
  });

  const [createTypeDocumentMutation] = useMutation(CREATE_TYPE_DOCUMENT);
  const [updateTypeDocumentMutation] = useMutation(UPDATE_TYPE_DOCUMENT);
  const [deleteTypeDocumentMutation] = useMutation(DELETE_TYPE_DOCUMENT);

  const createTypeDocument = async (data: any) => {
    try {
      setIsSubmitting(true);
      await createTypeDocumentMutation({ variables: { data } });
      await refetch();
      toast({ title: 'TypeDocument créé avec succès.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateTypeDocument = async (id: number, data: any) => {
    if (!id) {
      toast({ title: 'Erreur', description: 'ID requis.', variant: 'destructive' });
      return false;
    }
    try {
      setIsSubmitting(true);
      await updateTypeDocumentMutation({ variables: { id, data } });
      await refetch();
      toast({ title: 'TypeDocument mis à jour.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTypeDocument = async (id: number) => {
    if (!id) {
      toast({ title: 'Erreur', description: 'ID requis.', variant: 'destructive' });
      return false;
    }
    try {
      setIsSubmitting(true);
      await deleteTypeDocumentMutation({ variables: { id } });
      await refetch();
      toast({ title: 'TypeDocument supprimé.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    typeDocuments: data?.typeDocuments || [],
    loading,
    error,
    refetch,
    createTypeDocument,
    updateTypeDocument,
    deleteTypeDocument,
    isSubmitting,
  };
}
