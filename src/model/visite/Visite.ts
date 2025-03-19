import { z } from 'zod'
import {  contactSchema } from '../contact/Contact';
export const visiteSchema = z.object({
  contact : contactSchema.omit({visites: true}) ,
  createdAt: z.coerce.date(),
  id: z.coerce.string(),
  updatedAt:  z.coerce.date(),
  dateVisite:  z.coerce.date(),
  rapportVisite :  z.coerce.string(),
})

export type Visite = z.infer<typeof visiteSchema>;
