import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { Demande } from '@/model/demande/Demande'

type DemandesDialogType = 'invite' | 'add' | 'edit' | 'delete' | 'view'

interface DemandesContextType {
  open: DemandesDialogType | null
  setOpen: (str: DemandesDialogType | null) => void
  currentRow: Demande | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Demande | null>>
}

const DemandesContext = React.createContext<DemandesContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function DemandesProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<DemandesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Demande | null>(null)

  return (
    <DemandesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </DemandesContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useDemandes = () => {
  const demandesContext = React.useContext(DemandesContext)

  if (!demandesContext) {
    throw new Error('useDemandes has to be used within <DemandesContext>')
  }

  return demandesContext
}
