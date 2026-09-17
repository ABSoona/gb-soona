import TableauMensuel from '@/features/rapports/tableau-mensuel'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/rapports/tableau-mensuel')({
  component: TableauMensuel,
})
