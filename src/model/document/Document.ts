
import { z } from 'zod';

// Schéma principal pour les aides
export const documentSchema = z.object({
    id: z.string(),
    contenu : z.any()
  });
  export type Document = z.infer<typeof documentSchema>;
  