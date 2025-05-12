
import FicheVisiteDownload from '@/public/demandes/fiche-visite-pdf'
import {  createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/(auth)/demandes/$id/fiche-visite-pdf')({
  component: FicheVisiteDownload,
  validateSearch: z.object({
    token: z.string(),
  }),

})
