import { columns } from './components/aides-columns';
import { AidesDialogs } from './components/aides-dialogs';
import { AidesPrimaryButtons } from './components/aides-primary-buttons';
import { AidesTable } from './components/aides-table';
import AidesProvider from './context/aides-context';

import { useAideService } from '@/api/aide/aideService';
import AppLayout from '@/components/layout/app-layout';
import { TableSkeleton } from '@/components/ui/skeleton-table';
import { handleServerError } from '@/utils/handle-server-error';
import { IconHeartHandshake } from '@tabler/icons-react';

export default function Aides() {
    // ✅ Utilisation du service pour récupérer les aides
    const { aides, loading: isLoading, error } = useAideService();

    // Gestion des erreurs via la fonction centralisée
    if (error) {
        handleServerError(error);
    }

    return (
        <AidesProvider>

            <AppLayout>
                <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <IconHeartHandshake className="h-6 w-6 text-primary" />
                            Liste des Aides
                        </h2>
                        <p className="text-muted-foreground">
                            Gérez vos aides et leurs statuts ici.
                        </p>
                    </div>
                    <AidesPrimaryButtons />
                </div>

                <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
                    {isLoading ? (
                        <TableSkeleton rows={10} columns={8} />
                    ) : error ? (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                            <p>❌ Erreur lors du chargement des aides.</p>
                            <p>{(error as Error)?.message ?? 'Une erreur inattendue est survenue.'}</p>
                        </div>
                    ) : aides?.length === 0 ? (
                        <div className="text-center py-4">
                            <p>Aucune aide trouvée.</p>
                        </div>
                    ) : (
                        <AidesTable data={aides ?? []} columns={columns} hideTools={false} />
                    )}
                </div>
            </AppLayout>

            {<AidesDialogs />}
        </AidesProvider>
    );
}
