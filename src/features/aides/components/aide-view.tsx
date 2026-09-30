'use client'

import { Aide } from '@/model/aide/Aide'
import { AideDocumentsCard } from './aide-documents-card'


interface Props {
  currentRow: Aide,
  showContact?: boolean

}

export function AideView({ currentRow, showContact: _showContact = true }: Props) {
  if (!currentRow) {
    return null
  }

  return (

    <div className="sm:min-w-full grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-3 md:grid-cols-1 gap-6 mt-6">
      <div className="xl:col-span-3 2xl:col-span-3">
        <AideDocumentsCard aideId={currentRow.id} demandeId={currentRow.demande?.id} />
      </div>
    </div>

  )
}
