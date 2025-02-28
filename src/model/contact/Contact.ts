import { Aide, aideSchema } from "../aide/Aide";


import { z } from 'zod';

// Schéma pour le statut de la contact
const contactStatusSchema = z.union([
  z.literal('active'),
  z.literal('en_attente'),
  z.literal('clôturée'),
  z.literal('refusée'),
]);
export type ContactStatus = z.infer<typeof contactStatusSchema>;


// Schéma pour la situation professionnelle
const situationProSchema = z.union([
  z.literal('sans_emploi'),
  z.literal('employé'),
  z.literal('indépendant'),
  z.literal('retraité'),
]);
export type SituationPro = z.infer<typeof situationProSchema>;

// Schéma pour les dettes
const detteSchema = z.object({
  nature: z.string(),
  montant: z.number(),
});
export type Dette = z.infer<typeof detteSchema>;

// Schéma principal pour les contacts
export const contactSchema = z.object({
  
  id: z.number(),
  numBeneficiaire:z.string(),
  nom: z.string(),
  prenom: z.string(),
  age: z.number(),
  situationFamiliale: z.string(),
  nombreEnfants: z.number(),
  agesEnfants: z.array(z.number()),
  situationProfessionnelle: situationProSchema,
  revenus: z.number(),
  revenusConjoint: z.number().optional(),
  loyer: z.number(),
  facturesEnergie: z.number(),
  autresCharges: z.number(),
  apl: z.number(),
  dettes:  z.number(),
  natureDettes:z.string(),
  autresAides: z.string(),
  resteAVivre: z.number(),
  aides: z.array(aideSchema),
  status: contactStatusSchema,
  remarques: z.string().optional(),
  createdAt :z.coerce.date(),
  updatedAt:z.coerce.date(),
  email:z.string(),
  telephone:z.string(),
  adresse:z.string(),
  codePostal:z.number(),
  ville:z.string(),

});
export type Contact = z.infer<typeof contactSchema>;
