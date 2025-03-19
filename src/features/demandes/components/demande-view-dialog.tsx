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
import { Demande } from '@/model/demande/Demande'
import { demandeStatusColor, demandeStatusTypes } from '../data/data'
import { situationTypes } from '@/model/demande/Demande'
import { situationFamilleTypes } from '@/model/demande/Demande'
import { cn } from '@/lib/utils'
import { Url } from 'url'
import { useDemandes } from '../context/demandes-context'
import { DemandeView } from './demande-view'

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

  const { contact, status, remarques,id,createdAt } = currentRow



  return (
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
         <DemandeView currentRow={currentRow} showContact={false} showAides={false} showDocuements={false}/>
        </ScrollArea>

        <SheetFooter className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          <Button  onClick={() => {
              setCurrentRow(currentRow)
              setOpen('edit')
            }}>
              Modifier la Demande
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

