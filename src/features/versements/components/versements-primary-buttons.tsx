import { Button } from '@/components/ui/button'
import { IconUserPlus } from '@tabler/icons-react'
import { useVersements } from '../context/versements-context'

export function VersementsPrimaryButtons() {
  const { setOpenVersement: setOpen } = useVersements()
  return (
    <div className='flex gap-2'>

      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Nouvelle Versement</span> <IconUserPlus size={18} />
      </Button>

    </div>
  )
}
