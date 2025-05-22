import AppLayout from '@/components/layout/app-layout';
import { websiteDemandeColumns } from './components/websiteDemande-columns';
import { WebsiteDemandeDialogs } from './components/websiteDemande-dialogs';
import { WebsiteDemandeTable } from './components/websiteDemande-table';
import { WebsiteDemandesProvider } from './context/website-demandes-context';

import { useWebsiteDemandeService } from '@/api/website-demande/websiteDemandeService';
import { TableSkeleton } from '@/components/ui/skeleton-table';
import { handleServerError } from '@/utils/handle-server-error';
import { IconLogs } from '@tabler/icons-react';

export default function WebsiteDemandePage() {
  const { websiteDemandes, loading: isLoading, error } = useWebsiteDemandeService();

  if (error) {
    handleServerError(error);
  }

  return (
    <WebsiteDemandesProvider>
      <AppLayout>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <IconLogs className="h-6 w-6 text-primary" />
              Inscriptions Sonna.com</h2>
            <p className="text-muted-foreground">
              Journal des demandes en provenance de soona.com
            </p>
          </div>


        </div>

        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {isLoading ? (
            <TableSkeleton rows={10} columns={6} />
          ) : error ? (
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4"
              role="alert"
            >
              <p>❌ Erreur lors du chargement des demandes.</p>
              <p>{(error as Error)?.message ?? 'Une erreur inattendue est survenue.'}</p>
            </div>
          ) : websiteDemandes?.length === 0 ? (
            <div className="text-center py-4">
              <p>Aucune demande trouvée.</p>
            </div>
          ) : (
            <WebsiteDemandeTable data={websiteDemandes ?? []} columns={websiteDemandeColumns} />
          )}
        </div>
      </AppLayout>

      <WebsiteDemandeDialogs />
    </WebsiteDemandesProvider>
  );
}
