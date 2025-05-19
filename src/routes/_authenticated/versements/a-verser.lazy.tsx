import Versements from '@/features/versements'
import { createLazyFileRoute } from '@tanstack/react-router'
export const Route = createLazyFileRoute('/_authenticated/versements/a-verser')({

  component: () => { 
      return <Versements after={new Date()} status={'AVerser'}/>;
    },
})
