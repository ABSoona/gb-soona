import Demandes from '@/features/demandes'

import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/demandes/en-visite')({
  component: () => {    
    return <Demandes  status={['en_visite']} title='Demandes en visite' description='Liste des demandes pour lesquelles une visite a été organisée'/>;
  },
});