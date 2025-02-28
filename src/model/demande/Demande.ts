import { Contact, contactSchema } from './../contact/Contact';

import { z } from 'zod';

// Schéma pour le statut de la demande
export const demandeStatusSchema = z.union([
  z.literal('recue'),
  z.literal('en_visite'),
  z.literal('en_commision'),
  z.literal('clôturée'),
  z.literal('refusée'),
]);
export type DemandeStatus = z.infer<typeof demandeStatusSchema>;

// Schéma principal pour les demandes
export const demandeSchema = z.object({
  id: z.number(),
  contact: contactSchema,
  status: demandeStatusSchema,
  remarques: z.string().optional(),
  createdAt :z.coerce.date(),
});
export type Demande = z.infer<typeof demandeSchema>;
