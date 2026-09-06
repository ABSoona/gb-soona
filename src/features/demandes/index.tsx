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
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { IconMailDown } from '@tabler/icons-react';
import { ColumnFiltersState, PaginationState } from '@tanstack/react-table';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DateRange } from 'react-day-picker';

const PAGE_SIZE = 25;

// 🔥 Traduit l'etat de filtres du tableau (pilote par le toolbar) en `where` GraphQL,
// pour que la recherche/les filtres se fassent cote serveur plutot que sur les lignes
// deja chargees en memoire.
function buildFiltersWhere(columnFilters: ColumnFiltersState): Record<string, any> {
    const where: Record<string, any> = {};
    for (const filter of columnFilters) {
        const value = filter.value as any;
        if (value === undefined || value === null) continue;

        switch (filter.id) {
            case 'contactNomPrenom':
                if (typeof value === 'string' && value.trim() !== '') {
                    where.fullSearch = { contains: value.trim(), mode: 'Insensitive' };
                }
                break;
            case 'status':
                if (Array.isArray(value) && value.length > 0) {
                    where.status = { in: value };
                }
                break;
            case 'categorieDemandeur':
                if (Array.isArray(value) && value.length > 0) {
                    where.categorieDemandeur = { in: value };
                }
                break;
            case 'createdAt':
            case 'decisionDate': {
                const range = value as DateRange | undefined;
                if (range?.from || range?.to) {
                    where[filter.id] = {
                        ...(range.from ? { gte: range.from } : {}),
                        ...(range.to ? { lte: range.to } : {}),
                    };
                }
                break;
            }
        }
    }
    return where;
}

export default function Demandes({ acteurId, status,title,description, newOlny,excludeNews }: { acteurId?: string, status?: DemandeStatus | DemandeStatus[],title?:string,description?:string, newOlny?: boolean ,excludeNews?:boolean}) {
    // ✅ Utilisation du service pour récupérer les demandes
    const baseWhere: any = {};


    if (acteurId) {
        baseWhere.acteur = { id: acteurId };
    }
    if (status) {
        if (Array.isArray(status)) {
            baseWhere.status = { in: status }; // ✅ plusieurs statuts
        } else {
            baseWhere.status = { equals: status }; // ✅ un seul statut
        }
    }

    // Les vues "Nouvelles" / "En cours de traitement" filtrent en plus sur le NOMBRE
    // d'activités de la demande (pas juste sa présence), ce qui n'est pas exprimable
    // aujourd'hui via un `where` GraphQL. Elles restent donc sur l'ancien mode (tout
    // charger puis filtrer côté client) — elles sont de toute façon déjà bornées par un
    // filtre de statut, donc plus légères que la vue "Toutes les demandes".
    const isServerMode = !newOlny && !excludeNews;

    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: PAGE_SIZE });
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const mergedWhere = useMemo(
        () => ({ ...baseWhere, ...buildFiltersWhere(columnFilters) }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [acteurId, JSON.stringify(status), columnFilters]
    );
    const debouncedWhere = useDebouncedValue(mergedWhere, 300);

    // 🔥 Revenir à la première page quand un filtre change (sinon on peut se
    // retrouver sur une page qui n'existe plus dans le nouveau résultat).
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));
    }, [debouncedWhere]);

    const serviceParams = isServerMode
        ? {
            where: debouncedWhere,
            take: pagination.pageSize,
            skip: pagination.pageIndex * pagination.pageSize,
        }
        : { where: baseWhere };

    const { demandes, total, loading: isLoading, error, refetch } = useDemandeService(serviceParams);



    let filteredDemandes = newOlny ? demandes.filter((e) => (!(e.demandeActivities.length > 1))) : demandes
    filteredDemandes = excludeNews ?demandes.filter((e) => (e.demandeActivities.length > 1)) :filteredDemandes
    // Gestion des erreurs via la fonction centralisée
    if (error) {
        handleServerError(error);
    }

    return (

        <DemandesProvider>
            <AppLayout>

                <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <IconMailDown className="h-6 w-6 text-primary" />
                            {title?title : "Liste de toutes les Demandes"}</h2>
                        <p className="text-muted-foreground">
                            {description?description:"Gérer toutes les demandes quelque soit leurs état"}
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
                    ) : isServerMode ? (
                        <DemandesTable
                            data={filteredDemandes ?? []}
                            columns={columns}
                            hideTools={false}
                            manualPagination
                            pageCount={Math.max(1, Math.ceil(total / pagination.pageSize))}
                            totalRowCount={total}
                            pagination={pagination}
                            onPaginationChange={setPagination}
                            columnFilters={columnFilters}
                            onColumnFiltersChange={setColumnFilters}
                        />
                    ) : (
                        <DemandesTable data={filteredDemandes ?? []} columns={columns} hideTools={false} />
                    )}

                </div>

                <DemandesDialogs refetch={refetch}  />
            </AppLayout>
        </DemandesProvider>

    );
}
