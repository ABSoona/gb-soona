import Demandes from '@/features/demandes'
import { getUserId } from '@/lib/session';
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/demandes/mes-demandes')({
  component: () => {
    
    return <Demandes acteurId={getUserId()} title='Demande qui me sont affectées' description="Liste des demandes qui me sont affectées"/>;
  },
});