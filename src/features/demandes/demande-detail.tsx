import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { useDemandeService } from '@/api/demande/demandeService';
import { handleServerError } from '@/utils/handle-server-error';
import { DemandeView } from './components/demande-view';
import { Demande } from '@/model/demande/Demande';
import { useLocation, useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemandes } from './context/demandes-context'; // ✅ Import du contexte
import { DemandesDialogs } from './components/demandes-dialogs';
import AidesProvider from '../aides/context/aides-context';

interface Props {
  showContact?: boolean
}

export default function DemandeDetail({showContact=true }: Props) {
  const id = useParams({
    from: '/_authenticated/demandes/$id',
    select: (params) => params?.id,
  });

  const navigate = useNavigate();
  const { demandes, loading: isLoading, error } = useDemandeService({ where: { id: { equals: Number(id) } } });
  const demande: Demande = demandes.length > 0 ? demandes[0] : undefined;
  const searchParams = new URLSearchParams(location.search);
  const from = searchParams.get('from');


  // Récupération du contexte pour gérer les actions sur les demandes
  const { setOpenDemande: setOpen, setCurrentRow } = useDemandes(); // ✅ Fonctionne car le provider est défini dans un composant parent

  const handleRetour = () => {
    if (from) {
      navigate({ to: from });
    } 
  };
  // Gestion des erreurs
  if (error) {
    handleServerError(error);
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className="ml-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRetour} size="icon">
              <ChevronLeft />
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">Demande N° {id}</h2>
          </div>
          {demande && (
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setCurrentRow(demande);
                  setOpen('edit');
                }}
              >
                Modifier la Demande
              </Button>
            </div>
          )}
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
            <AidesProvider>
            <DemandeView currentRow={demande} showContact={showContact} />
            </AidesProvider>
          )}
        </div>
      </Main>


    </>
  );
}
