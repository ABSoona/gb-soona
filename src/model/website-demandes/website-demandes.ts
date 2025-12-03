import { z } from "zod";

//export const statusSchema = z.enum(["EnCours", "EnErreur", "Trait", "Recue"]);

export const wsDemandeStatusSchema = z.union([
  z.literal('EnCours'),
  z.literal('EnErreur'),
  z.literal('Trait'),
  z.literal('Recue')
]);
export type WsDemandeStatus = z.infer<typeof wsDemandeStatusSchema>;

export const websiteDemandeSchema = z.object({
  id: z.string(),
  contactId: z.number().optional(),
  nomDemandeur: z.string(),
  prenomDemandeur: z.string(),
  forceNewContact :z.boolean().default(false),
  telephoneDemandeur: z.string(),
  emailDemandeur: z.string().email(),
  adresseDemandeur: z.string(),
  codePostalDemandeur: z.number().or(z.literal("")).transform(val => Number(val)),
  villeDemandeur: z.string(),
  situationProfessionnelle: z.string(),
  situationFamiliale: z.string(),
  revenus: z.number(),
  revenusConjoint: z.number(),
  nombreEnfants: z.number(),
  agesEnfants: z.string(),
  situationProConjoint: z.string(),
  autresAides: z.string(),
  autresCharges: z.number(),
  apl: z.number(),
  dettes: z.number(),
  natureDettes: z.string(),
  facturesEnergie: z.number(),
  remarques: z.string(),
  status: wsDemandeStatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  modeBeneficiaire: z.enum(["nouveau", "existant"]).optional().default("nouveau"),
});

export type WebsiteDemande = z.infer<typeof websiteDemandeSchema>;
