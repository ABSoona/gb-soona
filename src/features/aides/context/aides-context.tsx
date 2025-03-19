import React, { useState, useCallback } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { Aide } from '@/model/aide/Aide'

type AidesDialogType = 'invite' | 'add' | 'edit' | 'delete' | 'view'

interface AidesContextType {
  openAide: AidesDialogType | null
  setOpenAide: (str: AidesDialogType | null) => void
  currentRow: Aide | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Aide | null>>
  setRefetchAides: (fn: () => void) => void
  triggerRefetchAides: () => void
}

const AidesContext = React.createContext<AidesContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function AidesProvider({ children }: Props) {
  const [openAide, setOpenAide] = useDialogState<AidesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Aide | null>(null)
  const [refetchFn, setRefetchFn] = useState<(() => void) | null>(null)

  const setRefetchAides = useCallback((fn: () => void) => {
    setRefetchFn(() => fn)
  }, [])

  const triggerRefetchAides = useCallback(() => {
    if (refetchFn) {
      refetchFn()
    }
  }, [refetchFn])

  return (
    <AidesContext.Provider value={{
      openAide,
      setOpenAide,
      currentRow,
      setCurrentRow,
      setRefetchAides,
      triggerRefetchAides
    }}>
      {children}
    </AidesContext.Provider>
  )
}

export const useAides = () => {
  const aidesContext = React.useContext(AidesContext)
  if (!aidesContext) {
    throw new Error('useAides has to be used within <AidesProvider>')
  }
  return aidesContext
}
