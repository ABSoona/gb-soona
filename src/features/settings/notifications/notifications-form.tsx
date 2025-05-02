'use client'

import { useNotificationPrefrenceService } from '@/api/user-notification-preference/notif-pref-service'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/use-toast'
import { getUserId } from '@/lib/session'
import { NotificationType } from '@/model/user-notification-preferences/user-notification-preferences'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
const notificationsFormSchema = z.object({
  nouvelleDemande: z.boolean().default(false),
  demandeEnVsite: z.boolean().default(false),
  demandeEnCommission: z.boolean().default(false),
  aideExpire: z.boolean().default(false),
  contactBlackL: z.boolean().default(false),
  ErreursDemandes: z.boolean().default(false),
})

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>

const typeToFieldMap: Record<NotificationType, keyof NotificationsFormValues> = {
  NouvelleDemande: 'nouvelleDemande',
  DemandeEnVisite: 'demandeEnVsite',
  DemandeEnCommission: 'demandeEnCommission',
  ContactBan: 'contactBlackL',
  AideExpir: 'aideExpire',
  ErreursDemandes: 'ErreursDemandes'
}

const fieldToTypeMap = Object.fromEntries(
  Object.entries(typeToFieldMap).map(([k, v]) => [v, k])
) as Record<keyof NotificationsFormValues, NotificationType>

export function NotificationsForm() {
  const {
    notificationprefrences: userNotificationPreferences,
    createNotificationPrefrence,
    updateNotificationPrefrence,
  } = useNotificationPrefrenceService({ where: { user: { id: getUserId() } } })

  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      nouvelleDemande: false,
      demandeEnVsite: false,
      demandeEnCommission: false,
      aideExpire: false,
      contactBlackL: false,
    },
  })

  // ⚡ Charger les prefs depuis GraphQL et remplir le formulaire
  useEffect(() => {
    if (!userNotificationPreferences || userNotificationPreferences.length === 0) return;

    const prefs: Partial<NotificationsFormValues> = {};

    userNotificationPreferences.forEach((pref) => {
      const field = typeToFieldMap[pref.typeField];
      if (field) prefs[field] = pref.active;
    });

    // Vérifie si les valeurs ont vraiment changé
    const currentValues = form.getValues();
    const shouldReset = Object.entries(prefs).some(([key, value]) => currentValues[key as keyof NotificationsFormValues] !== value);

    if (shouldReset) {
      form.reset(prefs);
    }
  }, [userNotificationPreferences]);
  async function onSubmit(data: NotificationsFormValues) {
    const ops = Object.entries(data).map(async ([field, value]) => {
      const type = fieldToTypeMap[field as keyof NotificationsFormValues]
      const existing = userNotificationPreferences.find((n) => n.typeField === type)

      if (existing) {
        return updateNotificationPrefrence(existing.id, { active: value })
      } else {
        return createNotificationPrefrence({ typeField: type, active: value })
      }
    })

    await Promise.all(ops)

    toast({ title: 'Préférences mises à jour avec succès.' })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <Section title='Demandes'>
          <PrefSwitch form={form} name='nouvelleDemande' label='Nouvelle demande' description='Quand une nouvelle demande est reçue.' />
          <PrefSwitch form={form} name='demandeEnVsite' label='Demande en visite' description='Quand une demande passe au statut "En visite".' />
          <PrefSwitch form={form} name='demandeEnCommission' label='Demande en commission' description='Quand une demande passe au statut "En commission".' />
          <PrefSwitch form={form} name='ErreursDemandes' label='Erreur depuis sonna.com' description='Quand une demande est reçu de puis sonna.com mais ne peut pas être integré dans GBsoona.' />
        </Section>

        <Section title='Contact'>
          <PrefSwitch form={form} name='contactBlackL' label='Contact blacklisté' description='Quand un contact est blacklisté.' />
        </Section>

        <Section title='Aides'>
          <PrefSwitch form={form} name='aideExpire' label='Aide expirée' description='Quand une aide récurrente arrive à expiration.' />
        </Section>


        <Button type='submit'>Mettre à jour</Button>
      </form>
    </Form>
  )
}

// 🔌 Composants utilitaires

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className='relative'>
      <h3 className='mb-4 text-lg font-medium'>{title}</h3>
      <div className='space-y-4'>{children}</div>
    </div>
  )
}

function PrefSwitch({
  form,
  name,
  label,
  description,
}: {
  form: ReturnType<typeof useForm<NotificationsFormValues>>
  name: keyof NotificationsFormValues
  label: string
  description: string
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
          <div className='space-y-0.5'>
            <FormLabel className='text-base'>{label}</FormLabel>
            <FormDescription>{description}</FormDescription>
          </div>
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
        </FormItem>
      )}
    />
  )
}
