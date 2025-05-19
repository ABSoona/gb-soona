import { toast } from '@/hooks/use-toast';
import { handleServerError } from '@/utils/handle-server-error';
import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import { CREATE_VERSEMENT, DELETE_VERSEMENT, GET_VERSEMENTS, UPDATE_VERSEMENT } from './graphql/queries';

export function useVersementService(variables?: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_VERSEMENTS, {
    variables,
    fetchPolicy: 'network-only',
    onCompleted: (newData) => {
      console.log("✅ Versements chargées :", newData);
    }
  });

  const [createVersementMutation] = useMutation(CREATE_VERSEMENT);
  const [updateVersementMutation] = useMutation(UPDATE_VERSEMENT);
  const [deleteVersementMutation] = useMutation(DELETE_VERSEMENT);

  const createVersement = async (data: any) => {
    try {
      setIsSubmitting(true);
      await createVersementMutation({ variables: { data } });
      await refetch();
      toast({ title: 'Versement créée avec succès.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateVersement = async (id: number, data: any) => {
    if (!id) {
      toast({ title: 'Erreur', description: 'ID du versement requis.', variant: 'destructive' });
      return false;
    }
    try {
      setIsSubmitting(true);
      await updateVersementMutation({ variables: { id, data } });
      await refetch();
      toast({ title: 'Versement mise à jour.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteVersement = async (id: number) => {
    if (!id) {
      toast({ title: 'Erreur', description: 'ID du versement requis.', variant: 'destructive' });
      return false;
    }
    try {
      setIsSubmitting(true);
      await deleteVersementMutation({ variables: { id } });
      await refetch();
      toast({ title: 'Versement supprimée.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    versements: data?.versements || [],
    loading,
    error,
    refetch,
    createVersement,
    updateVersement,
    deleteVersement,
    isSubmitting, // ✅ centralisé
  };
}
