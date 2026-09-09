'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { Demande } from '@/model/demande/Demande'
import { useState } from 'react'
import { History } from 'lucide-react'
import { useDemandes } from '../context/demandes-context'
import { demandeStatusColor, demandeStatusTypes } from '../data/data'
import { DemandeView } from './demande-view'
import { DemandeSituationHistoryDrawer } from './DemandeSituationHistoryDrawer'

interface Props {
  currentRow?: Demande
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DemandeViewDialog({ currentRow, open, onOpenChange }: Props) {
  if (!currentRow) {
    return null
  }
  const { setOpenDemande: setOpen, setCurrentRow } = useDemandes()
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false)

  const { contact, status, remarques, id, createdAt } = currentRow



  return (
    <>
    <Sheet open={open} onOpenChange={(state) => onOpenChange(state)}>
      <SheetContent side="rightfull" className="flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <SheetHeader className="text-left">
              <SheetTitle>Demande N°  {id} - <span></span>
                <Badge variant="outline" className={cn('capitalize', demandeStatusColor.get(status))}>
                  {demandeStatusTypes.find(s => s.value === status)?.label ?? 'Inconnu'}
                </Badge>
              </SheetTitle>
              <SheetDescription>Reçue le {new Date(createdAt)?.toLocaleString('fr-FR')}</SheetDescription>
            </SheetHeader>
          </div>
        </div>
        <ScrollArea>
          <DemandeView currentRow={currentRow} showContact={false} showAides={false} showDocuements={false} />
        </ScrollArea>

        <SheetFooter className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setHistoryDrawerOpen(true)}>
              <History className="mr-2 h-4 w-4" />
              Voir historique
            </Button>
            <Button onClick={() => {
              setCurrentRow(currentRow)
              setOpen('edit')
            }}>
              Modifier la Demande
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
    <DemandeSituationHistoryDrawer
      demandeId={currentRow.id}
      demandeCreatedAt={currentRow.createdAt}
      open={historyDrawerOpen}
      onOpenChange={setHistoryDrawerOpen}
    />
    </>
  )
}

