import { toast } from '@/hooks/use-toast';
import { NotificationPreferenceferences } from '@/model/user-notification-preferences/user-notification-preferences';
import { handleServerError } from '@/utils/handle-server-error';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_USERNOTIFICATIONPREFERENCE, DELETE_USERNOTIFICATIONPREFERENCE, GET_USERNOTIFICATIONPREFERENCES, UPDATE_USERNOTIFICATIONPREFERENCE } from './graphql/queries';

export function useNotificationPrefrenceService(variables?: any) {
  // 👉 Variables dynamiques : toutes les notificationprefrences ou notificationprefrences d’un contact
  /*  const variables = contactId
     ? { where: { contact: { id:  contactId } }  }
     : {}; */

  const { data, loading, error, refetch } = useQuery(GET_USERNOTIFICATIONPREFERENCES, {
    variables,
    fetchPolicy: 'network-only',
    onCompleted: (newData) => {
      console.log("✅ NotificationPrefrences chargées :", newData);
    }
  });

  // 🟢 CREATE
  const [createNotificationPrefrenceMutation, { loading: creating, error: createError }] = useMutation(CREATE_USERNOTIFICATIONPREFERENCE);

  const createNotificationPrefrence = async (data: any) => {
    try {
      await createNotificationPrefrenceMutation({ variables: { data } });
      await refetch();
      toast({ title: 'NotificationPrefrence créée avec succès.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    }
  };

  // 🟢 UPDATE
  const [updateNotificationPrefrenceMutation, { loading: updating, error: updateError }] = useMutation(UPDATE_USERNOTIFICATIONPREFERENCE);

  const updateNotificationPrefrence = async (id: number, data: any) => {
    if (!id) {
      toast({ title: 'Erreur', description: 'ID de l\'notificationprefrence requis.', variant: 'destructive' });
      return false;
    }
    try {
      await updateNotificationPrefrenceMutation({ variables: { id, data } });
      await refetch();
      toast({ title: 'NotificationPrefrence mise à jour.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    }
  };

  // 🟢 DELETE
  const [deleteNotificationPrefrenceMutation, { loading: deleting, error: deleteError }] = useMutation(DELETE_USERNOTIFICATIONPREFERENCE);

  const deleteNotificationPrefrence = async (id: number) => {
    if (!id) {
      toast({ title: 'Erreur', description: 'ID de l\'notificationprefrence requis.', variant: 'destructive' });
      return false;
    }
    try {
      await deleteNotificationPrefrenceMutation({ variables: { id } });
      await refetch();
      toast({ title: 'NotificationPrefrence supprimée.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    }
  };

  return {
    notificationprefrences: (data?.userNotificationPreferences || []) as NotificationPreferenceferences[],
    loading,
    error,
    refetch,
    createNotificationPrefrence,
    updateNotificationPrefrence,
    deleteNotificationPrefrence,
    creating,
    updating,
    deleting,
    createError,
    updateError,
    deleteError,
  };
}
