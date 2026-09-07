import { aidesColumns } from './components/contacts-columns';
//import { ContactsDialogs } from './components/contacts-dialogs';
import { ContactsPrimaryButtons } from './components/contacts-primary-buttons';
import { ContactsTable } from './components/contacts-table';
import ContactsProvider from './context/contacts-context';

import { useContactService } from '@/api/contact/contact-service';
import { GET_CONTACTS } from '@/api/contact/graphql/queries';
import { useApolloClient } from '@apollo/client';
import AppLayout from '@/components/layout/app-layout';
import { TableSkeleton } from '@/components/ui/skeleton-table';
import { handleServerError } from '@/utils/handle-server-error';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { IconUser } from '@tabler/icons-react';
import { ContactsDialogs } from './components/contacts-dialogs';
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
            case 'search':
                if (typeof value === 'string' && value.trim() !== '') {
                    where.fullSearch = { contains: value.trim(), mode: 'Insensitive' };
                }
                break;
            case 'status':
                if (Array.isArray(value) && value.length > 0) {
                    where.status = { in: value };
                }
                break;
            case 'createdAt': {
                const range = value as DateRange | undefined;
                if (range?.from || range?.to) {
                    where.createdAt = {
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

export default function Contacts() {
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

    // ✅ Utilisation du service pour récupérer les contacts
    const { contacts, total, loading: isLoading, error } = useContactService({
        where: debouncedWhere,
        take: pagination.pageSize,
        skip: pagination.pageIndex * pagination.pageSize,
    });

    // 🔥 L'export doit porter sur TOUTES les lignes correspondant aux filtres
    // actuels, pas seulement la page chargée en mémoire (voir data-table-export.tsx).
    const client = useApolloClient();
    const exportAllRows = useCallback(async () => {
        const { data } = await client.query({
            query: GET_CONTACTS,
            variables: { where: debouncedWhere },
            fetchPolicy: 'network-only',
        });
        return data?.contacts ?? [];
    }, [client, debouncedWhere]);

    // Gestion des erreurs via la fonction centralisée
    if (error) {
        handleServerError(error);
    }

    return (
        <ContactsProvider>

            <AppLayout>
                <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <IconUser className="h-6 w-6 text-primary" />
                            Liste des bénéficiaires</h2>
                        <p className="text-muted-foreground">
                            Gérez vos bénéficiaires et leurs statuts ici.
                        </p>
                    </div>
                    <ContactsPrimaryButtons />
                </div>

                <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
                    {isLoading && contacts.length === 0 ? (
                        <TableSkeleton rows={10} columns={8} />
                    ) : error ? (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                            <p>❌ Erreur lors du chargement des contacts.</p>
                            <p>{(error as Error)?.message ?? 'Une erreur inattendue est survenue.'}</p>
                        </div>
                    ) : (
                        <div className={isLoading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
                            <ContactsTable
                                data={contacts ?? []}
                                columns={aidesColumns}
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

            <ContactsDialogs />
        </ContactsProvider>
    );
}
