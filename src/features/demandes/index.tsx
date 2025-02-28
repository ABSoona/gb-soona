import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { columns } from './components/demandes-columns';
import { DemandesDialogs } from './components/demandes-dialogs';
import { DemandesPrimaryButtons } from './components/demandes-primary-buttons';
import { DemandesTable } from './components/demandes-table';
import DemandesProvider from './context/demandes-context';

import { useDemandeService } from '@/api/demande/demandeService';
import { handleServerError } from '@/utils/handle-server-error';

export default function Demandes() {
    // ✅ Utilisation du service pour récupérer les demandes
    const { demandes, loading: isLoading, error } = useDemandeService();

    // Gestion des erreurs via la fonction centralisée
    if (error) {
        handleServerError(error);
    }

    return (
        <DemandesProvider>
            <Header fixed>
                <Search />
                <div className="ml-auto flex items-center space-x-4">
                    <ThemeSwitch />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main>
                <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Liste des Demandes</h2>
                        <p className="text-muted-foreground">
                            Gérez vos demandes et leurs statuts ici.
                        </p>
                    </div>
                     <DemandesPrimaryButtons /> 
                </div>

                <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-4">
                            <p>⏳ Chargement des demandes en cours...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                            <p>❌ Erreur lors du chargement des demandes.</p>
                            <p>{(error as Error)?.message ?? 'Une erreur inattendue est survenue.'}</p>
                        </div>
                    ) : demandes?.length === 0 ? (
                        <div className="text-center py-4">
                            <p>Aucune demande trouvée.</p>
                        </div>
                    ) : (
                        <DemandesTable data={demandes ?? []} columns={columns} hideTools={false} />
                    )}
                </div>
            </Main>

            <DemandesDialogs />
        </DemandesProvider>
    );
}
