import { toast } from '@/hooks/use-toast';
import { handleServerError } from '@/utils/handle-server-error';
import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import {
  CREATE_WEBSITE_DEMANDE,
  DELETE_WEBSITE_DEMANDE,
  GET_WEBSITE_DEMANDES,
  UPDATE_WEBSITE_DEMANDE,
} from './graphql/queries';

export function useWebsiteDemandeService(variables?: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_WEBSITE_DEMANDES, {
    variables,
    fetchPolicy: 'network-only',
    onCompleted: (newData) => {
      console.log('✅ Website demandes chargées :', newData);
    },
  });

  const [createWebsiteDemandeMutation] = useMutation(CREATE_WEBSITE_DEMANDE);
  const [updateWebsiteDemandeMutation] = useMutation(UPDATE_WEBSITE_DEMANDE);
  const [deleteWebsiteDemandeMutation] = useMutation(DELETE_WEBSITE_DEMANDE);

  const createWebsiteDemande = async (data: any) => {
    try {
      setIsSubmitting(true);
      await createWebsiteDemandeMutation({ variables: { data } });
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

  const updateWebsiteDemande = async (id: string, data: any) => {
    if (!id) {
      toast({ title: 'Erreur', description: 'ID requis.', variant: 'destructive' });
      return false;
    }
    try {
      setIsSubmitting(true);
      await updateWebsiteDemandeMutation({ variables: { id, data } });
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

  const deleteWebsiteDemande = async (id: string) => {
    if (!id) {
      toast({ title: 'Erreur', description: 'ID requis.', variant: 'destructive' });
      return false;
    }
    try {
      setIsSubmitting(true);
      await deleteWebsiteDemandeMutation({ variables: { id } });
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

  return {
    websiteDemandes: data?.websiteDemandes || [],
    loading,
    error,
    refetch,
    createWebsiteDemande,
    updateWebsiteDemande,
    deleteWebsiteDemande,
    isSubmitting,
  };
}
