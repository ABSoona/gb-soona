'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetFooter
} from '@/components/ui/sheet'
import { Visite } from '@/model/visite/Visite'
import { useVisites } from '../context/visites-context'
import { VisiteView } from './visite-view'
interface Props {
  currentRow?: Visite
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VisiteViewDialog({ currentRow, open, onOpenChange }: Props) {
  if (!currentRow) {
    return null
  }
  const { setOpenVisite: setOpen, setCurrentRow } = useVisites()

  return (
    <Sheet open={open} onOpenChange={(state) => onOpenChange(state)}>
      <SheetContent side="rightfull" className="flex flex-col">
        <ScrollArea>
          <VisiteView currentRow={currentRow} showContact={false} />
        </ScrollArea>

        <SheetFooter className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          <Button onClick={() => {
            setCurrentRow(currentRow)
            setOpen('edit')
          }}>
            Modifier la Visite
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

