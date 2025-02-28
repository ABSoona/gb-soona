
import { z } from 'zod';

// Schéma pour le statut de la aide
const aideTypeSchema = z.union([
  z.literal('active'),
  z.literal('en_attente'),
  z.literal('clôturée'),
  z.literal('refusée'),
]);
export type AideStatus = z.infer<typeof aideTypeSchema>;



// Schéma principal pour les aides
export const aideSchema = z.object({
  id: z.string(),
  typeField: aideTypeSchema,
  montant: z.number(),
  dateAide: z.coerce.date(),
  dateExpiration: z.coerce.date().optional(),
  paiementRecurrent: z.boolean(),
});
export type Aide = z.infer<typeof aideSchema>;
