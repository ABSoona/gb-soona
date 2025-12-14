

import { IconExternalLink, IconShield, IconUsersGroup } from "@tabler/icons-react";
import { z } from 'zod';
import { contactSchema } from '../contact/Contact';
import { userSchema } from "../user/User";
import { E } from "node_modules/@faker-js/faker/dist/airline-CBNP41sR";

// Schéma pour le statut de la demande
export const demandeStatusSchema = z.union([
  z.literal('recue'),
  z.literal('EnAttenteDocs'),
  z.literal('en_visite'),
  z.literal('en_commision'),
  z.literal('EnCours'),
  z.literal('clôturée'),
  z.literal('refusée'),
  z.literal('Abandonnée'),
  z.literal('EnAttente'),
  
]);
export type DemandeStatus = z.infer<typeof demandeStatusSchema>;
const situationProSchema = z.union([
  z.literal('sans_emploi'),
  z.literal('employé'),
  z.literal('indépendant'),
  z.literal('retraité'),
  z.literal('Inconnu'),
]);

const situationFamSchema = z.union([
  z.literal('marié'),
  z.literal('divorcé'),
  z.literal('veuf'),
  z.literal('célibataire'),
  z.literal('Inconnu'),
]);
const categorieSchema = z.union([
  z.literal('LourdementEndett'),
  z.literal('NCessiteux'),
  z.literal('Pauvre')
]);
const activityTypeSchema = z.union([
  z.literal('priseContactEchec'),
  z.literal('priseContactReussie'),
  z.literal('visite'),
  z.literal('statusUpdate'),
  z.literal('note'),
  z.literal('docAjout'),
  z.literal('abandon'),
  z.literal('accept'),
  z.literal('refuse'),
  z.literal('expiration'),
  z.literal('docsRequest'),

]);

export type ActivityType = z.infer<typeof activityTypeSchema>;

export const DemandeActivitySchema = z.object({
  id: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  message: z.string(),
  titre: z.string(),
  typeField: activityTypeSchema,
  aideId: z.coerce.number().optional(),
  user: z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
  }).optional(),
});
export type DemandeActivity = z.infer<typeof DemandeActivitySchema>;

export type categorieDemandeur = z.infer<typeof categorieSchema>;
export type SituationPro = z.infer<typeof situationProSchema>;
// Schéma principal pour les demandes
export const demandeSchema = z.object({
  id: z.number(),
  contact: contactSchema.omit({ demandes: true }),
  status: demandeStatusSchema,
  remarques: z.string().optional(),
  createdAt: z.coerce.date(),
  decisionDate: z.coerce.date().optional(),
  situationFamiliale: situationFamSchema,
  nombreEnfants: z.coerce.number().min(-1).max(10),
  nombrePersonnes: z.coerce.number().min(-1).max(10),
  agesEnfants: z.string().optional().or(z.literal('')),
  situationProfessionnelle: situationProSchema.optional(),
  situationProConjoint: z
  .string()
  .optional()
  .or(z.literal('').transform(() => undefined)),
  revenus: z.coerce.number(),
  revenusConjoint: z
  .preprocess((val) => (val === '' ? undefined : Number(val)), z.number().optional()),
  loyer: z.coerce.number(),
  facturesEnergie: z.coerce.number(),
  autresCharges: z.coerce.number(),
  apl: z.coerce.number(),
  dettes: z.coerce.number(),
  natureDettes: z.string().optional(),
  autresAides: z.string().optional(),
  categorieDemandeur: categorieSchema.optional().nullable(),
  demandeActivities: z.array(DemandeActivitySchema),
  acteur : userSchema,
  proprietaire : userSchema,
  dernierContact:z.string().optional(),
  derniereRelance:z.string().optional(),
  nombreRelances:z.coerce.number().optional(),
  recommandation:z.string().optional(),
  telegramComiteeAction : z.boolean()

});





export type Demande = z.infer<typeof demandeSchema>;// Schéma pour le statut de la contact
//A deplacer plus tard dans Contact/data
export const situationFamilleTypes = [
  {
    label: 'Marié(e)',
    value: 'marié',
    icon: IconShield,
  },
  {
    label: 'Divorcé(e)',
    value: 'divorcé',
    icon: IconUsersGroup,
  },
  {
    label: 'Célibataire',
    value: 'célibataire',
    icon: IconExternalLink,
  },
  {
    label: 'Veuf(ve)',
    value: 'veuf',
    icon: IconExternalLink,
  },
  {
    label: 'Inconnue',
    value: 'Inconnu',
    icon: IconExternalLink,
  },
] as const;
//A deplacer plus tard dans Contact/data
export const situationTypes = [
  {
    label: 'Sans emploi',
    value: 'sans_emploi',
    icon: IconShield,
  },
  {
    label: 'Employé',
    value: 'employé',
    icon: IconUsersGroup,
  },
  {
    label: 'Indépendant',
    value: 'indépendant',
    icon: IconExternalLink,
  },
  {
    label: 'Retraité',
    value: 'retraité',
    icon: IconExternalLink,
  },
  {
    label: 'Inconnue',
    value: 'Inconnu',
    icon: IconExternalLink,
  },
] as const


