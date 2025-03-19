import { ContactView } from '@/features/contacts/components/contact-view'
import ContactDetail from '@/features/contacts/contact-detail'
import ContactsProvider from '@/features/contacts/context/contacts-context'

import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/contacts/$id')({
  component: () => (
    <ContactsProvider>
      <ContactDetail />
    </ContactsProvider>
  ),
})

