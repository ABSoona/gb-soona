import { IconMailPlus, IconUserPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useDemandes } from '../context/demandes-context'

export function DemandesPrimaryButtons() {
  const { setOpen } = useDemandes()
  return (
    <div className='flex gap-2'>
     
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Exporter</span> <IconUserPlus size={18} />
      </Button>
    </div>
  )
}
