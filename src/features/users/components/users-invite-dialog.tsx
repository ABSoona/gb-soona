import { useInvitationService } from '@/api/invitation/invitationService'; // ✅ ajout du hook
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconMailPlus, IconSend } from '@tabler/icons-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { userTypes } from '../data/data'

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required.' })
    .email({ message: 'Email is invalid.' }),
  role: z.string().min(1, { message: 'Role is required.' }),
  desc: z.string().optional(),

})

type UserInviteForm = z.infer<typeof formSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersInviteDialog({ open, onOpenChange }: Props) {
  const form = useForm<UserInviteForm>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', role: '', desc: '' },
  })

  const { createInvitation, isSubmitting } = useInvitationService()

  const onSubmit = async (values: UserInviteForm) => {
    const payload = {
      email: values.email,
      role: values.role,
      message: values.desc,
      token: '',
      used: false
    }

    const success = await createInvitation(payload)
    if (success) {
      form.reset()
      onOpenChange(false)
    }
  }

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
          <SheetTitle className='flex items-center gap-2'>
            <IconMailPlus /> Inviter
          </SheetTitle>
          <SheetDescription>
            Invitez un nouvel utilisateur à rejoindre votre équipe en lui envoyant
            une invitation par e-mail. Attribuez-lui un rôle pour définir son niveau d’accès.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id='user-invite-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='eg: john.doe@gmail.com'
                      {...field}
                    />
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
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Choisir un rôle'
                    items={userTypes.map(({ label, value }) => ({
                      label,
                      value,
                    }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='desc'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      className='resize-none'
                      placeholder='Ajouter un message à destination de la personne invitée (optionnel)'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <SheetFooter className='gap-y-2'>
          <SheetClose asChild>
            <Button variant='outline'>Annuler</Button>
          </SheetClose>
          <Button type='submit' form='user-invite-form' disabled={isSubmitting}>
            {isSubmitting ? 'Envoi...' : <>Inviter <IconSend /></>}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
