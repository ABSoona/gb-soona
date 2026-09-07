import { columns } from './components/aides-columns';
import { AidesDialogs } from './components/aides-dialogs';
import { AidesPrimaryButtons } from './components/aides-primary-buttons';
import { AidesTable } from './components/aides-table';
import AidesProvider from './context/aides-context';

import { useAideService } from '@/api/aide/aideService';
import { GET_AIDES } from '@/api/aide/graphql/queries';
import { useApolloClient } from '@apollo/client';
import AppLayout from '@/components/layout/app-layout';
import { TableSkeleton } from '@/components/ui/skeleton-table';
import { handleServerError } from '@/utils/handle-server-error';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { IconHeartHandshake } from '@tabler/icons-react';
import { ColumnFiltersState, PaginationState } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DateRange } from 'react-day-picker';

const PAGE_SIZE = 25;

// 🔥 Traduit l'etat de filtres du tableau (pilote par le toolbar) en `where`
// GraphQL, pour que la recherche/les filtres se fassent cote serveur plutot
// que sur les lignes deja chargees en memoire (voir features/demandes/index.tsx
// pour le meme pattern).
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
            case 'frequence':
                if (Array.isArray(value) && value.length > 0) {
                    where.frequence = { in: value };
                }
                break;
            case 'crediteur':
                if (Array.isArray(value) && value.length > 0) {
                    where.crediteur = { in: value };
                }
                break;
            case 'acteurVersement':
                if (Array.isArray(value) && value.length > 0) {
                    where.acteurVersementId = { in: value };
                }
                break;
            case 'dateAide': {
                const range = value as DateRange | undefined;
                if (range?.from || range?.to) {
                    where.dateAide = {
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

export default function Aides() {
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: PAGE_SIZE });
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const where = useMemo(() => buildFiltersWhere(columnFilters), [columnFilters]);
    const debouncedWhere = useDebouncedValue(where, 300);

    // 🔥 Revenir à la première page quand un filtre change.
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));
    }, [debouncedWhere]);

    // ✅ Utilisation du service pour récupérer les aides
    const { aides, total, loading: isLoading, error } = useAideService({
        where: debouncedWhere,
        take: pagination.pageSize,
        skip: pagination.pageIndex * pagination.pageSize,
    });

    // 🔥 L'export doit porter sur TOUTES les lignes correspondant aux filtres
    // actuels, pas seulement la page chargée en mémoire (voir data-table-export.tsx).
    const client = useApolloClient();
    const exportAllRows = useCallback(async () => {
        const { data } = await client.query({
            query: GET_AIDES,
            variables: { where: debouncedWhere },
            fetchPolicy: 'network-only',
        });
        return data?.aides ?? [];
    }, [client, debouncedWhere]);

    // Gestion des erreurs via la fonction centralisée
    if (error) {
        handleServerError(error);
    }

    return (
        <AidesProvider>

            <AppLayout>
                <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
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
                    {isLoading && aides.length === 0 ? (
                        <TableSkeleton rows={10} columns={8} />
                    ) : error ? (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                            <p>❌ Erreur lors du chargement des aides.</p>
                            <p>{(error as Error)?.message ?? 'Une erreur inattendue est survenue.'}</p>
                        </div>
                    ) : (
                        <div className={isLoading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
                            <AidesTable
                                data={aides ?? []}
                                columns={columns}
                                hideTools={false}
                                manualPagination
                                pageCount={Math.max(1, Math.ceil(total / pagination.pageSize))}
                                totalRowCount={total}
                                pagination={pagination}
                                onPaginationChange={setPagination}
                                columnFilters={columnFilters}
                                onColumnFiltersChange={setColumnFilters}
                                onExportAll={exportAllRows}
                            />
                        </div>
                    )}
                </div>
            </AppLayout>

            {<AidesDialogs />}
        </AidesProvider>
    );
}
