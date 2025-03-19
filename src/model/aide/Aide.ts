
import { z } from 'zod';
import { contactSchema } from '../contact/Contact';

// Schéma pour le statut de la aide
const aideTypeSchema = z.union([
  z.literal('FinanciRe'),
  z.literal('Alimentaire')
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

/*const aideStatusSchema = z.union([

  z.literal('suspendue'),
  z.literal('active'),

]);
export type AideStatus = z.infer<typeof aideStatusSchema>;*/

const aideCrediteurSchema = z.union([
  z.literal('LeBNFiciaire'),
  z.literal('UnCrAncier'),

]);
export type AideCredieteur= z.infer<typeof aideCrediteurSchema>;


// Schéma principal pour les aides
export const aideSchema = z.object({
  contact: contactSchema.omit({aides: true, demandes:true,document : true}),
  id: z.number(),
  typeField: aideTypeSchema,
  montant: z.coerce.number(),
  dateAide: z.coerce.date(),
  dateExpiration: z.coerce.date().optional(),
 // paiementRecurrent: z.boolean(),
  frequence : aideFrequenceSchema,
  suspendue: z.boolean(),
  nombreVersements: z.coerce.number(),
  crediteur : aideCrediteurSchema,
  infosCrediteur : z.coerce.string().optional() ,
  remarque : z.coerce.string().optional(),

});
export type Aide = z.infer<typeof aideSchema>;
