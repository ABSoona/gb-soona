import { Button } from '@/components/ui/button'
import { IconUserPlus } from '@tabler/icons-react'
import { useVisites } from '../context/visites-context'

export function VisitesPrimaryButtons() {
  const { setOpenVisite: setOpen } = useVisites()
  return (
    <div className='flex gap-2'>

      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Nouvelle Visite</span> <IconUserPlus size={18} />
      </Button>

    </div>
  )
}
