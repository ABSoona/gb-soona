
import { z } from 'zod';


// Schéma pour le statut de la aide
const notificationTypeSchema = z.union([
  z.literal('NouvelleDemande'),
  z.literal('DemandeEnVisite'),
  z.literal('DemandeEnCommission'),
  z.literal('ContactBan'),
  z.literal('AideExpir'),
  z.literal('ErreursDemandes')

]);
export type NotificationType = z.infer<typeof notificationTypeSchema>;


// Schéma principal pour les aides
export const NotificationPreferenceSchema = z.object({

  id: z.number(),
  typeField: notificationTypeSchema,
  active: z.boolean(),

});
export type NotificationPreferenceferences = z.infer<typeof NotificationPreferenceSchema>;


export const notificationTypes =
  [
    { label: 'NouvelleDemande', value: 'NouvelleDemande', description: '' },
    { label: 'DemandeEnVisite', value: 'DemandeEnVisite' },
    { label: 'DemandeEnCommission', value: 'DemandeEnCommission' },
    { label: 'ContactBan', value: 'ContactBan' },
    { label: 'AideExpir', value: 'AideExpir' },
    { label: 'ErreursDemandes', value: 'ErreursDemandes' },

  ] as const