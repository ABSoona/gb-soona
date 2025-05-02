import useDialogState from '@/hooks/use-dialog-state'
import { TypeDocument } from '@/model/typeDocument/typeDocument'
import React, { useState } from 'react'

type TypeDocumentDialogType = 'add' | 'edit' | 'delete'

interface TypeDocumentContextType {
  open: TypeDocumentDialogType | null
  setOpen: (value: TypeDocumentDialogType | null) => void
  currentRow: TypeDocument | null
  setCurrentRow: React.Dispatch<React.SetStateAction<TypeDocument | null>>
}

const TypeDocumentContext = React.createContext<TypeDocumentContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function TypeDocumentProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<TypeDocumentDialogType>(null)
  const [currentRow, setCurrentRow] = useState<TypeDocument | null>(null)

  return (
    <TypeDocumentContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </TypeDocumentContext.Provider>
  )
}

// Hook d'utilisation
export const useTypeDocumentContext = () => {
  const context = React.useContext(TypeDocumentContext)
  if (!context) {
    throw new Error('useTypeDocumentContext must be used within <TypeDocumentProvider>')
  }
  return context
}
