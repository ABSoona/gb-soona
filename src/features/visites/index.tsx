import { Visite, VisiteStatus } from '@/model/visite/Visite';
import { columns } from './components/visites-columns';
import { VisitesDialogs } from './components/visites-dialogs';
import { VisitesPrimaryButtons } from './components/visites-primary-buttons';
import { VisitesTable} from './components/visites-table'
import VisitesProvider from './context/visites-context';


import AppLayout from '@/components/layout/app-layout';
import { TableSkeleton } from '@/components/ui/skeleton-table';
import { handleServerError } from '@/utils/handle-server-error';
import { IconHeartHandshake } from '@tabler/icons-react';
import { useVisiteService } from '@/api/visite/invitationService';

export default function Visites({status,acteurId }:{status?: VisiteStatus[],acteurId? : string}) {
    const where: any = {};
    if (acteurId) {
            where.acteur = {id : acteurId}; // ✅ un seul statut
    }
  
    // ✅ Utilisation du service pour récupérer les visites
    const { visites, loading: isLoading, error } = useVisiteService({where,orderBy:[{ dataVisite: "Desc" }],docRibId: 1});
    const FiltredVisite = !status?visites:visites?.filter((d:Visite)=> status?.includes(d.status) )
    // Gestion des erreurs via la fonction centralisée
    if (error) {
        handleServerError(error);
    }

    return (
        <VisitesProvider>

            <AppLayout>
                <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <IconHeartHandshake className="h-6 w-6 text-primary" />
                            Liste des Visites
                        </h2>
                        <p className="text-muted-foreground">
                            Gérez vos visites et leurs statuts ici.
                        </p>
                    </div>
               
                </div>

                <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
                    {isLoading ? (
                        <TableSkeleton rows={10} columns={8} />
                    ) : error ? (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                            <p>❌ Erreur lors du chargement des visites.</p>
                            <p>{(error as Error)?.message ?? 'Une erreur inattendue est survenue.'}</p>
                        </div>
                    ) : visites?.length === 0 ? (
                        <div className="text-center py-4">
                            <p>Aucune visite trouvée.</p>
                        </div>
                    ) : (
                        <VisitesTable data={FiltredVisite ?? []} columns={columns} hideTools={false} />
                    )}
                </div>
            </AppLayout>

            {<VisitesDialogs />}
        </VisitesProvider>
    );
}
