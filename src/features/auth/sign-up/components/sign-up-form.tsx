'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { HTMLAttributes, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useInvitationService } from '@/api/invitation/invitationService'
import { createUserWithUnvitation } from '@/api/user/userService'
import { PasswordInput } from '@/components/password-input'
import { Button } from '@/components/ui/button'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { userTypes } from '@/features/users/data/data'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { UserRole } from '@/model/user/User'

type SignUpFormProps = HTMLAttributes<HTMLDivElement>

const formSchema = z.object({
  firstName: z.string().min(1, { message: 'Le prénom est requis' }),
  lastName: z.string().min(1, { message: 'Le nom est requis' }),
  email: z.string().email({ message: 'Email invalide' }),
  password: z.string().min(7, { message: 'Minimum 7 caractères' }),
  confirmPassword: z.string(),
  role: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],

})

export function SignUpForm({ className, ...props }: SignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const searchParams: { token: string } = useSearch({ from: '/(auth)/sign-up' })
  const token = searchParams.token

  const { invitations } = useInvitationService({
    where: { token: { equals: token } },
  })
  const navigate = useNavigate()
  const invitation = invitations[0]

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',

    },
  })

  useEffect(() => {
    if (invitation?.email) {
      form.setValue('email', invitation.email)
    }
    if (invitation?.role) {
      form.setValue('role', invitation.role)
    }
  }, [invitation, form])

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!invitation) {
      toast({ title: 'Invitation invalide', variant: 'destructive' })
      return
    }

    setIsLoading(true)

    try {
      const role = data.role as UserRole
      await createUserWithUnvitation({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        token: token, // essentiel pour valider le lien
        username: data.email,
        roles: [role],
        role: role,
        hasAccess:true
      })
      toast({ title: '🎉 Compte créé avec succès !' })
      form.reset()
      await new Promise((resolve) => setTimeout(resolve, 1000)) // petite pause visuelle
      navigate({ to: '/sign-in' })
    } catch (error) {
      console.error(error)

    } finally {
      setIsLoading(false)
    }
  }
  const getRoleLabel = (value: string) => {
    const match = userTypes.find((item) => item.value === value);
    return match?.label || value;
  };

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid gap-2'>
            <FormField
              control={form.control}
              name='firstName'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Prénom</FormLabel>
                  <FormControl>
                    <Input placeholder='Jean' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='lastName'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder='Dupont' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder='nom@exemple.com' {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Rôle</FormLabel>
                  <FormControl>
                    <Input placeholder='' value={getRoleLabel(field.value)} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder='********' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Confirmer</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder='********' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className='mt-2 w-full' disabled={isLoading}>
              {isLoading ? 'Création en cours...' : 'Créer un compte'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
