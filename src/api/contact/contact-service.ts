import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { SEARCH_CONTACTS, GET_CONTACTS, CREATE_CONTACT, UPDATE_CONTACT, DELETE_CONTACT, GET_CONTACT } from './graphql/queries';
import { toast } from '@/hooks/use-toast';
import { handleServerError } from '@/utils/handle-server-error';
import { useState } from 'react';
import axiosInstance from '@/lib/axtios-instance';
export function useContactSearch(search: string) {
  const { data, loading, error } = useQuery(SEARCH_CONTACTS, { variables: { search }, skip: !search });

  return {
    contacts: data?.contacts || [],
    loading,
    error,
  };
}



export function useContactService(variables?: any) {

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data,
    loading,
    error,
    refetch
  } = useQuery(GET_CONTACTS, {
    variables,
    fetchPolicy: 'network-only',
    onCompleted: (newData) => {
      console.log("✅ Contacts chargés :", newData);
    },
  });

  const [createContactMutation] = useMutation(CREATE_CONTACT);
  const [updateContactMutation] = useMutation(UPDATE_CONTACT);
  const [deleteContactMutation] = useMutation(DELETE_CONTACT);

  const createContact = async (data: any) => {
    try {
      setIsSubmitting(true);
      const result = await createContactMutation({ variables: { data } });
      await refetch();
      const contact = result.data?.createContact;
      toast({ title: 'Bénéficiaire créé avec succès.' });
      return contact;
    } catch (err) {
      handleServerError(err);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateContact = async (id: number, data: any) => {
    if (!id) {
      toast({
        title: 'Erreur',
        description: 'ID du contact requis.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const { id: _, ...updateData } = data;
      await updateContactMutation({ variables: { id, data: updateData } });
      await refetch();
      toast({ title: 'Bénéficiaire mis à jour avec succès.' });
    } catch (err) {
      handleServerError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteContact = async (id: number) => {
    if (!id) {
      toast({
        title: 'Erreur',
        description: 'ID du contact requis.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await deleteContactMutation({ variables: { id } });
      await refetch();
      toast({ title: 'Bénéficiaire supprimé.' });
    } catch (err) {
      handleServerError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendMessage = async (data: {contactId:string,objet :string,message:string}): Promise<void> => {
    const response = await axiosInstance.post<void>(`contacts/${data.contactId}/send-message`, data);
    return response.data;
  };
  

  

  return {
    contacts: data?.contacts || [],
    loading,
    error,
    refetch,
    createContact,
    updateContact,
    deleteContact,
    sendMessage,
    isSubmitting, // ✅ pour désactiver les boutons ou afficher "en cours..."
  };

  
}