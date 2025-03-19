import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { handleServerError } from '@/utils/handle-server-error';
import { useNavigate, useParams } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useContactService } from '@/api/contact/contact-service';
import { Contact } from '@/model/contact/Contact';
import { ContactView } from './components/contact-view';
import { detailOpenOption } from '../demandes/components/demandes-table';
import DemandesProvider from '../demandes/context/demandes-context';
import AidesProvider from '../aides/context/aides-context';

export default function ContactDetail() {
  const id = useParams({
    from: '/_authenticated/contacts/$id',
    select: (params) => params?.id,
  });

  const navigate = useNavigate();
  const { contacts: contacts, loading: isLoading, error } = useContactService({ where: { id: { equals: Number(id) } } });
  const contact: Contact = contacts.length > 0 ? contacts[0] : undefined;

  // Récupération du contexte pour gérer les actions sur les demandes
 // const { setOpen, setCurrentRow } = useContacts(); // ✅ Fonctionne car le provider est défini dans un composant parent

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
            <Button variant="outline" onClick={() => navigate({ to: '/contacts' })} size="icon">
              <ChevronLeft />
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">Contact N° {id}</h2>
          </div>
         
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
          ) : contacts?.length === 0 ? (
            <div className="text-center py-4">
              <p>Aucune demande trouvée.</p>
            </div>
          ) : (
            <AidesProvider>
              <DemandesProvider>
               <ContactView currentRow={contact}  showDetailIn={detailOpenOption.sheet} />
            </DemandesProvider>
            </AidesProvider>
            
           
          )}
        </div>
      </Main>

      
    
      
      
    </>
  );
}
