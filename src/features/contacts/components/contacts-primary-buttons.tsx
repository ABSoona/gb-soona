import { Button } from '@/components/ui/button'
import { IconUserPlus } from '@tabler/icons-react'
import { useContacts } from '../context/contacts-context'

export function ContactsPrimaryButtons() {
  const { setOpen } = useContacts()
  return (
    <div className='flex gap-2'>

      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Nouveau bénéficiaire</span> <IconUserPlus size={18} />
      </Button>

    </div>
  )
}
