
import { z } from "zod";
import { aideSchema } from "../aide/Aide";
import { documentSchema } from "../document/Document";


export const VersementSatusSchema = z.union([
  z.literal('AVerser'),
  z.literal('Verse'),
  z.literal('Planifie'),

]);
export type VersementStatus= z.infer<typeof VersementSatusSchema>;


export const versementSchema: z.ZodType<any> = z.object({
  id: z.number(),
  aide: z.lazy(() => aideSchema),
  montant: z.coerce.number(),
  dataVersement: z.coerce.date(),
  status: VersementSatusSchema,
  document: documentSchema.optional(),
});
export type Versement = z.infer<typeof versementSchema>;


