

import DemandesProvider from '@/features/demandes/context/demandes-context'
import DemandeDetail from '@/features/demandes/demande-detail'
import { createLazyFileRoute } from '@tanstack/react-router'


export const Route = createLazyFileRoute('/_authenticated/demandes/$id/')({
  component: () => (
    <DemandesProvider>
      <DemandeDetail />
    </DemandesProvider>
  ),
})
