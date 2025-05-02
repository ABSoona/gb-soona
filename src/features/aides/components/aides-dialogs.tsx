import { useAides } from '../context/aides-context';
import { AideViewDialog } from './aide-view-dialog';
import { AidesActionDialog } from './aides-action-dialog';
import { AidesDeleteDialog } from './aides-delete-dialog';


interface Props {

  showContactSearch?: boolean;
  forContactId?: number;
  forDemandeId?: number;
  showDemandeSearch?: boolean
}
export function AidesDialogs({ showContactSearch = true, forContactId, forDemandeId, showDemandeSearch = true }: Props) {
  const { openAide: open, setOpenAide: setOpen, currentRow, setCurrentRow } = useAides()
  return (
    <>
      <AidesActionDialog
        key='aide-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
        showContactSearch={showContactSearch}
        forContactId={forContactId}
        forDemandeId={forDemandeId}
        showDemandeSearch={showDemandeSearch}
      />



      {currentRow && (
        <>
          <AidesActionDialog
            key={`aide-edit-${currentRow.id}`}
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

          <AidesDeleteDialog
            key={`aide-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <AideViewDialog
            key={`aide-view-${currentRow.id}`}
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
