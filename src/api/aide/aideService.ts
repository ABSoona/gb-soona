import { useQuery, useMutation } from '@apollo/client';
import { GET_AIDES, CREATE_AIDE, UPDATE_AIDE, DELETE_AIDE } from './graphql/queries';
import { toast } from '@/hooks/use-toast';
import { handleServerError } from '@/utils/handle-server-error';

export function useAideService(contactId?: number) {
  // 👉 Variables dynamiques : toutes les aides ou aides d’un contact
  const variables = contactId
    ? { where: { contact: { id:  contactId } }  }
    : {};

  const { data, loading, error, refetch } = useQuery(GET_AIDES, {
    variables,
    fetchPolicy: 'network-only',
    onCompleted: (newData) => {
      console.log("✅ Aides chargées :", newData);
    }
  });

  // 🟢 CREATE
  const [createAideMutation, { loading: creating, error: createError }] = useMutation(CREATE_AIDE);

  const createAide = async (data: any) => {
    try {
      await createAideMutation({ variables: { data } });
      await refetch();
      toast({ title: 'Aide créée avec succès.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    }
  };

  // 🟢 UPDATE
  const [updateAideMutation, { loading: updating, error: updateError }] = useMutation(UPDATE_AIDE);

  const updateAide = async (id: number, data: any) => {
    if (!id) {
      toast({ title: 'Erreur', description: 'ID de l\'aide requis.', variant: 'destructive' });
      return false;
    }
    try {
      await updateAideMutation({ variables: { id, data } });
      await refetch();
      toast({ title: 'Aide mise à jour.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    }
  };

  // 🟢 DELETE
  const [deleteAideMutation, { loading: deleting, error: deleteError }] = useMutation(DELETE_AIDE);

  const deleteAide = async (id: number) => {
    if (!id) {
      toast({ title: 'Erreur', description: 'ID de l\'aide requis.', variant: 'destructive' });
      return false;
    }
    try {
      await deleteAideMutation({ variables: { id } });
      await refetch();
      toast({ title: 'Aide supprimée.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
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
    creating,
    updating,
    deleting,
    createError,
    updateError,
    deleteError,
  };
}
