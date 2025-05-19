import { useVersements } from '../context/versements-context';
import { VersementViewDialog } from './versement-view-dialog';
import { VersementsActionDialog } from './versements-action-dialog';
import { VersementsDeleteDialog } from './versements-delete-dialog';


interface Props {

  showContactSearch?: boolean;
  forContactId?: number;
  forDemandeId?: number;
  showDemandeSearch?: boolean
}
export function VersementsDialogs({ showContactSearch = true, forContactId, forDemandeId, showDemandeSearch = true }: Props) {
  const { openVersement: open, setOpenVersement: setOpen, currentRow, setCurrentRow } = useVersements()
  return (
    <>
      <VersementsActionDialog
        key='versement-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
        showContactSearch={showContactSearch}
        forContactId={forContactId}
        forDemandeId={forDemandeId}
        showDemandeSearch={showDemandeSearch}
      />



      {currentRow && (
        <>
          <VersementsActionDialog
            key={`versement-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
            showContactSearch={showContactSearch}
          />

          <VersementsDeleteDialog
            key={`versement-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <VersementViewDialog
            key={`versement-view-${currentRow.id}`}
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
