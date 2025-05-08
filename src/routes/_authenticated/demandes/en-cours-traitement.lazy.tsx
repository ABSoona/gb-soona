import Demandes from '@/features/demandes'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/demandes/en-cours-traitement')({
  component: () => {
    
    return <Demandes status={['recue','en_visite','EnAttenteDocs','en_commision']} title='Demandes Suivies' description="Liste de toutes les demandes en cours d'étude, pas encore presentés en comité "/>;
  },
});