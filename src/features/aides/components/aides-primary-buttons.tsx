import { Button } from '@/components/ui/button'
import { IconUserPlus } from '@tabler/icons-react'
import { useAides } from '../context/aides-context'

export function AidesPrimaryButtons() {
  const { setOpenAide: setOpen } = useAides()
  return (
    <div className='flex gap-2'>

      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Nouvelle Aide</span> <IconUserPlus size={18} />
      </Button>

    </div>
  )
}
