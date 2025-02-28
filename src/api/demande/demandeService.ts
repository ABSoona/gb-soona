import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { GET_DEMANDES, CREATE_DEMANDE, UPDATE_DEMANDE, DELETE_DEMANDE } from './graphql/queries';
import { toast } from '@/hooks/use-toast';
import { handleServerError } from '@/utils/handle-server-error';

export function useDemandeService(variables?: any) {
  const client = useApolloClient();

  if (!client) {
    console.error('❌ Apollo Client introuvable. Vérifie ApolloProvider !');
    return {
      demandes: [],
      loading: false,
      error: new Error('Apollo Client non trouvé'),
      createDemande: () => {},
      updateDemande: () => {},
      deleteDemande: () => {},
    };
  }

  try {
    const { data, loading, error, refetch } = useQuery(GET_DEMANDES, {
      variables,
      fetchPolicy: 'network-only',
      onCompleted: (newData) => {
        console.log("✅ `GET_DEMANDES` après refetch :", newData);
      },
    });

    const [createDemandeMutation, { loading: creating, error: createError }] = useMutation(CREATE_DEMANDE, {
      refetchQueries: [{ query: GET_DEMANDES }], // 🔥 Force Apollo à recharger la liste après la mutation
    });
    const [updateDemandeMutation, { loading: updating, error: updateError }] = useMutation(UPDATE_DEMANDE);
    const [deleteDemandeMutation, { loading: deleting, error: deleteError }] = useMutation(DELETE_DEMANDE);

    // 🔥 Création d'une demande
    const createDemande = async (data: any) => {
      try {
        const response =  await createDemandeMutation({ variables: { data } });
        console.log("✅ Réponse de `createDemandeMutation()` :", response.data);
        console.log("🔄 Avant refetch()");
        refetch();
        console.log("✅ Après refetch()");
      } catch (err) {
        console.error("❌ Erreur lors de la création :", err);
        handleServerError(err);
      }
    };

    // 🔥 Mise à jour d'une demande
    const updateDemande = async (id: number, data: any) => {
      if (!id) {
        console.error("❌ Erreur : ID de la demande introuvable.");
        toast({ title: 'Erreur', description: 'ID de la demande requis.', variant: 'destructive' });
        return;
      }

      try {
        const { id: _, ...updateData } = data;
        await updateDemandeMutation({ variables: { id, data: updateData } });
    
     //   refetch();
      } catch (err) {
        console.error("❌ Erreur lors de la mise à jour :", err);
        handleServerError(err);
      }
    };

    // 🔥 Suppression d'une demande
    const deleteDemande = async (id: number) => {
      if (!id) {
        console.error("❌ Erreur : ID de la demande introuvable.");
        toast({ title: 'Erreur', description: 'ID de la demande requis.', variant: 'destructive' });
        return;
      }

      try {
        await deleteDemandeMutation({ variables: { id } });
    
       refetch(); // 🔥 Met à jour la liste des demandes après suppression
      } catch (err) {
        console.error("❌ Erreur lors de la suppression :", err);
        handleServerError(err);
      }
    };

    return {
      demandes: data?.demandes || [],
      loading,
      error,
      refetch,
      createDemande: createDemande || (() => {}),
      updateDemande: updateDemande || (() => {}),
      deleteDemande: deleteDemande || (() => {}),
      creating,
      updating,
      deleting, // ✅ Ajout de l'état de suppression
      createError,
      updateError,
      deleteError, // ✅ Ajout de l'erreur en cas d'échec de suppression
    };
  } catch (e) {
    console.error('Erreur dans useDemandeService:', e);
    return {
      demandes: [],
      loading: false,
      error: e,
      createDemande: () => {},
      updateDemande: () => {},
      deleteDemande: () => {},
    };
  }
}
