import { z } from 'zod';
import { aideSchema } from '../aide/Aide';
import { userSchema } from '../user/User';

export const decisionTypeSchema = z.union([
  z.literal('Approbation'),
  z.literal('Refus'),
  z.literal('Ajournement'),
]);
export type DecisionType = z.infer<typeof decisionTypeSchema>;

export const comiteSchema = z.object({
  id: z.number(),
  date: z.coerce.date(),
  // Uniquement renseignes par la requete de liste GET_COMITES (absents
  // quand Comite est imbrique dans une Decision).
  nombreTraites: z.number().optional(),
  nombreApprouves: z.number().optional(),
  nombreRefuses: z.number().optional(),
  nombreAjournes: z.number().optional(),
});
export type Comite = z.infer<typeof comiteSchema>;

// Instantane financier fige au moment d'une decision d'Approbation (voir
// src/decision/decision.service.ts - createSituationSnapshot).
export const decisionSituationSnapshotSchema = z.object({
  situationFamiliale: z.string().nullable().optional(),
  situationProfessionnelle: z.string().nullable().optional(),
  nombreEnfants: z.number().nullable().optional(),
  revenus: z.number().nullable().optional(),
  revenusConjoint: z.number().nullable().optional(),
  loyer: z.number().nullable().optional(),
  facturesEnergie: z.number().nullable().optional(),
  dettes: z.number().nullable().optional(),
  natureDettes: z.string().nullable().optional(),
  autresAides: z.string().nullable().optional(),
  autresCharges: z.number().nullable().optional(),
  apl: z.number().nullable().optional(),
  remarques: z.string().nullable().optional(),
});
export type DecisionSituationSnapshot = z.infer<typeof decisionSituationSnapshotSchema>;

// Reference legere vers la demande concernee (utilisee sur la page
// Comites, pas besoin du schema demandeSchema complet ici).
export const decisionDemandeRefSchema = z.object({
  id: z.number(),
  contact: z
    .object({
      id: z.number(),
      nom: z.string().nullable().optional(),
      prenom: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});
export type DecisionDemandeRef = z.infer<typeof decisionDemandeRefSchema>;

export const decisionSchema = z.object({
  id: z.number(),
  type: decisionTypeSchema,
  motivation: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  comite: comiteSchema,
  acteur: userSchema.optional().nullable(),
  aides: z.array(aideSchema).optional(),
  situationHistory: decisionSituationSnapshotSchema.nullable().optional(),
  demande: decisionDemandeRefSchema.nullable().optional(),
});
export type Decision = z.infer<typeof decisionSchema>;
