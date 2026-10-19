import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import { ATTACH_AIDE_TO_DECISION, CREATE_DECISION, GET_COMITES, GET_DECISIONS_BY_COMITE, GET_DECISIONS_BY_DEMANDE, UPDATE_DECISION_MOTIVATION } from './graphql/queries';
import { handleServerError } from '@/utils/handle-server-error';
import { Comite, Decision } from '@/model/decision/Decision';
import axiosInstance from '@/lib/axtios-instance';

export const downloadDecisionPdf = async (decisionId: number): Promise<void> => {
  const response = await axiosInstance.get(`/decisions/${decisionId}/pdf`, {
    responseType: 'blob',
  });

  const blob = response.data;
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = `decision-${decisionId}.pdf`;
  link.click();
  window.URL.revokeObjectURL(link.href);
};

export function useDecisionService(demandeId?: number) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_DECISIONS_BY_DEMANDE, {
    variables: { demandeId },
    skip: !demandeId,
    fetchPolicy: 'network-only',
  });

  const [createDecisionMutation] = useMutation(CREATE_DECISION);
  const [attachAideToDecisionMutation] = useMutation(ATTACH_AIDE_TO_DECISION);
  const [updateDecisionMotivationMutation] = useMutation(UPDATE_DECISION_MOTIVATION);

  const createDecision = async (payload: {
    demandeId: number;
    type: 'Approbation' | 'Refus' | 'Ajournement';
    motivation?: string;
    acteurId?: string;
  }) => {
    try {
      setIsSubmitting(true);
      const result = await createDecisionMutation({ variables: { data: payload } });
      // refetch() ignore `skip` : ne rafraichir que si une requete est
      // reellement active pour un demandeId (sinon ca repart avec
      // demandeId undefined et echoue cote serveur).
      if (demandeId) {
        await refetch();
      }
      return result.data?.createDecision;
    } catch (err) {
      handleServerError(err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const attachAideToDecision = async (decisionId: number, aideId: number) => {
    try {
      const result = await attachAideToDecisionMutation({ variables: { decisionId, aideId } });
      if (demandeId) {
        await refetch();
      }
      return result.data?.attachAideToDecision;
    } catch (err) {
      handleServerError(err);
      throw err;
    }
  };

  const updateDecisionMotivation = async (decisionId: number, motivation: string) => {
    try {
      const result = await updateDecisionMotivationMutation({ variables: { decisionId, motivation } });
      if (demandeId) {
        await refetch();
      }
      return result.data?.updateDecisionMotivation;
    } catch (err) {
      handleServerError(err);
      throw err;
    }
  };

  return {
    decisions: (data?.decisionsByDemande ?? []) as Decision[],
    loading,
    error,
    refetch,
    createDecision,
    attachAideToDecision,
    updateDecisionMotivation,
    isSubmitting,
  };
}

export function useComites() {
  const { data, loading, error } = useQuery(GET_COMITES, { fetchPolicy: 'network-only' });
  return {
    comites: (data?.comites ?? []) as Comite[],
    loading,
    error,
  };
}

export function useDecisionsByComite(comiteId?: number) {
  const { data, loading, error } = useQuery(GET_DECISIONS_BY_COMITE, {
    variables: { comiteId },
    skip: !comiteId,
    fetchPolicy: 'network-only',
  });
  return {
    decisions: (data?.decisionsByComite ?? []) as Decision[],
    loading,
    error,
  };
}
