import useDialogState from '@/hooks/use-dialog-state'
import { Aide } from '@/model/aide/Aide'
import React, { useCallback, useState } from 'react'

type AidesDialogType = 'invite' | 'add' | 'edit' | 'delete' | 'view'

interface AidesContextType {
  openAide: AidesDialogType | null
  setOpenAide: (str: AidesDialogType | null) => void
  currentRow: Aide | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Aide | null>>
  setRefetchAides: (fn: () => void) => void
  triggerRefetchAides: () => void
  // Decision de comite (Approbation) a laquelle rattacher la prochaine aide
  // creee via la sheet "add" partagee - voir aides-dialogs.tsx.
  pendingDecisionId: number | null
  setPendingDecisionId: React.Dispatch<React.SetStateAction<number | null>>
}

const AidesContext = React.createContext<AidesContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function AidesProvider({ children }: Props) {
  const [openAide, setOpenAide] = useDialogState<AidesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Aide | null>(null)
  const [refetchFn, setRefetchFn] = useState<(() => void) | null>(null)
  const [pendingDecisionId, setPendingDecisionId] = useState<number | null>(null)

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
      triggerRefetchAides,
      pendingDecisionId,
      setPendingDecisionId
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
