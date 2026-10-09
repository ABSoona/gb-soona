import { typeDocumentSchema } from '@/model/typeDocument/typeDocument';

import { z } from 'zod';

// Schéma principal pour les aides
export const documentSchema = z.object({
  id: z.string(),
  name:z.string().optional(),
  contenu: z.object({
    filename: z.string(),
    url: z.string()
  }),
  typeDocument: typeDocumentSchema,
  createdAt: z.coerce.date(),
  uploadedByBeneficiaire: z.boolean().optional(),
  consultedAt: z.coerce.date().nullable().optional(),
});
export type Document = z.infer<typeof documentSchema>;
