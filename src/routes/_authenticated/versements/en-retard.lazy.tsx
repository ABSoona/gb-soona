import Versements from '@/features/versements'
import { createLazyFileRoute } from '@tanstack/react-router'
export const Route = createLazyFileRoute('/_authenticated/versements/en-retard')({

  component: () => { 
      return <Versements status={'AVerser'} before={new Date()} />;
    },
})
