import { toast } from '@/hooks/use-toast';
import { handleServerError } from '@/utils/handle-server-error';
import { useMutation, useQuery } from '@apollo/client';
import { useMemo, useState } from 'react';
import { CREATE_USER, DELETE_USER, GET_USERS, SEARCH_USERS, SEARCH_USERS_BY_FIRSTNAME, SEARCH_USERS_BY_LASTNAME, UPDATE_USER } from './graphql/queries';


export function useUsersSearch(search: string) {
  const skip = !search;

  const { data: dataFirst, loading: loadingFirst } = useQuery(SEARCH_USERS_BY_FIRSTNAME, {
    variables: { search },
    skip,
  });

  const { data: dataLast, loading: loadingLast } = useQuery(SEARCH_USERS_BY_LASTNAME, {
    variables: { search },
    skip,
  });

  const users = useMemo(() => {
    const merged = [...(dataFirst?.users || []), ...(dataLast?.users || [])];
    const uniqueUsers = Array.from(new Map(merged.map((u) => [u.id, u])).values());
    return uniqueUsers;
  }, [dataFirst, dataLast]);

  return {
    users,
    loading: loadingFirst || loadingLast,
    error: null, // gère les erreurs si besoin
  };
}

export function useUserServicev2(variables?: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_USERS, {
    variables,
    fetchPolicy: 'network-only',
    onCompleted: (newData) => {
      console.log("✅ Users chargées :", newData);
    }
  });

  const [createUserMutation] = useMutation(CREATE_USER);
  const [updateUserMutation] = useMutation(UPDATE_USER);
  const [deleteUserMutation] = useMutation(DELETE_USER);

  const createUser = async (data: any) => {
    try {
      setIsSubmitting(true);
      await createUserMutation({ variables: { data } });
      await refetch();
      toast({ title: 'User créée avec succès.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateUser = async (id: number, data: any) => {
    if (!id) {
      toast({ title: 'Erreur', description: 'ID de l\'user requis.', variant: 'destructive' });
      return false;
    }
    try {
      setIsSubmitting(true);
      await updateUserMutation({ variables: { id, data } });
      await refetch();
      toast({ title: 'User mise à jour.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteUser = async (id: number) => {
    if (!id) {
      toast({ title: 'Erreur', description: 'ID de l\'user requis.', variant: 'destructive' });
      return false;
    }
    try {
      setIsSubmitting(true);
      await deleteUserMutation({ variables: { id } });
      await refetch();
      toast({ title: 'User supprimée.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    users: data?.users || [],
    loading,
    error,
    refetch,
    createUser,
    updateUser,
    deleteUser,
    isSubmitting, // ✅ centralisé
  };
}
