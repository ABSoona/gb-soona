// 🔧 Composants équivalents à ceux d'aide pour websiteDemande
// Exemple : WebsiteDemandeDialogs, WebsiteDemandeTable, WebsiteDemandeDeleteDialog, etc.

// Je commence ici par `WebsiteDemandeDialogs.tsx`

import { useWebsiteDemandes } from '../context/website-demandes-context';
import { WebsiteDemandeActionDialog } from './websiteDemande-action-dialog';
import { WebsiteDemandeDeleteDialog } from './websiteDemande-delete-dialog';
import { WebsiteDemandeViewDialog } from './websiteDemande-view-dialog';

interface Props {
  showContactSearch?: boolean;
}

export function WebsiteDemandeDialogs({ showContactSearch = true }: Props) {
  const { openDemande: open, setOpenDemande: setOpen, currentRow, setCurrentRow } = useWebsiteDemandes();
  return (
    <>
      <WebsiteDemandeActionDialog
        key="demande-add"
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}

      />

      {currentRow && (
        <>
          <WebsiteDemandeActionDialog
            key={`demande-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit');
              setTimeout(() => setCurrentRow(null), 500);
            }}
            currentRow={currentRow}

          />

          <WebsiteDemandeDeleteDialog
            key={`demande-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete');
              setTimeout(() => setCurrentRow(null), 500);
            }}
            currentRow={currentRow}
          />

          <WebsiteDemandeViewDialog
            key={`demande-view-${currentRow.id}`}
            open={open === 'view'}
            onOpenChange={() => {
              setOpen('view');
              setTimeout(() => setCurrentRow(null), 500);
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  );
}
