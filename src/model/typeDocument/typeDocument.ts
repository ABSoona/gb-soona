import { z } from 'zod';

export const typeDocumentSchema = z.object({
  id: z.number(),
  label: z.string(),
  rattachement: z.enum(['Contact', 'Demande', 'Suivi','Aide']),
  isInternal: z.boolean(),
  internalCode: z.string().optional(),
  createdAt: z.string(), // ou z.date() selon ton usage
  updatedAt: z.string(),
});

export type TypeDocument = z.infer<typeof typeDocumentSchema>;
