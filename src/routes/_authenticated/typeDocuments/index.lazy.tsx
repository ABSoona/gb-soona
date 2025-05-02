import SettingsTypeDocument from '@/features/typeDocuments'
import { createLazyFileRoute } from '@tanstack/react-router'


export const Route = createLazyFileRoute('/_authenticated/typeDocuments/')({
  component: SettingsTypeDocument,
})
