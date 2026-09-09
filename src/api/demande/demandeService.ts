import { onError } from '@apollo/client/link/error';
import { toast } from '@/hooks/use-toast';
import { handleServerError } from '@/utils/handle-server-error';
import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import {
  CREATE_DEMANDE,
  CREATE_DEMANDE_ACTIVITY,
  CREATE_DEMANDE_AUTRE_CHARGE,
  CREATE_DEMANDE_DETTE_DETAIL,
  CREATE_DEMANDE_SITUATION_HISTORY,
  DELETE_DEMANDE,
  DELETE_DEMANDE_ACTIVITY,
  DELETE_DEMANDE_AUTRE_CHARGE,
  DELETE_DEMANDE_DETTE_DETAIL,
  DELETE_DEMANDE_SITUATION_HISTORY,
  GET_DEMANDE_AUTRE_CHARGES,
  GET_DEMANDE_DETTE_DETAILS,
  GET_DEMANDE_SITUATION_HISTORIES,
  GET_DEMANDE_STATS,
  GET_DEMANDES,
  UPDATE_DEMANDE,
  UPDATE_DEMANDE_AUTRE_CHARGE,
  UPDATE_DEMANDE_DETTE_DETAIL,
} from './graphql/queries';
import { DemandeAutreCharge, DemandeDetteDetail, DemandeSituationHistory } from '@/model/demande/Demande';
import { Demande } from '@/model/demande/Demande';
import { getUserId } from '@/lib/session';
import axiosInstance from '@/lib/axtios-instance';

type DemandeServiceParams = {
  order?: number;
  where?: Record<string, any>; // tu peux affiner selon ton schéma GraphQL
  take?:number
  skip?:number
  // 🔥 Recupere uniquement les fonctions de mutation (createDemande,
  // updateDemande...) sans relancer GET_DEMANDES / GET_DEMANDE_STATS,
  // quand l'appelant a deja la donnee (ex: recue en props).
  skipQuery?: boolean
};

