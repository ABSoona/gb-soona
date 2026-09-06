import { toast } from '@/hooks/use-toast';
import { handleServerError } from '@/utils/handle-server-error';
import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import { CREATE_AIDE, DELETE_AIDE, GET_AIDES, UPDATE_AIDE } from './graphql/queries';

export function useAideService(variables?: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔥 skipQuery : permet de recuperer uniquement les fonctions de mutation
  // (createAide, deleteAide...) sans relancer GET_AIDES (non borne, potentiellement
  // toutes les aides de l'application) quand l'appelant n'a pas besoin de la liste.
  const { skipQuery, ...queryVariables } = variables ?? {};

  const { data, previousData, loading, error, refetch } = useQuery(GET_AIDES, {
    variables: queryVariables,
    fetchPolicy: 'network-only',
    skip: skipQuery === true,
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
    // 🔥 Retombe sur le resultat precedent pendant qu'une nouvelle requete est
    // en vol (recherche/filtre/page) au lieu de vider la liste — voir
    // demandeService.ts pour le meme fix (evite de demonter le toolbar).
    aides: data?.aides ?? previousData?.aides ?? [],
    total: data?.meta?.count ?? previousData?.meta?.count ?? 0,
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