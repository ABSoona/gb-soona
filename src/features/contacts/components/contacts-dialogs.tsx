import { useContacts } from '../context/contacts-context'
import { ContactTimelineDialog } from './contact-timeline-dialog '
import { ContactViewDialog } from './contact-view-dialog'
//import { ContactViewDialog } from './contact-view-dialog'
import { ContactsActionDialog } from './contacts-action-dialog'
import { ContactsDeleteDialog } from './contacts-delete-dialog'


export function ContactsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useContacts()
  return (
    <>
      <ContactsActionDialog
        key='contact-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />


      {currentRow && (
        <>
          <ContactsActionDialog
            key={`contact-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}

          />

          <ContactsDeleteDialog
            key={`contact-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ContactViewDialog
            key={`contact-view-${currentRow.id}`}
            open={open === 'view'}
            onOpenChange={() => {
              setOpen('view')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}

          />
          <ContactTimelineDialog
            key={`contact-timeline-${currentRow.id}`}
            open={open === 'timeline'}
            onOpenChange={() => {
              setOpen('timeline')
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
