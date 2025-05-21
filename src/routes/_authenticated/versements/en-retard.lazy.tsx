import Versements from '@/features/versements'
import { createLazyFileRoute } from '@tanstack/react-router'
import { addHours } from 'date-fns';
export const Route = createLazyFileRoute('/_authenticated/versements/en-retard')({

  component: () => { 
      return <Versements status={'AVerser'} before={addHours(new Date(),-2)} />;
    },
})
