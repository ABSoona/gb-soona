import { toast } from '@/hooks/use-toast';
import { handleServerError } from '@/utils/handle-server-error';
import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import { CREATE_AIDE, DELETE_AIDE, GET_AIDES, UPDATE_AIDE } from './graphql/queries';

export function useAideService(variables?: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_AIDES, {
    variables,
    fetchPolicy: 'network-only',
    onCompleted: (newData) => {
      console.log("✅ Aides chargées :", newData);
    }
  });

  const [createAideMutation] = useMutation(CREATE_AIDE);
  const [updateAideMutation] = useMutation(UPDATE_AIDE);
  const [deleteAideMutation] = useMutation(DELETE_AIDE);

  const createAide = async (data: any) => {
    try {
      setIsSubmitting(true);
      await createAideMutation({ variables: { data } });
      await refetch();
      toast({ title: 'Aide créée avec succès.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateAide = async (id: number, data: any) => {
    if (!id) {
      toast({ title: 'Erreur', description: 'ID de l\'aide requis.', variant: 'destructive' });
      return false;
    }
    try {
      setIsSubmitting(true);
      await updateAideMutation({ variables: { id, data } });
      await refetch();
      toast({ title: 'Aide mise à jour.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAide = async (id: number) => {
    if (!id) {
      toast({ title: 'Erreur', description: 'ID de l\'aide requis.', variant: 'destructive' });
      return false;
    }
    try {
      setIsSubmitting(true);
      await deleteAideMutation({ variables: { id } });
      await refetch();
      toast({ title: 'Aide supprimée.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    aides: data?.aides || [],
    loading,
    error,
    refetch,
    createAide,
    updateAide,
    deleteAide,
    isSubmitting, // ✅ centralisé
  };
}
export function useAideMutations() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createAideMutation] = useMutation(CREATE_AIDE);
  const [updateAideMutation] = useMutation(UPDATE_AIDE);
  const [deleteAideMutation] = useMutation(DELETE_AIDE);

  const createAide = async (data: any) => {
    try {
      setIsSubmitting(true);
      await createAideMutation({ variables: { data } });
      toast({ title: 'Aide créé avec succès.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateAide = async (id: number, data: any) => {
    try {
      setIsSubmitting(true);
      await updateAideMutation({ variables: { id, data } });
      toast({ title: 'Aide mis à jour.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAide = async (id: number) => {
    try {
      setIsSubmitting(true);
      await deleteAideMutation({ variables: { id } });
      toast({ title: 'Aide supprimé.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    createAide,
    updateAide,
    deleteAide,
  };
}