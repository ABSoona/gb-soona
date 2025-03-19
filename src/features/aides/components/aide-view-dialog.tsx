'use client'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Aide } from '@/model/aide/Aide'

import { cn } from '@/lib/utils'
import { Url } from 'url'
import { useAides } from '../context/aides-context'
import { AideView } from './aide-view'

interface Props {
  currentRow?: Aide
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AideViewDialog({ currentRow, open, onOpenChange }: Props) {
  if (!currentRow) {
    return null
  }
  const { setOpenAide: setOpen, setCurrentRow } = useAides()





  return (
    <Sheet open={open} onOpenChange={(state) => onOpenChange(state)}>
      <SheetContent side="rightfull" className="flex flex-col">
        <ScrollArea>
         <AideView currentRow={currentRow} showContact={false}/>
        </ScrollArea>

        <SheetFooter className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          <Button  onClick={() => {
              setCurrentRow(currentRow)
              setOpen('edit')
            }}>
              Modifier la Aide
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

