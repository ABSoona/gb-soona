import { getCurrentUser, updateUser } from '@/api/user/userService'
import { PasswordInput } from '@/components/password-input'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { GenerateFakeData } from '@/test/seed'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// Schéma du formulaire avec mot de passe optionnel
const userFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'EmailoObligatoire.' })
    .email({ message: 'Email invalide.' }),
  firstName: z.string().min(1, { message: 'Prénom requis' }),
  lastName: z.string().min(1, { message: 'Nom requis' }),
  password: z.string().transform((pwd) => pwd.trim()),
  confirmPassword: z.string().optional().transform((pwd) => pwd?.trim() ?? ''),
})
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== '') {
      if (password === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Password is required.',
          path: ['password'],
        })
      }

      if (password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Le mot de passe doit contenir au moins 8 caractères.',
          path: ['password'],
        })
      }

      if (!password.match(/[a-z]/)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Le mot de passe doit contenir au moins une lettre minuscule.',
          path: ['password'],
        })
      }

      if (!password.match(/\d/)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Le mot de passe doit contenir au moins un chiffre.',
          path: ['password'],
        })
      }

      if (password !== confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Les mots de passe ne correspondent pas.",
          path: ['confirmPassword'],
        })
      }
    }
  })
type UserFormValues = z.infer<typeof userFormSchema>

export function UserForm() {
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
    },
  })

  // Charger les données utilisateur et pré-remplir le formulaire
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser()
        setUserId(user.id)

        // Reset une seule fois quand les données sont prêtes
        form.reset({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          password: '',
        })

        setIsLoading(false)
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les informations utilisateur',
          variant: 'destructive',
        })
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [form])

  const onSubmit = async (data: UserFormValues) => {
    if (!userId) return
    const { confirmPassword, ...rest } = data

    const payload = {
      ...rest,
      ...(rest.password ? {} : { password: undefined }),
    }

    try {
      await updateUser(userId, payload)
      toast({
        title: 'Profil mis à jour',
        description: 'Les informations de votre compte ont été enregistrées.',
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'La mise à jour a échoué.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return <p>Chargement du formulaire...</p>
  }
  const isPasswordTouched = !!form.formState.dirtyFields.password
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='firstName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prénom</FormLabel>
              <FormControl>
                <Input placeholder='Votre prénom' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='lastName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input placeholder='Votre nom' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='exemple@email.com' {...field} />
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
              <FormLabel >
                Mot de passe
              </FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder='Laisser vide si inchangé'
                  className='col-span-4'
                  {...field}
                />
              </FormControl>
              <FormMessage className='col-span-4 col-start-3' />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem className='space-y-1'>
              <FormLabel >
                Confirmer le mot de passe
              </FormLabel>
              <FormControl>
                <PasswordInput
                  disabled={!isPasswordTouched}
                  placeholder='e.g., S3cur3P@ssw0rd'
                  className='col-span-4'
                  {...field}
                />
              </FormControl>
              <FormMessage className='col-span-4 col-start-3' />
            </FormItem>
          )}
        />

        <Button type='submit'>Mettre à jour</Button> <GenerateFakeData />
      </form>
    </Form>
  )
}
