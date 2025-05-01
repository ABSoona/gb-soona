import { TypeDocument, typeDocumentSchema } from '@/model/typeDocument/typeDocument';

import { z } from 'zod';

// Schéma principal pour les aides
export const documentSchema = z.object({
    id: z.string(),
    contenu: z.object({
      filename: z.string(),
      url: z.string()
    }),
    typeDocument: typeDocumentSchema,
    createdAt :z.coerce.date(),
  });
  export type Document = z.infer<typeof documentSchema>;
  