import { useQuery, useMutation } from '@apollo/client';
import { GET_DEMANDES, CREATE_DEMANDE, UPDATE_DEMANDE, DELETE_DEMANDE } from './graphql/queries';
import { toast } from '@/hooks/use-toast';
import { handleServerError } from '@/utils/handle-server-error';

export function useDemandeService(variables?: any) {
  const { data, loading, error, refetch } = useQuery(GET_DEMANDES, {
    variables: variables || {},
    fetchPolicy: 'network-only',
    onCompleted: (newData) => {
      console.log("✅ DEMANDES chargées :", newData);
    }
  });

  // CREATE
  const [createDemandeMutation, { loading: creating, error: createError }] = useMutation(CREATE_DEMANDE);

  const createDemande = async (data: any) => {
    try {
      await createDemandeMutation({ variables: { data } });
      await refetch();
      toast({ title: 'Demande créée avec succès.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    }
  };

  // UPDATE
  const [updateDemandeMutation, { loading: updating, error: updateError }] = useMutation(UPDATE_DEMANDE);

  const updateDemande = async (id: number, data: any) => {
    if (!id) {
      toast({ title: 'Erreur', description: 'ID de la demande requis.', variant: 'destructive' });
      return false;
    }
    try {
      await updateDemandeMutation({ variables: { id, data } });
      await refetch();
      toast({ title: 'Demande mise à jour.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    }
  };

  // DELETE
  const [deleteDemandeMutation, { loading: deleting, error: deleteError }] = useMutation(DELETE_DEMANDE);

  const deleteDemande = async (id: number) => {
    if (!id) {
      toast({ title: 'Erreur', description: 'ID de la demande requis.', variant: 'destructive' });
      return false;
    }
    try {
      await deleteDemandeMutation({ variables: { id } });
      await refetch();
      toast({ title: 'Demande supprimée.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
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
    creating,
    updating,
    deleting,
    createError,
    updateError,
    deleteError,
  };
}
