import { useQuery } from '@apollo/client';
import { GET_DASHBOARD_STATS, GET_DEMANDE_STATS } from '@/api/demande/graphql/queries';
import { getUserId } from '@/lib/session';
import { Demande } from '@/model/demande/Demande';

type DemandeStats = {
  total: number;
  suivies: number;
  enVisite: number;
  enCommite: number;
  nouvelles: number;
  affecteAMoi: number;
};

type DashBoardDemandeStats = {

  suivies: number;
  enVisite: number;
  enCommite: number;
  nouvelles: number;
  enAttente: number;


};


export function useDemandeStatsService() {
    const userId = getUserId(); // doit retourner un string (ID utilisateur)
    const { data, loading, error, refetch } = useQuery(GET_DEMANDE_STATS, {
      variables: { userId },
      skip: !userId, // sécurité
    });

  const stats: DemandeStats = {
    total: data?.total?.count || 0,
    suivies: data?.suivies?.count || 0,
    enVisite: data?.enVisite?.count || 0,
    enCommite: data?.enCommite?.count || 0,
    nouvelles: data?.recue?.filter((d: any) => d.demandeActivities.length === 1).length || 0,
    affecteAMoi: data?.affecteAMoi?.count || 0,
  };

  return {
    stats,
    loading,
    error,
    refetch,
  };
}

export function useDashboardStats() {
  const { data, loading, error, refetch } = useQuery(GET_DASHBOARD_STATS, {
   // variables: { beginDate:dateRange.from, endDate:dateRange.to}
  });
  const dashBoardStats: DashBoardDemandeStats = {

    suivies: data?.suivies?.filter((e:Demande) => e.demandeActivities.length > 1).length || 0,
    enVisite: data?.enVisite?.count || 0,
    enCommite: data?.enCommite?.count || 0,
    enAttente: data?.enAttente?.count || 0,
    nouvelles: data?.recue?.filter((d: any) => d.demandeActivities.length === 1).length || 0,

  };

  return {
    dashBoardStats,
    loading,
    error,
    refetch,
  };
}