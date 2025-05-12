import { toast } from '@/hooks/use-toast';
import { handleServerError } from '@/utils/handle-server-error';
import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import {
  CREATE_DEMANDE,
  CREATE_DEMANDE_ACTIVITY,
  DELETE_DEMANDE,
  DELETE_DEMANDE_ACTIVITY,
  GET_DEMANDE_STATS,
  GET_DEMANDES,
  UPDATE_DEMANDE,
} from './graphql/queries';
import { Demande } from '@/model/demande/Demande';
import { getUserId } from '@/lib/session';
import axiosInstance from '@/lib/axtios-instance';

type DemandeServiceParams = {
  order?: number;
  where?: Record<string, any>; // tu peux affiner selon ton schéma GraphQL
};

export function useDemandeService(variables?: DemandeServiceParams): {
  demandes: Demande[];
  loading: boolean;
  error: unknown;
  refetch: () => void;
  createDemande: (data: any) => Promise<boolean>;
  updateDemande: (id: number, data: any) => Promise<boolean>;
  deleteDemande: (id: number) => Promise<boolean>;
  createDemandeActivity: (params: {
    titre: string;
    message: string;
    typeField: string;
    demandeId: number;
    userId?: string;
  }) => Promise<boolean>;
  deleteDemandeActivity: (id: number) => Promise<boolean>;
  isSubmitting: boolean;
  stats: {
    total: number;
    suivies: number;
    enVisite: number;
    enCommite: number;
    affecteAMoi: number;
    nouvelles: number;
  };
} {
  const { data, loading, error, refetch } = useQuery(GET_DEMANDES, {
    variables: variables || {},
    fetchPolicy: 'network-only',
    onCompleted: (newData) => {
      console.log("✅ DEMANDES chargées :", newData);
    }
  });
  const userId = getUserId();

  const {
    data: statsData,
    refetch: refetchStats,
    loading: loadingStats,
  } = useQuery(GET_DEMANDE_STATS, {
    variables: { userId },
    fetchPolicy: 'network-only',
  });
  const stats = {
    total: statsData?.total?.count ?? 0,
    suivies: statsData?.suivies?.filter((d: any) => d.demandeActivities.length > 1)
    ?.length ?? 0,
    enVisite: statsData?.enVisite?.count ?? 0,
    enCommite: statsData?.enCommite?.count ?? 0,
    affecteAMoi: statsData?.affecteAMoi?.count ?? 0,
    nouvelles:
      statsData?.recue?.filter((d: any) => d.demandeActivities.length === 1)
        ?.length ?? 0,
  };

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
      await refetchStats();
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
      await refetchStats();
      toast({ title: 'Demande supprimée.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // CREATE ACTIVITY
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
            user: userId ? { id: userId } : undefined,
          },
        },
      });
      await refetch();
      await refetchStats();
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
      await refetchStats();
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
    demandes: data?.demandes ?? [],
    loading,
    error,
    refetch,
    createDemande,
    updateDemande,
    deleteDemande,
    createDemandeActivity,
    deleteDemandeActivity,
    isSubmitting,
    stats,
  };

}

export const downloadFicheVisitePdf = async (demandeId: number,token:string): Promise<void> => {
  const response = await axiosInstance.get(`/demandes/${demandeId}/pdf?token=${token}`, {
    responseType: 'blob',
  });

  const blob = response.data;
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = `fiche-visite-${demandeId}.pdf`;
  link.click();
  window.URL.revokeObjectURL(link.href);
};
export const shareFicheVisite = async ( data: {
  demandeId: number;
  userId: string;
  subordoneId: string;
}): Promise<void> => {
  const response = await axiosInstance.put<{
    demandeId: number;
    userId: string;
    subordoneId: string;
  }>(`/demandes/${data.demandeId}/share`, data);
}