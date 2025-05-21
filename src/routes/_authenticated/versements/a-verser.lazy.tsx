import Versements from '@/features/versements'
import { createLazyFileRoute } from '@tanstack/react-router'
import { addHours } from 'date-fns';
export const Route = createLazyFileRoute('/_authenticated/versements/a-verser')({

  component: () => { 
      return <Versements after={ addHours(new Date(),-2)} status={'AVerser'}/>;
    },
})
