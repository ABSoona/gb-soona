import EmailTemplatesSettings from '@/features/emailTemplates'
import { createLazyFileRoute } from '@tanstack/react-router'


export const Route = createLazyFileRoute('/_authenticated/email-templates/')({
  component: EmailTemplatesSettings,
})
