import useDialogState from '@/hooks/use-dialog-state'
import { Demande } from '@/model/demande/Demande'
import React, { useCallback, useState } from 'react'

type DemandesDialogType = 'invite' | 'add' | 'edit' | 'delete' | 'view'

interface DemandesContextType {
  openDemande: DemandesDialogType | null
  setOpenDemande: (str: DemandesDialogType | null) => void
  currentRow: Demande | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Demande | null>>

}
const DemandesContext = React.createContext<DemandesContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function DemandesProvider({ children }: Props) {
  const [openDemande, setOpenDemande] = useDialogState<DemandesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Demande | null>(null)
 
  return (
    <DemandesContext value={{ openDemande, setOpenDemande, currentRow, setCurrentRow }}>
      {children}
    </DemandesContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useDemandes = () => {
  const demandesContext = React.useContext(DemandesContext)

  if (!demandesContext) {
    throw new Error('useDemandes has to be used within <DemandesProvider>')
  }

  return demandesContext
}
