import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { useAideService } from '@/api/aide/aideService';
import { handleServerError } from '@/utils/handle-server-error';
import { AideView } from './components/aide-view';
import { Aide } from '@/model/aide/Aide';
import { useLocation, useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAides } from './context/aides-context'; // ✅ Import du contexte
import { AidesDialogs } from './components/aides-dialogs';

interface Props {
  showContact?: boolean
}

export default function AideDetail({showContact=true }: Props) {
  const id = useParams({
    from: '/_authenticated/aides/$id',
    select: (params) => params?.id,
  });

  const navigate = useNavigate();
  const { aides, loading: isLoading, error } = useAideService({ where: { id: { equals: Number(id) } } });
  const aide: Aide = aides.length > 0 ? aides[0] : undefined;
  const searchParams = new URLSearchParams(location.search);
  const from = searchParams.get('from');


  // Récupération du contexte pour gérer les actions sur les aides
  const { setOpenAide: setOpen, setCurrentRow } = useAides(); // ✅ Fonctionne car le provider est défini dans un composant parent

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
            <h2 className="text-2xl font-bold tracking-tight">Aide N° {id}</h2>
          </div>
          {aide && (
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setCurrentRow(aide);
                  setOpen('edit');
                }}
              >
                Modifier la Aide
              </Button>
            </div>
          )}
        </div>

        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <p>⏳ Chargement des aides en cours...</p>
            </div>
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
            
            <AideView currentRow={aide} showContact={showContact} />
          )}
        </div>
      </Main>

      <AidesDialogs />
    </>
  );
}
