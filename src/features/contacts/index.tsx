import { aidesColumns } from './components/contacts-columns';
//import { ContactsDialogs } from './components/contacts-dialogs';
import { ContactsPrimaryButtons } from './components/contacts-primary-buttons';
import { ContactsTable } from './components/contacts-table';
import ContactsProvider from './context/contacts-context';

import { useContactService } from '@/api/contact/contact-service';
import AppLayout from '@/components/layout/app-layout';
import { TableSkeleton } from '@/components/ui/skeleton-table';
import { handleServerError } from '@/utils/handle-server-error';
import { IconUser } from '@tabler/icons-react';
import { ContactsDialogs } from './components/contacts-dialogs';

export default function Contacts() {
    // ✅ Utilisation du service pour récupérer les contacts
    const { contacts, loading: isLoading, error } = useContactService();

    // Gestion des erreurs via la fonction centralisée
    if (error) {
        handleServerError(error);
    }

    return (
        <ContactsProvider>

            <AppLayout>
                <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <IconUser className="h-6 w-6 text-primary" />
                            Liste des Contacts</h2>
                        <p className="text-muted-foreground">
                            Gérez vos contacts et leurs statuts ici.
                        </p>
                    </div>
                    <ContactsPrimaryButtons />
                </div>

                <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
                    {isLoading ? (
                        <TableSkeleton rows={10} columns={8} />
                    ) : error ? (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                            <p>❌ Erreur lors du chargement des contacts.</p>
                            <p>{(error as Error)?.message ?? 'Une erreur inattendue est survenue.'}</p>
                        </div>
                    ) : contacts?.length === 0 ? (
                        <div className="text-center py-4">
                            <p>Aucune contact trouvée.</p>
                        </div>
                    ) : (
                        <ContactsTable data={contacts ?? []} columns={aidesColumns} hideTools={false} />
                    )}
                </div>
            </AppLayout>

            <ContactsDialogs />
        </ContactsProvider>
    );
}
