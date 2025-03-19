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
import { Contact } from '@/model/contact/Contact'
import { contactStatusColor, contactStatusTypes } from '../data/data'
import { cn } from '@/lib/utils'
import { Url } from 'url'
import { useContacts } from '../context/contacts-context'
import { columns } from '@/features/demandes/components/demandes-columns'
import { DemandesTable, detailOpenOption } from '@/features/demandes/components/demandes-table'
import DemandesProvider from '@/features/demandes/context/demandes-context'
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
         <ContactView currentRow={currentRow} showDetailIn={detailOpenOption.sheet}/>
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

function DetailRow({ label, value, link }: { label: string; value: React.ReactNode; link?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center w-4/5">
        <span className="font-medium text-gray-700 whitespace-nowrap label-style">{label}</span>
      </div>
      <div className="w-1/2 text-left whitespace-nowrap overflow-hidden truncate value-style">
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-500 hover:underline">
            {value}
          </a>
        ) : (
          value
        )}
      </div>
    </div>
  );
}

function DetailMultiLineRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        <span className="font-medium text-gray-700 whitespace-nowrap label-style">{label}</span>
       
      </div>
      <div className="text-left multiline-value-style whitespace-pre-line"  >{value}</div>
    </div>
  )
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-md whitespace-nowrap overflow-hidden truncate">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-bold whitespace-nowrap overflow-hidden truncate ">
        {value}
      </CardContent>
    </Card>
  )
}
