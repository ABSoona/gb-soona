import { useDemandeService } from '@/api/demande/demandeService';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Demande } from '@/model/demande/Demande';
import { handleServerError } from '@/utils/handle-server-error';
import { useNavigate, useParams } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import AidesProvider from '../aides/context/aides-context';
import { DemandeView } from './components/demande-view';
import { demandeStatusColor, demandeStatusTypes } from './data/data';
import AppLayout from '@/components/layout/app-layout';
import { DemandesPrimaryButtons } from './components/demandes-primary-buttons';
import { useDemandes } from './context/demandes-context';
import { DemandesDialogs } from './components/demandes-dialogs';
import { IconPencil } from '@tabler/icons-react';


interface Props {
  showContact?: boolean
}

export default function DemandeDetail({ showContact = true }: Props) {
  const id = useParams({
    from: '/_authenticated/demandes/$id/',
    select: (params) => params?.id,
  });

  const navigate = useNavigate();
  const { demandes, refetch,loading: isLoading, error } = useDemandeService({ where: { id: { equals: Number(id) } } });
 const demande = demandes[0]!;
  const searchParams = new URLSearchParams(location.search);
  const from = searchParams.get('from');
    const { setOpenDemande: setOpen, setCurrentRow } = useDemandes()


  // Récupération du contexte pour gérer les actions sur les demandes
  //const { setOpenDemande: setOpen, setCurrentRow } = useDemandes(); // ✅ Fonctionne car le provider est défini dans un composant parent

  const handleRetour = () => {
   
      navigate({ to: '..' });
   
  };
  // Gestion des erreurs
  if (error) {
    handleServerError(error);
  }

  return (

    <AppLayout>
          
         
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleRetour} size="icon">
              <ChevronLeft />
            </Button>
            <h2 className="text-xl font-bold tracking-tight">Demande N° {id}</h2>

            <Badge
            variant="outline"
            className={`${cn(demandeStatusColor.get(demande?.status))} text-sm`}
          >
            {demandeStatusTypes.find(s => s.value === demande?.status)?.label ?? 'Inconnu'}
          </Badge>
          </div>

          
          
          <Button className='space-x-1'  onClick={() => {
              setCurrentRow(demande)
              setOpen('edit')
            }}>
         <span>Modifier</span> <IconPencil size={18} />
      </Button>
         <DemandesDialogs refetch={refetch}/>
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
     
        

      </AppLayout>

  );
}
