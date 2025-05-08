import Demandes from '@/features/demandes'
import { getUserId } from '@/lib/session';
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/demandes/en-commission')({
  component: () => {
    
    return <Demandes status={['en_commision']} title='Demandes en comité' description='Liste des demandes à examiner lors du prochain comité'/>;
  },
});