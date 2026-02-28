import useDialogState from '@/hooks/use-dialog-state'
import { Visite } from '@/model/visite/Visite'

import React, { useCallback, useState } from 'react'

type VisitesDialogType = 'invite' | 'add' | 'edit' | 'delete' | 'view'

interface VisitesContextType {
  openVisite: VisitesDialogType | null
  setOpenVisite: (str: VisitesDialogType | null) => void
  currentRow: Visite | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Visite | null>>
  setRefetchVisites: (fn: () => void) => void
  triggerRefetchVisites: () => void
}

const VisitesContext = React.createContext<VisitesContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function VisitesProvider({ children }: Props) {
  const [openVisite, setOpenVisite] = useDialogState<VisitesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Visite | null>(null)
  const [refetchFn, setRefetchFn] = useState<(() => void) | null>(null)

  const setRefetchVisites = useCallback((fn: () => void) => {
    setRefetchFn(() => fn)
  }, [])

  const triggerRefetchVisites = useCallback(() => {
    if (refetchFn) {
      refetchFn()
    }
  }, [refetchFn])

  return (
    <VisitesContext.Provider value={{
      openVisite,
      setOpenVisite,
      currentRow,
      setCurrentRow,
      setRefetchVisites,
      triggerRefetchVisites
    }}>
      {children}
    </VisitesContext.Provider>
  )
}

export const useVisites = () => {
  const visitesContext = React.useContext(VisitesContext)
  if (!visitesContext) {
    throw new Error('useVisites has to be used within <VisitesProvider>')
  }
  return visitesContext
}
