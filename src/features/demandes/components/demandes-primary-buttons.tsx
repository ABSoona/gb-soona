import { IconFileExport, IconMailPlus, IconUserPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useDemandes } from '../context/demandes-context'

export function DemandesPrimaryButtons() {
  const { setOpenDemande: setOpen } = useDemandes()
  return (
    <div className='flex gap-2'>
     
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Nouvelle demande</span> <IconUserPlus size={18} />
      </Button>
    
    </div>
  )
}
