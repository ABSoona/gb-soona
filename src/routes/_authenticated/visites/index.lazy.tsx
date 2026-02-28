
import Visites from '@/features/visites';
import { getUserId } from '@/lib/session';
import { createLazyFileRoute } from '@tanstack/react-router'
export const Route = createLazyFileRoute('/_authenticated/visites/')({

  component: () => { 
      return <Visites />;
    },
})
