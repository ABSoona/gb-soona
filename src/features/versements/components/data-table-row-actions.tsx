import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Versement } from '@/model/versement/versement'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { Check, Paperclip } from 'lucide-react'
import { useDocumentActions } from '@/features/documents/useDocumentActions'
import { useTypeDocumentService } from '@/api/typeDocument/typeDocumentService'
import { TypeDocument } from '@/model/typeDocument/typeDocument'

interface DataTableRowActionsProps {
  row: Row<Versement>

}

import { useRef } from 'react'
import { useVersementService } from '@/api/versement/versementService'
// ...

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { handleFileUpload } = useDocumentActions({ versements: { id: row.original.id } }); // versements mal nommé dans l'api il doit ^tre versement (sans s)
      
  const { updateVersement } = useVersementService({where:{id:{equals : row.original.id}}});
  const { typeDocuments = [] }: { typeDocuments: TypeDocument[] } = useTypeDocumentService({
    where: { internalCode: { equals: 'preuve_virement' } }
  })

  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && typeDocuments.length > 0) {
      await handleFileUpload(row.original.aide.contact.id, file, typeDocuments[0].id, 0, 0, row.original.id)
      e.target.value = ''
    //  refetch()
      await updateVersement(row.original.id,{status:'Verse'})
     
    }
  }
  const updateStatus = async () => {
    await updateVersement(row.original.id,{status:'Verse'})
  }


  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent  className="w-[250px]">
          <DropdownMenuItem
            onClick={() => inputRef.current?.click()}
          >
           {!row.original.document? "Attacher la preuve":"Remplacer la preuve"} 
            <DropdownMenuShortcut>
              <Paperclip size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={updateStatus}
          >
            Marquer comme versé
            <DropdownMenuShortcut>
              <Check  size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Input file invisible */}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </>
  )
}
