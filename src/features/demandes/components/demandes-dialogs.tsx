import { useDemandes } from '../context/demandes-context'
import { DemandeViewDialog } from './demande-view-dialog'
import { DemandesActionDialog } from './demandes-action-dialog'
import { DemandesDeleteDialog } from './demandes-delete-dialog'
import { DemandesInviteDialog } from './demandes-invite-dialog'

export function DemandesDialogs() {
  const { openDemande: open, setOpenDemande: setOpen, currentRow, setCurrentRow } = useDemandes()
  return (
    <>
      <DemandesActionDialog
        key='demande-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      <DemandesInviteDialog
        key='demande-invite'
        open={open === 'invite'}
        onOpenChange={() => setOpen('invite')}
      />

      {currentRow && (
        <>
          <DemandesActionDialog
            key={`demande-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}

          />

          <DemandesDeleteDialog
            key={`demande-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <DemandeViewDialog
            key={`demande-view-${currentRow.id}`}
            open={open === 'view'}
            onOpenChange={() => {
              setOpen('view')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}

          />

        </>
      )}
    </>
  )
}
