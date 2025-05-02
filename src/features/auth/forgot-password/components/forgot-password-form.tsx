'use client'

import { resetPasswordRequest } from '@/api/user/userService'
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
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { HTMLAttributes, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

type ForgotFormProps = HTMLAttributes<HTMLDivElement>

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter your email' })
    .email({ message: 'Invalid email address' }),
})

export function ForgotForm({ className, ...props }: ForgotFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setSuccess(null)
    setError(null)

    try {
      await resetPasswordRequest(data.email)
      setSuccess('Un lien de réinitialisation a été envoyé si l’email existe.')
      form.reset({ email: '' }) // <- ici on vide le champ
    } catch (err: any) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid gap-2'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder='nom@exemple.com' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {success && (
              <p className="text-sm text-green-600">{success}</p>
            )}
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <Button className='mt-2' disabled={isLoading}>
              {isLoading ? 'Envoi en cours...' : 'Envoyer le lien'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
