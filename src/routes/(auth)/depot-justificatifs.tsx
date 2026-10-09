import DepotJustificatifs from '@/public/documents/depot-justificatifs'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/(auth)/depot-justificatifs')({
  component: DepotJustificatifs,
  validateSearch: z.object({
    token: z.string(),
  }),
})
