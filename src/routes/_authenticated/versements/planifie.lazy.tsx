import Versements from '@/features/versements'
import { createLazyFileRoute } from '@tanstack/react-router'
import { addHours } from 'date-fns';
export const Route = createLazyFileRoute('/_authenticated/versements/planifie')({

  component: () => { 
      return <Versements  status={'Planifie'}/>;
    },
})
