import { useVisites } from '../context/visites-context';
import { VisiteViewDialog } from './visite-view-dialog';
import { VisitesActionDialog } from './visites-action-dialog';
import { VisitesDeleteDialog } from './visites-delete-dialog';


interface Props {

  showContactSearch?: boolean;
  forContactId?: number;
  forDemandeId?: number;
  showDemandeSearch?: boolean
}
export function VisitesDialogs({ showContactSearch = true, forContactId, forDemandeId, showDemandeSearch = true }: Props) {
  const { openVisite: open, setOpenVisite: setOpen, currentRow, setCurrentRow } = useVisites()
  return (
    <>
      <VisitesActionDialog
        key='visite-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
        showContactSearch={showContactSearch}
        forContactId={forContactId}
        forDemandeId={forDemandeId}
        showDemandeSearch={showDemandeSearch}
      />



      {currentRow && (
        <>
          <VisitesActionDialog
            key={`visite-edit-${currentRow.id}`}
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

          <VisitesDeleteDialog
            key={`visite-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <VisiteViewDialog
            key={`visite-view-${currentRow.id}`}
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
