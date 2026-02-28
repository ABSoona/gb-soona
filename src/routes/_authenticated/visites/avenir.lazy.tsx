
import Visites from '@/features/visites';
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/visites/avenir')({

  component: () => { 
      return <Visites  status={['Planifiee','Programee']}/>;
    },
})
