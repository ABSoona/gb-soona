

import { z } from 'zod';
import { contactSchema } from '../contact/Contact';

// Schéma pour le statut de la demande
export const demandeStatusSchema = z.union([
  z.literal('recue'),
  z.literal('en_visite'),
  z.literal('en_commision'),
  z.literal('clôturée'),
  z.literal('refusée'),
]);
export type DemandeStatus = z.infer<typeof demandeStatusSchema>;
const situationProSchema = z.union([
  z.literal('sans_emploi'),
  z.literal('employé'),
  z.literal('indépendant'),
  z.literal('retraité'),
]);

const situationFamSchema = z.union([
  z.literal('marié'),
  z.literal('divorcé'),
  z.literal('veuf'),
  z.literal('célibataire'),
]);


export type SituationPro = z.infer<typeof situationProSchema>;
// Schéma principal pour les demandes
export const demandeSchema = z.object({
  id: z.number(),
  contact: contactSchema,
  status: demandeStatusSchema,
  remarques: z.string().optional(),
  createdAt :z.coerce.date(),
  situationFamiliale: situationFamSchema,
  nombreEnfants: z.coerce.number(),
  agesEnfants: z.string().optional().or(z.literal('')),
  situationProfessionnelle: situationProSchema,
  situationProConjoint: situationProSchema.optional(),
  revenus: z.coerce.number(),
  revenusConjoint: z.coerce.number().optional(),
  loyer: z.coerce.number(),
  facturesEnergie: z.coerce.number(),
  autresCharges: z.coerce.number(),
  apl: z.coerce.number(),
  dettes:  z.coerce.number(),
  natureDettes:z.string().optional(),
  autresAides: z.string().optional(),
  
});
export type Demande = z.infer<typeof demandeSchema>;// Schéma pour le statut de la contact


