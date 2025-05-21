import DemandeDownload from '@/features/demandes/components/demande-pdf-download'
import DemandesProvider from '@/features/demandes/context/demandes-context'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/demandes/$id/pdf')({
  component: () => (
    <DemandesProvider>
      <DemandeDownload />
    </DemandesProvider>
  ),

})
