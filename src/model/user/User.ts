import { z } from 'zod';



const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('invited'),
  z.literal('suspended'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

const userRoleSchema = z.union([
  z.literal('admin'),
  z.literal('externe'),
  z.literal('user'),

])

export type UserRole = z.infer<typeof userRoleSchema>

const userSchema = z.object({
  createdAt: z.coerce.date(),
  email: z.string(),
  firstName: z.string(),
  id: z.string(),
  lastName: z.string(),
  role: userRoleSchema,
  roles: z.array(userRoleSchema),
  updatedAt: z.coerce.date(),
  username: z.string(),
  status: userStatusSchema,
  password: z.string(),
  token: z.string().optional()
});
export type User = z.infer<typeof userSchema>


