import { z } from 'zod';

import { documentSchema } from '../document/Document';
import { userSchema } from '../user/User';


export const VisiteSatusSchema = z.union([
  z.literal('Programee'),
  z.literal('Realisee'),
  z.literal('Annulee'),
  z.literal('Planifiee'),

]);
export type VisiteStatus= z.infer<typeof VisiteSatusSchema>;
export const visiteSchema = z.object({

  createdAt: z.coerce.date(),
  id: z.number(),
  updatedAt: z.coerce.date(),
  dateVisite: z.coerce.date().optional(),
  document: documentSchema.optional(),
  acteur : userSchema,
  note :z.string().optional(),
  status:VisiteSatusSchema
})

export type Visite = z.infer<typeof visiteSchema>;
