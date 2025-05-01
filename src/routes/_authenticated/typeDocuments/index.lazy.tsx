import SettingsTypeDocument from '@/features/typeDocuments'
import { TypeDocumentForm } from '@/features/typeDocuments/components/type-document-form'
import { createLazyFileRoute } from '@tanstack/react-router'


export const Route = createLazyFileRoute('/_authenticated/typeDocuments/')({
  component: SettingsTypeDocument,
})
 