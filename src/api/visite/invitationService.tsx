import { toast } from '@/hooks/use-toast';
import { handleServerError } from '@/utils/handle-server-error';
import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import { CREATE_VISITE, DELETE_VISITE, GET_VISITES, UPDATE_VISITE } from './graphql/queries';

export function useVisiteService(variables?: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_VISITES, {
    variables,
    fetchPolicy: 'network-only',
    onCompleted: (newData) => {
      console.log("✅ Visites chargées :", newData);
    }
  });

  const [createVisiteMutation] = useMutation(CREATE_VISITE);
  const [updateVisiteMutation] = useMutation(UPDATE_VISITE);
  const [deleteVisiteMutation] = useMutation(DELETE_VISITE);

  const createVisite = async (data: any) => {
    try {
      setIsSubmitting(true);
      await createVisiteMutation({ variables: { data } });
      await refetch();
      toast({ title: 'Visite créée avec succès.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateVisite = async (id: number, data: any) => {
    if (!id) {
      toast({ title: 'Erreur', description: 'ID de l\'aide requis.', variant: 'destructive' });
      return false;
    }
    try {
      setIsSubmitting(true);
      await updateVisiteMutation({ variables: { id, data } });
      await refetch();
      toast({ title: 'Visite mise à jour.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteVisite = async (id: number) => {
    if (!id) {
      toast({ title: 'Erreur', description: 'ID de l\'aide requis.', variant: 'destructive' });
      return false;
    }
    try {
      setIsSubmitting(true);
      await deleteVisiteMutation({ variables: { id } });
      await refetch();
      toast({ title: 'Visite supprimée.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    visites: data?.visites || [],
    loading,
    error,
    refetch,
    createVisite,
    updateVisite,
    deleteVisite,
    isSubmitting, // ✅ centralisé
  };
}


export function useVisiteMutations() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createVisiteMutation] = useMutation(CREATE_VISITE);
  const [updateVisiteMutation] = useMutation(UPDATE_VISITE);
  const [deleteVisiteMutation] = useMutation(DELETE_VISITE);

  const createVisite = async (data: any) => {
    try {
      setIsSubmitting(true);
      await createVisiteMutation({ variables: { data } });
      toast({ title: 'Visite créé avec succès.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateVisite = async (id: number, data: any) => {
    try {
      setIsSubmitting(true);
      await updateVisiteMutation({ variables: { id, data } });
      toast({ title: 'Visite mis à jour.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteVisite = async (id: number) => {
    try {
      setIsSubmitting(true);
      await deleteVisiteMutation({ variables: { id } });
      toast({ title: 'Visite supprimé.' });
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
    createVisite,
    updateVisite,
    deleteVisite,
  };
}