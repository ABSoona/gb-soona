import { toast } from '@/hooks/use-toast';
import { handleServerError } from '@/utils/handle-server-error';
import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import {
  CREATE_DEMANDE,
  CREATE_DEMANDE_ACTIVITY,
  DELETE_DEMANDE,
  DELETE_DEMANDE_ACTIVITY,
  GET_DEMANDES,
  UPDATE_DEMANDE,
} from './graphql/queries';

export function useDemandeService(variables?: any) {
  const { data, loading, error, refetch } = useQuery(GET_DEMANDES, {
    variables: variables || {},
    fetchPolicy: 'network-only',
    onCompleted: (newData) => {
      console.log("✅ DEMANDES chargées :", newData);
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // CREATE
  const [createDemandeMutation] = useMutation(CREATE_DEMANDE);
  const [createDemandeActivityMutation] = useMutation(CREATE_DEMANDE_ACTIVITY);
  const [deleteDemandeActivityMutation] = useMutation(DELETE_DEMANDE_ACTIVITY);
  const createDemande = async (data: any) => {
    try {
      setIsSubmitting(true);
      await createDemandeMutation({ variables: { data } });
      await refetch();
      toast({ title: 'Demande créée avec succès.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // UPDATE
  const [updateDemandeMutation] = useMutation(UPDATE_DEMANDE);

  const updateDemande = async (id: number, data: any) => {
    if (!id) {
      toast({
        title: 'Erreur',
        description: 'ID de la demande requis.',
        variant: 'destructive',
      });
      return false;
    }
    try {
      setIsSubmitting(true);
      await updateDemandeMutation({ variables: { id, data } });
      await refetch();
      toast({ title: 'Demande mise à jour.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE
  const [deleteDemandeMutation] = useMutation(DELETE_DEMANDE);

  const deleteDemande = async (id: number) => {
    if (!id) {
      toast({
        title: 'Erreur',
        description: 'ID de la demande requis.',
        variant: 'destructive',
      });
      return false;
    }
    try {
      setIsSubmitting(true);
      await deleteDemandeMutation({ variables: { id } });
      await refetch();
      toast({ title: 'Demande supprimée.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const createDemandeActivity = async ({
    titre,
    message,
    typeField,
    demandeId,
    userId,
  }: {
    titre: string;
    message: string;
    typeField: string;
    demandeId: number;
    userId?: string;
  }) => {
    try {
      setIsSubmitting(true);
      await createDemandeActivityMutation({
        variables: {
          data: {
            titre,
            message,
            typeField,
            demande: { id: demandeId },
            user: userId ? { id: userId } : undefined, // ✅ ici
          },
        },
      });
      await refetch();
      toast({ title: 'Activité créée avec succès.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  const deleteDemandeActivity = async (id: number) => {
    try {
      setIsSubmitting(true);
      await deleteDemandeActivityMutation({ variables: { id } });
      await refetch();
      toast({ title: 'Activité supprimée.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };



  return {
    demandes: data?.demandes || [],
    loading,
    error,
    refetch,
    createDemande,
    updateDemande,
    deleteDemande,
    createDemandeActivity,
    deleteDemandeActivity,
    isSubmitting, // 🔥 centralisé ici
  };
}
