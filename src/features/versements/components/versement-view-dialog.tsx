'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetFooter
} from '@/components/ui/sheet'
import { Versement } from '@/model/versement/versement'
import { useVersements } from '../context/versements-context'
import { VersementView } from './versement-view'
interface Props {
  currentRow?: Versement
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VersementViewDialog({ currentRow, open, onOpenChange }: Props) {
  if (!currentRow) {
    return null
  }
  const { setOpenVersement: setOpen, setCurrentRow } = useVersements()

  return (
    <Sheet open={open} onOpenChange={(state) => onOpenChange(state)}>
      <SheetContent side="rightfull" className="flex flex-col">
        <ScrollArea>
          <VersementView currentRow={currentRow} showContact={false} />
        </ScrollArea>

        <SheetFooter className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          <Button onClick={() => {
            setCurrentRow(currentRow)
            setOpen('edit')
          }}>
            Modifier la Versement
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

