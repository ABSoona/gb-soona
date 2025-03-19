import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { SEARCH_CONTACTS,GET_CONTACTS, CREATE_CONTACT, UPDATE_CONTACT, DELETE_CONTACT, GET_CONTACT  } from './graphql/queries';
import { toast } from '@/hooks/use-toast';
import { handleServerError } from '@/utils/handle-server-error';
export function useContactSearch(search: string) {
  const { data, loading, error } = useQuery(SEARCH_CONTACTS, { variables: { search }, skip: !search });

  return {
    contacts: data?.contacts || [],
    loading,
    error,
  };
}



export function useContactService(variables?: any) {
  const client = useApolloClient();

  if (!client) {
    console.error('❌ Apollo Client introuvable. Vérifie ApolloProvider !');
    return {
      contacts: [],
      loading: false,
      error: new Error('Apollo Client non trouvé'),
      createContact: () => {},
      updateContact: () => {},
      deleteContact: () => {},
    };
  }

  try {
    const { data, loading, error, refetch } = useQuery(GET_CONTACTS, {
      variables,
      fetchPolicy: 'network-only',
      onCompleted: (newData) => {
        console.log("✅ `GET_CONTACTS` après refetch :", newData);
      },
    });




    const [createContactMutation, { loading: creating, error: createError }] = useMutation(CREATE_CONTACT, {
      refetchQueries: [{ query: GET_CONTACTS }], // 🔥 Force Apollo à recharger la liste après la mutation
    });
    const [updateContactMutation, { loading: updating, error: updateError }] = useMutation(UPDATE_CONTACT);
    const [deleteContactMutation, { loading: deleting, error: deleteError }] = useMutation(DELETE_CONTACT);

    // 🔥 Création d'une contact
    const createContact = async (data: any) => {
      try {
        await createContactMutation({ variables: { data } });
        refetch();
        console.log("✅ Après refetch()");
      } catch (err) {
        console.error("❌ Erreur lors de la création :", err);
        handleServerError(err);
      }
    };

    // 🔥 Mise à jour d'une contact
    const updateContact = async (id: number, data: any) => {
      if (!id) {
        console.error("❌ Erreur : ID de la contact introuvable.");
        toast({ title: 'Erreur', description: 'ID de la contact requis.', variant: 'destructive' });
        return;
      }

      try {
        const { id: _, ...updateData } = data;
        await updateContactMutation({ variables: { id, data: updateData } });
    
     //   refetch();
      } catch (err) {
        console.error("❌ Erreur lors de la mise à jour :", err);
        handleServerError(err);
      }
    };

    // 🔥 Suppression d'une contact
    const deleteContact = async (id: number) => {
      if (!id) {
        console.error("❌ Erreur : ID de la contact introuvable.");
        toast({ title: 'Erreur', description: 'ID de la contact requis.', variant: 'destructive' });
        return;
      }

      try {
        await deleteContactMutation({ variables: { id } });
    
       refetch(); // 🔥 Met à jour la liste des contacts après suppression
      } catch (err) {
        console.error("❌ Erreur lors de la suppression :", err);
        handleServerError(err);
      }
    };

    return {
      contacts: data?.contacts || [],
      loading,
      error,
      refetch,
      createContact: createContact || (() => {}),
      updateContact: updateContact || (() => {}),
      deleteContact: deleteContact || (() => {}),
      creating,
      updating,
      deleting, // ✅ Ajout de l'état de suppression
      createError,
      updateError,
      deleteError, // ✅ Ajout de l'erreur en cas d'échec de suppression
    };
  } catch (e) {
    console.error('Erreur dans useContactService:', e);
    return {
      contacts: [],
      loading: false,
      error: e,
      createContact: () => {},
      updateContact: () => {},
      deleteContact: () => {},
    };
  }
}
