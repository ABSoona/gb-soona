import { z } from 'zod';

export const attachmentTypesEnum = z.enum(['Contact', 'Demande', 'Suivi','Aide'])

export type AttachmentType =z.infer<typeof attachmentTypesEnum>

export const typeDocumentSchema = z.object({
  id: z.number(),
  label: z.string(),
  rattachement: attachmentTypesEnum,
  isInternal: z.boolean(),
  internalCode: z.string().optional(),
  createdAt: z.string(), // ou z.date() selon ton usage
  updatedAt: z.string(),
});

export type TypeDocument = z.infer<typeof typeDocumentSchema>;
