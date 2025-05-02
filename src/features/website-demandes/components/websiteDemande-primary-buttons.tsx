import { Button } from '@/components/ui/button';
import { IconUserPlus } from '@tabler/icons-react';
import { useWebsiteDemandes } from '../context/website-demandes-context';

export function WebsiteDemandePrimaryButtons() {
  const { setOpenDemande: setOpen } = useWebsiteDemandes();

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Nouvelle demande</span> <IconUserPlus size={18} />
      </Button>
    </div>
  );
}
