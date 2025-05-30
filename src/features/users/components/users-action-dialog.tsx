'use client'

import { createUser, updateUser } from '@/api/user/userService'
import { PasswordInput } from '@/components/password-input'
import { SelectDropdown } from '@/components/select-dropdown'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { toast } from '@/hooks/use-toast'
import { User, UserRole, UserStatus } from '@/model/user/User'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { userTypes } from '../data/data'
import { Switch } from '@/components/ui/switch'
import { useUserServicev2 } from '@/api/user/userService.v2'

const formSchema = z
  .object({
    firstName: z.string().min(1, { message: 'First Name is required.' }),
    lastName: z.string().min(1, { message: 'Last Name is required.' }),


    email: z
      .string()
      .min(1, { message: 'Email est obligatoir.' })
      .email({ message: 'Email invalide.' }),
    password: z.string().transform((pwd) => pwd.trim()),
    role: z.string().min(1, { message: 'Role is required.' }),
    confirmPassword: z.string().transform((pwd) => pwd.trim()),
    isEdit: z.boolean(),
    adresseRue: z.string().optional(),
    adresseCodePostal: z.string().optional(),
    adresseVille: z.string().optional(),
    hasAccess: z.boolean(),
    superieurId : z.string().optional()
  })
  .superRefine(({ isEdit, hasAccess, password, confirmPassword,superieurId }, ctx) => {
    if ((!isEdit && hasAccess) || (isEdit && password !== '')) {
      if (password === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Le mot de passe est obligatoire.',
          path: ['password'],
        })
      }

      if (password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Le mot de passe doit contenir au moins caractères.',
          path: ['password'],
        })
      }

      if (!password.match(/[a-z]/)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Le mot de passe doit contenir au moins une miniscule.',
          path: ['password'],
        })
      }

      if (!password.match(/\d/)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Le mot de passe doit contenir au moins un chiffre',
          path: ['password'],
        })
      }

      if (password !== confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La confirmation de mot de passe ne correspond pas.",
          path: ['confirmPassword'],
        })
      }
      if (!hasAccess && superieurId==undefined ){
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Un utilisateur sans accès doit avoir un membre contact ",
          path: ['superieurId'],
        })
      }
    }
  })
type UserForm = z.infer<typeof formSchema>


interface Props {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({ currentRow, open, onOpenChange }: Props) {
  const queryClient = useQueryClient()
  const isEdit = !!currentRow
  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
        ...currentRow,
        password: '',
        confirmPassword: '',
        superieurId : currentRow?.superieur?.id,
        isEdit,
      }
      : {
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        hasAccess: true,
        password: '',
        confirmPassword: '',
        isEdit,
      },
  })
    const { users } = useUserServicev2(
       { where: { role: { not: "visiteur" } } } 
    );
  const avecAcces = useWatch({ control: form.control, name: 'hasAccess' });
  const onSubmit = async (values: UserForm) => {
    // Filtrer les champs inutiles pour l'API
    let status: UserStatus = 'active';
    let role: UserRole = values.role as UserRole;
    const password = !isEdit && !values.hasAccess ? Math.random().toString(36).slice(-10) : values.password;
    const userPayload = {
      firstName: values.firstName,
      lastName: values.lastName,
      username: values.email,
      email: values.email,
      role: role,
      roles: [role],
      status: status,
      adresseRue: values.adresseRue,
      adresseCodePostal: values.adresseCodePostal,
      adresseVille: values.adresseVille,
      hasAccess: values.hasAccess,
      superieur : values.superieurId?{id:values.superieurId}:undefined,
      ...(password ? { password: password } : {}),
    }

    try {
      if (isEdit && currentRow?.id) {
        // PATCH : Mise à jour
        await updateUser(currentRow.id, userPayload)
        toast({ title: 'Utilisateur mis à jour avec succès !' })
      } else {
        // POST : Création
        await createUser(userPayload)
        toast({ title: 'Nouvel utilisateur créé avec succès !' })
      }
      queryClient.invalidateQueries({ queryKey: ['users'] })
      // Réinitialiser le formulaire
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error('Erreur lors de la soumission :', error)

    }
  }

  const isPasswordTouched = !!form.formState.dirtyFields.password

  return (
    <Sheet
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-left'>
          <SheetTitle>{isEdit ? 'Edit User' : 'Add New User'}</SheetTitle>
          <SheetDescription>
            {isEdit ? 'Update the user here. ' : 'Create new user here. '}
            Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className='h-full w-full py-1 pr-4'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 p-0.5'
            >
              <FormField
                control={form.control}
                name='firstName'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      First Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='John'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='lastName'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      Last Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Doe'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />


              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel >
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='john.doe@gmail.com'
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
                name='adresseRue'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      Adresse (Rue)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Rue de la paix'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='adresseCodePostal'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      Code postal
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='78180'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='adresseVille'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      Ville
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Coignière'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='role'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel >
                      Role
                    </FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Choisir un rôle'
                      className='col-span-4'
                      items={userTypes.map(({ label, value }) => ({
                        label,
                        value,
                      }))}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              
              {<FormField
                control={form.control}
                name="hasAccess"

                render={({ field }) => (
                  <FormItem className="grid grid-cols-[auto_1fr] items-center gap-2">

                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm leading-none" >Avec accès</FormLabel>

                    <FormMessage />
                  </FormItem>
                )}
              />}
               {!avecAcces && <FormField
                              control={form.control}
                              name="superieurId"
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  <FormLabel>Membre contact</FormLabel>
                                  <SelectDropdown
                                    defaultValue={field.value}
                                    disabled={avecAcces}
                                    onValueChange={field.onChange}
                                    placeholder="Choisissez un membre"
                                    className="col-span-4"
                    
                                    items={users.map((user: User) => {
                                      const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
                                      const label = (
                                        <div className="flex items-center gap-2">
                                          <div className="h-6 w-6 rounded-full bg-black text-xs text-center font-medium text-white flex items-center justify-center">
                                            {initials}
                                          </div>
                                          <span>{user.firstName} {user.lastName}</span>
                                        </div>
                                      );
                                    
                                      return {
                                        value: user.id.toString(),
                                        label,
                                      };
                                    })}
                                  />
                                  <FormMessage />
                                </FormItem>
                              )}
                            />}
              {avecAcces && <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel >
                      Mot de passe
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder='e.g., S3cur3P@ssw0rd'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />}
              {avecAcces &&
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
                />}

            </form>
          </Form>
        </ScrollArea>
        <SheetFooter>
          <Button type='submit' form='user-form'>
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
