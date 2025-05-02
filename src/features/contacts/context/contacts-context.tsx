import useDialogState from '@/hooks/use-dialog-state'
import { Contact } from '@/model/contact/Contact'
import React, { useState } from 'react'

type ContactsDialogType = 'invite' | 'add' | 'edit' | 'delete' | 'view' | 'timeline'

interface ContactsContextType {
  open: ContactsDialogType | null
  setOpen: (str: ContactsDialogType | null) => void
  currentRow: Contact | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Contact | null>>
}

const ContactsContext = React.createContext<ContactsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function ContactsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<ContactsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Contact | null>(null)

  return (
    <ContactsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </ContactsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useContacts = () => {
  const contactsContext = React.useContext(ContactsContext)

  if (!contactsContext) {
    throw new Error('useContacts has to be used within <ContactsContext>')
  }

  return contactsContext
}
