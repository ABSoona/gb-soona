import { useQuery } from '@apollo/client';
import { SEARCH_CONTACTS } from './graphql/quaries';
export function useContactSearch(search: string) {
  const { data, loading, error } = useQuery(SEARCH_CONTACTS, { variables: { search }, skip: !search });

  return {
    contacts: data?.contacts || [],
    loading,
    error,
  };
}