import useDialogState from '@/hooks/use-dialog-state'
import { Versement } from '@/model/versement/versement'
import React, { useCallback, useState } from 'react'

type VersementsDialogType = 'invite' | 'add' | 'edit' | 'delete' | 'view'

interface VersementsContextType {
  openVersement: VersementsDialogType | null
  setOpenVersement: (str: VersementsDialogType | null) => void
  currentRow: Versement | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Versement | null>>
  setRefetchVersements: (fn: () => void) => void
  triggerRefetchVersements: () => void
}

const VersementsContext = React.createContext<VersementsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function VersementsProvider({ children }: Props) {
  const [openVersement, setOpenVersement] = useDialogState<VersementsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Versement | null>(null)
  const [refetchFn, setRefetchFn] = useState<(() => void) | null>(null)

  const setRefetchVersements = useCallback((fn: () => void) => {
    setRefetchFn(() => fn)
  }, [])

  const triggerRefetchVersements = useCallback(() => {
    if (refetchFn) {
      refetchFn()
    }
  }, [refetchFn])

  return (
    <VersementsContext.Provider value={{
      openVersement,
      setOpenVersement,
      currentRow,
      setCurrentRow,
      setRefetchVersements,
      triggerRefetchVersements
    }}>
      {children}
    </VersementsContext.Provider>
  )
}

export const useVersements = () => {
  const versementsContext = React.useContext(VersementsContext)
  if (!versementsContext) {
    throw new Error('useVersements has to be used within <VersementsProvider>')
  }
  return versementsContext
}
