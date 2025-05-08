import { DemandeStatus } from '@/model/demande/Demande';
import { columns } from './components/demandes-columns';
import { DemandesDialogs } from './components/demandes-dialogs';
import { DemandesPrimaryButtons } from './components/demandes-primary-buttons';
import { DemandesTable } from './components/demandes-table';
import DemandesProvider from './context/demandes-context';

import { useDemandeService } from '@/api/demande/demandeService';
import AppLayout from '@/components/layout/app-layout';
import { TableSkeleton } from '@/components/ui/skeleton-table';
import { handleServerError } from '@/utils/handle-server-error';
import { IconMailDown } from '@tabler/icons-react';

export default function Demandes({ acteurId, status,title,description, newOlny }: { acteurId?: string, status?: DemandeStatus | DemandeStatus[],title?:string,description?:string, newOlny?: boolean }) {
    // ✅ Utilisation du service pour récupérer les demandes
    const where: any = {};


    if (acteurId) {
        where.acteur = { id: acteurId };
    }
    if (status) {
        if (Array.isArray(status)) {
            where.status = { in: status }; // ✅ plusieurs statuts
        } else {
            where.status = { equals: status }; // ✅ un seul statut
        }
    }

    const { demandes, loading: isLoading, error } = useDemandeService({
        where,
    });

    const filteredDemandes = newOlny ? demandes.filter((e) => (!(e.demandeActivities.length > 1))) : demandes

    // Gestion des erreurs via la fonction centralisée
    if (error) {
        handleServerError(error);
    }

    return (

        <DemandesProvider>
            <AppLayout>

                <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <IconMailDown className="h-6 w-6 text-primary" />
                            {title?title : "Liste des Demandes"}</h2>
                        <p className="text-muted-foreground">
                            {description?description:"Gérez vos demandes et leurs statuts ici"}
                        </p>
                    </div>
                    <DemandesPrimaryButtons />
                </div>

                <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
                    {isLoading ? (
                        <TableSkeleton rows={10} columns={8} />
                    ) : error ? (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                            <p>❌ Erreur lors du chargement des demandes.</p>
                            <p>{(error as Error)?.message ?? 'Une erreur inattendue est survenue.'}</p>
                        </div>
                    ) : filteredDemandes?.length === 0 ? (
                        <div className="text-center py-4">
                            <p>Aucune demande trouvée.</p>
                        </div>
                    ) : (
                        <DemandesTable data={filteredDemandes ?? []} columns={columns} hideTools={false} />
                    )}

                </div>

                <DemandesDialogs />
            </AppLayout>
        </DemandesProvider>

    );
}
