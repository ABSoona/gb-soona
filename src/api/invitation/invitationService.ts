import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_INVITATIONS, CREATE_INVITATION, UPDATE_INVITATION, DELETE_INVITATION } from './graphql/queries';
import { toast } from '@/hooks/use-toast';
import { handleServerError } from '@/utils/handle-server-error';

export function useInvitationService(variables?: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_INVITATIONS, {
    variables,
    fetchPolicy: 'network-only',
    onCompleted: (newData) => {
      console.log("✅ Invitations chargées :", newData);
    }
  });

  const [createInvitationMutation] = useMutation(CREATE_INVITATION);
  const [updateInvitationMutation] = useMutation(UPDATE_INVITATION);
  const [deleteInvitationMutation] = useMutation(DELETE_INVITATION);

  const createInvitation = async (data: any) => {
    try {
      setIsSubmitting(true);
      await createInvitationMutation({ variables: { data } });
      await refetch();
      toast({ title: 'Invitation créée avec succès.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateInvitation = async (id: number, data: any) => {
    if (!id) {
      toast({ title: 'Erreur', description: 'ID de l\'aide requis.', variant: 'destructive' });
      return false;
    }
    try {
      setIsSubmitting(true);
      await updateInvitationMutation({ variables: { id, data } });
      await refetch();
      toast({ title: 'Invitation mise à jour.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteInvitation = async (id: number) => {
    if (!id) {
      toast({ title: 'Erreur', description: 'ID de l\'aide requis.', variant: 'destructive' });
      return false;
    }
    try {
      setIsSubmitting(true);
      await deleteInvitationMutation({ variables: { id } });
      await refetch();
      toast({ title: 'Invitation supprimée.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    invitations: data?.invitations || [],
    loading,
    error,
    refetch,
    createInvitation,
    updateInvitation,
    deleteInvitation,
    isSubmitting, // ✅ centralisé
  };
}
