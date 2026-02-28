import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Landmark, Paperclip, FileCheck } from 'lucide-react'
import { Row } from '@tanstack/react-table'
import { Versement } from '@/model/versement/versement'
import DocumentPreviewSheet from '@/features/documents/ocumentPreviewSheet'
import { previewDocument, useDocumentService } from '@/api/document/documentService'
import { toast } from '@/hooks/use-toast'
import { Document } from '@/model/document/Document'
import { attachmentTypesEnum } from '@/model/typeDocument/typeDocument'
import { GET_DOCUMENTS } from '@/api/document/queries'
import { useLazyQuery } from '@apollo/client'
interface DataTableRowDocumentsProps {
  row: Row<Versement>,

}

export function DataTableRowDocuments({ row }: DataTableRowDocumentsProps) {
  const [open, setOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [document, setDocument] = useState<Document | null>(null)
  const [previewType, setPreviewType] = useState<string | null>(null)

  const openPreview = async (doc: Document) => {
    try {
      const { url, type } = await previewDocument(doc)
      if (type === 'unsupported') {
        toast({ title: 'Format non supporté pour la prévisualisation', variant: 'destructive' })
      } else {
        setPreviewUrl(url)
        setDocument(doc)
        setPreviewType(type || 'unsupported')
        setOpen(true)
      }
    } catch (err) {
      toast({ title: 'Erreur lors de la prévisualisation', variant: 'destructive' })
    }
  }

  const [loadDocuments, { data }] = useLazyQuery(GET_DOCUMENTS)

  const preuve = row.original.document

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='flex h-5 w-8 p-0 data-[state=open]:bg-muted'>
            <Paperclip className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[250px]'>
          <DropdownMenuItem
            onClick={async () => {
              const contactId = row.original.aide?.contact?.id
              if (!contactId) return toast({ title: "Contact introuvable", variant: "destructive" })

              const res = await loadDocuments({
                variables: {
                  where: {
                    contact: { id: contactId  }
                 
                  },
                  take: 1,
                }
              })

              const rib = res.data?.documents?.filter((e:Document)=>(e.typeDocument.internalCode==='rib'))[0]
              if (rib) {
                openPreview(rib)
              } else {
                toast({ title: "Aucun RIB trouvé", variant: "destructive" })
              }
            }}
          >
            Voir le Rib du bénéficiaire
            <DropdownMenuShortcut>
              <Landmark size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={!preuve} onClick={() => preuve && openPreview(preuve)}>
            Voir la preuve de virement
            <DropdownMenuShortcut>
              <FileCheck size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DocumentPreviewSheet
        open={open}
        onOpenChange={setOpen}
        previewUrl={previewUrl}
        document={document}
        previewType={previewType}
        doctypeAttachment={'Aide'}
        showType={false}
      />
    </>
  )
}
