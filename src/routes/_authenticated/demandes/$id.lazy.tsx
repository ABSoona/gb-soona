import {   createLazyFileRoute } from '@tanstack/react-router'
import DemandeDetail from '@/features/demandes/demande-detail'
import DemandesProvider from '@/features/demandes/context/demandes-context'

export const Route = createLazyFileRoute('/_authenticated/demandes/$id')({
  component: () => (
    <DemandesProvider>
      <DemandeDetail />
    </DemandesProvider>
  ),

})
