import Demandes from '@/features/demandes'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/demandes/en-pre-commission')({
  component: () => {

    return <Demandes status={['en_pre_commision']} title='Demandes en pré-comité' description="Liste des demandes dont toutes les aides ont expiré, à soumettre au comité"/>;
  },
});
