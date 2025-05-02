'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetFooter,
} from '@/components/ui/sheet'

import { detailOpenOption } from '@/features/demandes/components/demandes-table'
import { Contact } from '@/model/contact/Contact'
import { useContacts } from '../context/contacts-context'
import { ContactView } from './contact-view'


interface Props {
  currentRow?: Contact
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContactViewDialog({ currentRow, open, onOpenChange }: Props) {
  if (!currentRow) {
    return null
  }
  const { setOpen, setCurrentRow } = useContacts()



  return (
    <Sheet open={open} onOpenChange={(state) => onOpenChange(state)}>
      <SheetContent side="rightfull" className="flex flex-col">

        <ScrollArea>
          <ContactView currentRow={currentRow} showDetailIn={detailOpenOption.sheet} />
        </ScrollArea>

        <SheetFooter className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          <Button onClick={() => {
            setCurrentRow(currentRow)
            setOpen('edit')
          }}>Modifier la Contact</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}


