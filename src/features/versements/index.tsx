import { VersementStatus } from '@/model/versement/versement';
import { columns } from './components/versements-columns';
import { VersementsDialogs } from './components/versements-dialogs';
import { VersementsPrimaryButtons } from './components/versements-primary-buttons';
import { VersementsTable} from './components/versements-table'
import VersementsProvider from './context/versements-context';

import { useVersementService } from '@/api/versement/versementService';
import AppLayout from '@/components/layout/app-layout';
import { TableSkeleton } from '@/components/ui/skeleton-table';
import { handleServerError } from '@/utils/handle-server-error';
import { IconHeartHandshake } from '@tabler/icons-react';

export default function Versements({status,before,after }:{status?: VersementStatus,before? :Date,after?:Date}) {
    const where: any = {};
    if (status) {
            where.status = status; // ✅ un seul statut
    }
    if(before){
        where.dataVersement = {lt: before}
    }
    if(after){
        where.dataVersement = {gte: after}
    }
    // ✅ Utilisation du service pour récupérer les versements
    const { versements, loading: isLoading, error } = useVersementService({where,orderBy:[{ dataVersement: "Asc" }],docRibId: 1});

    // Gestion des erreurs via la fonction centralisée
    if (error) {
        handleServerError(error);
    }

    return (
        <VersementsProvider>

            <AppLayout>
                <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <IconHeartHandshake className="h-6 w-6 text-primary" />
                            Liste des Versements
                        </h2>
                        <p className="text-muted-foreground">
                            Gérez vos versements et leurs statuts ici.
                        </p>
                    </div>
               
                </div>

                <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
                    {isLoading ? (
                        <TableSkeleton rows={10} columns={8} />
                    ) : error ? (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                            <p>❌ Erreur lors du chargement des versements.</p>
                            <p>{(error as Error)?.message ?? 'Une erreur inattendue est survenue.'}</p>
                        </div>
                    ) : versements?.length === 0 ? (
                        <div className="text-center py-4">
                            <p>Aucune versement trouvée.</p>
                        </div>
                    ) : (
                        <VersementsTable data={versements ?? []} columns={columns} hideTools={false} />
                    )}
                </div>
            </AppLayout>

            {<VersementsDialogs />}
        </VersementsProvider>
    );
}
