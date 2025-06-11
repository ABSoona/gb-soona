import { z } from 'zod';


export const invitationSchema = z.object({

  createdAt: z.coerce.date(),
  id: z.number(),
  updatedAt: z.coerce.date(),
  message :z.string().optional(),
  role :z.string(),
  email :z.string(),
  token :z.string(),
  used : z.boolean()
})

export type Invitation = z.infer<typeof invitationSchema>;
