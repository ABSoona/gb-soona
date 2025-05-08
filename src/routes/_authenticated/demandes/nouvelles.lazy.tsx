import Demandes from '@/features/demandes'
import { getUserId } from '@/lib/session';
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/demandes/nouvelles')({
  component: () => {
    
    return <Demandes newOlny={true} status={['recue']} title='Nouvelles demandes' description="Liste des nouvelles demandes pour lequelles le suivi n'a pas encore commencé"/>;
  },
});