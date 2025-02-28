import { useDemandeService } from '@/api/demande/demandeService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import demandes from '@/features/demandes'
import { columns } from '@/features/demandes/components/demandes-columns'
import { DemandesTable } from '@/features/demandes/components/demandes-table'
import DemandesProvider from '@/features/demandes/context/demandes-context';




import { handleServerError } from '@/utils/handle-server-error';


export function RecentSales() {
    // Utilisation du hook personnalisé pour les demandes
    const { demandes, loading, error } =  useDemandeService();
  //  const { setOpen } = useDemandes()

    // Gestion des erreurs via la fonction centralisée
    if (error) {
        handleServerError(error);
    }
  return (
    <DemandesProvider>
      <DemandesTable data={demandes ?? []} columns={columns} hideTools={true}/>
    </DemandesProvider>
  )
}
