

import { z } from 'zod';
import { contactSchema } from '../contact/Contact';
import { demandeSchema } from '../demande/Demande';


// Schéma pour le statut de la aide
const aideTypeSchema = z.union([
  z.literal('FinanciRe'),
  z.literal('AssistanceAdministrative')
]);
export type AideType = z.infer<typeof aideTypeSchema>;


const aideFrequenceSchema = z.union([
  z.literal('Mensuelle'),
  z.literal('BiMensuelle'),
  z.literal('Trimestrielle'),
  z.literal('Hebdomadaire'),
  z.literal('UneFois'),
]);
export type AideFrequence = z.infer<typeof aideFrequenceSchema>;

const aideSatusSchema = z.union([
  z.literal('EnCours'),
  z.literal('Expir'),

]);
export type AideStatus = z.infer<typeof aideSatusSchema>;
/*const aideStatusSchema = z.union([

  z.literal('suspendue'),
  z.literal('active'),

]);
export type AideStatus = z.infer<typeof aideStatusSchema>;*/

const aideCrediteurSchema = z.union([
  z.literal('LeBNFiciaire'),
  z.literal('UnCrAncier'),

]);
export type AideCredieteur = z.infer<typeof aideCrediteurSchema>;

export const versementLight = z.object({ id: z.number(),
  status: z.union([z.literal('Verse'), z.literal('AVerser')])
 })

// Schéma principal pour les aides
export const aideSchema = z.object({
  contact: contactSchema.omit({ aides: true, demandes: true, document: true }),
  id: z.number(),
  typeField: aideTypeSchema,
  montant: z.coerce.number(),
  dateAide: z.coerce.date(),
  dateExpiration: z.coerce.date().optional(),
  // paiementRecurrent: z.boolean(),
  frequence: aideFrequenceSchema,
  suspendue: z.boolean(),
  nombreVersements: z.coerce.number(),
  crediteur: aideCrediteurSchema,
  infosCrediteur: z.coerce.string().optional(),
  remarque: z.coerce.string().optional(),
  demande: demandeSchema,
  status: aideSatusSchema,
  reetudier: z.boolean(),
  versements : z.array(versementLight).optional(),

});
export type Aide = z.infer<typeof aideSchema>;
