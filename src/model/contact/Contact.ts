import { Aide, aideSchema } from "../aide/Aide";


import { z } from 'zod';
export const contactStatusSchema = z.union([
  z.literal('active'),
  z.literal('en_attente'),
  z.literal('clôturée'),
  z.literal('refusée'),
]);
export type ContactStatus = z.infer<typeof contactStatusSchema>;
// Schéma pour la situation professionnelle


// Schéma pour les dettes
const detteSchema = z.object({
  nature: z.string(),
  montant: z.number(),
});
export type Dette = z.infer<typeof detteSchema>;

// Schéma principal pour les contacts
export const contactSchema = z.object({
  //inforamtion fixe
  id: z.number(),
  numBeneficiaire:z.string(),
  nom: z.string(),
  prenom: z.string(),
  age: z.number(),
  email:z.string(),
  telephone:z.string(),
  adresse:z.string(),
  codePostal:z.number(),
  ville:z.string(),
  //le reste a mettre dans demande  
  aides: z.array(aideSchema),
  status: contactStatusSchema,
  remarques: z.string().optional(),
  createdAt :z.coerce.date(),
  updatedAt:z.coerce.date(),
  

});
export type Contact = z.infer<typeof contactSchema>;
