'use client'

import { useMemo } from 'react'
import { useDocumentService } from '@/api/document/documentService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { toast } from '@/hooks/use-toast'
import { DocumentsManager } from '@/features/documents/documents-manager'
import { Document } from '@/model/document/Document'
import { AttachDocumentsPopover } from './attach-documents-popover'

interface Props {
  aideId: number
  demandeId?: number
}

export function AideDocumentsCard({ aideId, demandeId }: Props) {
  const { documents: demandeDocuments } = useDocumentService({
    where: demandeId ? { demande: { id: demandeId } } : { id: { equals: '__none__' } },
  })

  const {
    documents: attachedDocuments,
    loading: isLoadingAttachedDocuments,
    updateDocument,
  } = useDocumentService({ where: { aide: { id: aideId } } })

  const attachedIds = useMemo(
    () => new Set(attachedDocuments.map((doc: Document) => doc.id)),
    [attachedDocuments]
  )
  const availableDocuments = useMemo(
    () => demandeDocuments.filter((doc: Document) => !attachedIds.has(doc.id)),
    [demandeDocuments, attachedIds]
  )

  const handleAttach = async (documentIds: string[]) => {
    try {
      await Promise.all(documentIds.map((id) => updateDocument(id, { aide: { id: aideId } })))
      toast({ title: documentIds.length > 1 ? 'Justificatifs attachés avec succès' : 'Justificatif attaché avec succès' })
    } catch (_error) {
      toast({ title: "Erreur lors de l'attachement du justificatif", variant: 'destructive' })
    }
  }

  const handleDetach = async (docId: string) => {
    try {
      await updateDocument(docId, { aide: null })
      toast({ title: 'Justificatif retiré de cette aide' })
    } catch (_error) {
      toast({ title: 'Erreur lors du retrait du justificatif', variant: 'destructive' })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Justificatifs de l'aide</CardTitle>
        <AttachDocumentsPopover documents={availableDocuments} onAttach={handleAttach} />
      </CardHeader>
      <CardContent>
        {isLoadingAttachedDocuments ? (
          <div className="flex justify-center py-6">
            <Spinner size="large" />
          </div>
        ) : attachedDocuments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun justificatif attaché à cette aide.</p>
        ) : (
          <DocumentsManager
            documents={attachedDocuments}
            onDelete={handleDetach}
            deleteLabel="Retirer de cette aide"
            attachement="Aide"
          />
        )}
      </CardContent>
    </Card>
  )
}