export function useDemandeService(variables?: DemandeServiceParams): {
  demandes: Demande[];
  total: number;
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
  const skipQuery = variables?.skipQuery === true;
  const shouldSkip = skipQuery || !variables || Object.keys(variables).length === 0;

  const { skipQuery: _skipQuery, ...queryVariables } = variables || {};

  const { data, previousData, loading, error, refetch } = useQuery(GET_DEMANDES, {
    variables: queryVariables,
    fetchPolicy: 'network-only',
    skip: shouldSkip,
    onCompleted: (newData) => {
      console.log("✅ DEMANDES chargées :", newData);
    },

  });
  const userId = getUserId();

  const {
    data: statsData,
    refetch: refetchStats,
    loading: loadingStats,
  } = useQuery(GET_DEMANDE_STATS, {
    variables: { userId },
    fetchPolicy: 'network-only',
    skip: skipQuery,
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
    // 🔥 Retombe sur le resultat precedent pendant qu'une nouvelle requete est
    // en vol (recherche/filtre/page) au lieu de vider la liste : evite que le
    // tableau (et son champ de recherche) se demonte/remonte a chaque frappe.
    demandes: data?.demandes ?? previousData?.demandes ?? [],
    total: data?.meta?.count ?? previousData?.meta?.count ?? 0,
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

export function useDemandeSituationHistoryService(demandeId?: number): {
  demandeSituationHistories: DemandeSituationHistory[];
  loading: boolean;
  refetch: () => void;
  createDemandeSituationHistory: (data: any) => Promise<boolean>;
  deleteDemandeSituationHistory: (id: number) => Promise<boolean>;
  isSubmitting: boolean;
} {
  const { data, loading, refetch } = useQuery(GET_DEMANDE_SITUATION_HISTORIES, {
    variables: { where: { demande: { id: demandeId } } },
    fetchPolicy: 'network-only',
    skip: !demandeId,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createMutation] = useMutation(CREATE_DEMANDE_SITUATION_HISTORY);
  const [deleteMutation] = useMutation(DELETE_DEMANDE_SITUATION_HISTORY);

  const createDemandeSituationHistory = async (payload: any) => {
    try {
      setIsSubmitting(true);
      await createMutation({ variables: { data: payload } });
      if (demandeId) {
        await refetch();
      }
      toast({ title: 'Situation historisée avec succès.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteDemandeSituationHistory = async (id: number) => {
    try {
      setIsSubmitting(true);
      await deleteMutation({ variables: { id } });
      if (demandeId) {
        await refetch();
      }
      toast({ title: 'Entrée d\'historique supprimée.' });
      return true;
    } catch (err) {
      handleServerError(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    demandeSituationHistories: data?.demandeSituationHistories ?? [],
    loading,
    refetch,
    createDemandeSituationHistory,
    deleteDemandeSituationHistory,
    isSubmitting,
  };
}

// 🔥 Decomposition (nom + montant) du champ "Autres charges" d'une demande.
// Les mutations create/update/delete sont volontairement silencieuses (pas de
// toast) : elles sont utilisees en lot lors de l'enregistrement de la demande,
// le toast de succes/echec global de la sauvegarde suffit.
export function useDemandeAutreChargeService(demandeId?: number): {
  demandeAutreCharges: DemandeAutreCharge[];
  loading: boolean;
  refetch: () => void;
  createDemandeAutreCharge: (data: { demande: { id: number }; nom: string; montant: number }) => Promise<DemandeAutreCharge>;
  updateDemandeAutreCharge: (id: number, data: { nom: string; montant: number }) => Promise<DemandeAutreCharge>;
  deleteDemandeAutreCharge: (id: number) => Promise<void>;
} {
  const { data, loading, refetch } = useQuery(GET_DEMANDE_AUTRE_CHARGES, {
    variables: { where: { demande: { id: demandeId } } },
    fetchPolicy: 'network-only',
    skip: !demandeId,
  });

  const [createMutation] = useMutation(CREATE_DEMANDE_AUTRE_CHARGE);
  const [updateMutation] = useMutation(UPDATE_DEMANDE_AUTRE_CHARGE);
  const [deleteMutation] = useMutation(DELETE_DEMANDE_AUTRE_CHARGE);

  const createDemandeAutreCharge = async (payload: { demande: { id: number }; nom: string; montant: number }) => {
    const result = await createMutation({ variables: { data: payload } });
    return result.data?.createDemandeAutreCharge;
  };

  const updateDemandeAutreCharge = async (id: number, payload: { nom: string; montant: number }) => {
    const result = await updateMutation({ variables: { id, data: payload } });
    return result.data?.updateDemandeAutreCharge;
  };

  const deleteDemandeAutreCharge = async (id: number) => {
    await deleteMutation({ variables: { id } });
  };

  return {
    demandeAutreCharges: data?.demandeAutreCharges ?? [],
    loading,
    refetch,
    createDemandeAutreCharge,
    updateDemandeAutreCharge,
    deleteDemandeAutreCharge,
  };
}

export function useDemandeDetteDetailService(demandeId?: number): {
  demandeDetteDetails: DemandeDetteDetail[];
  loading: boolean;
  refetch: () => void;
  createDemandeDetteDetail: (data: { demande: { id: number }; nom: string; montant: number }) => Promise<DemandeDetteDetail>;
  updateDemandeDetteDetail: (id: number, data: { nom: string; montant: number }) => Promise<DemandeDetteDetail>;
  deleteDemandeDetteDetail: (id: number) => Promise<void>;
} {
  const { data, loading, refetch } = useQuery(GET_DEMANDE_DETTE_DETAILS, {
    variables: { where: { demande: { id: demandeId } } },
    fetchPolicy: 'network-only',
    skip: !demandeId,
  });

  const [createMutation] = useMutation(CREATE_DEMANDE_DETTE_DETAIL);
  const [updateMutation] = useMutation(UPDATE_DEMANDE_DETTE_DETAIL);
  const [deleteMutation] = useMutation(DELETE_DEMANDE_DETTE_DETAIL);

  const createDemandeDetteDetail = async (payload: { demande: { id: number }; nom: string; montant: number }) => {
    const result = await createMutation({ variables: { data: payload } });
    return result.data?.createDemandeDetteDetail;
  };

  const updateDemandeDetteDetail = async (id: number, payload: { nom: string; montant: number }) => {
    const result = await updateMutation({ variables: { id, data: payload } });
    return result.data?.updateDemandeDetteDetail;
  };

  const deleteDemandeDetteDetail = async (id: number) => {
    await deleteMutation({ variables: { id } });
  };

  return {
    demandeDetteDetails: data?.demandeDetteDetails ?? [],
    loading,
    refetch,
    createDemandeDetteDetail,
    updateDemandeDetteDetail,
    deleteDemandeDetteDetail,
  };
}

export const downloadFicheVisitePdf = async (demandeId: number, token: string): Promise<void> => {
  const response = await axiosInstance.get(`/demandes/${demandeId}/pdf?token=${token}`, {
    responseType: 'blob',
  });

  const blob = response.data;
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = `demande-${demandeId}.pdf`;
  link.click();
  window.URL.revokeObjectURL(link.href);
};

export const downloadDemande = async (demandeId: number): Promise<void> => {
  const response = await axiosInstance.get(`/demandes/${demandeId}/authenticated-pdf`, {
    responseType: 'blob',
  });

  const blob = response.data;
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = `demande-${demandeId}.pdf`;
  link.click();
  window.URL.revokeObjectURL(link.href);
};
export const shareFicheVisite = async (data: {
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