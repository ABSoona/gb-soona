import Contacts from '@/features/contacts'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/contacts/')({
  component: Contacts,
})
