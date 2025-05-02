'use client'

import { Button } from '@/components/ui/button'
import { IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { TypeDocumentDialog } from './type-document-dialog'

export function TypeDocumentPrimaryButtons() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <IconPlus className="mr-2 h-4 w-4" />
        Ajouter un type de document
      </Button>

      <TypeDocumentDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
