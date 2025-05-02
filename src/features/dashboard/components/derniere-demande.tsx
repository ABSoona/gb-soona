import { useDemandeService } from '@/api/demande/demandeService';
import { TableSkeleton } from '@/components/ui/skeleton-table';
import { columns } from '@/features/demandes/components/demandes-columns';
import { DemandesTable } from '@/features/demandes/components/demandes-table';
import DemandesProvider from '@/features/demandes/context/demandes-context';




import { handleServerError } from '@/utils/handle-server-error';


export function DernieresDemandes() {
  // Utilisation du hook personnalisé pour les demandes
  const { demandes, loading: isLoading, error } = useDemandeService({ where: { status: { equals: 'recue' } }, take: 8 });
  const fewDemandesColumns = columns.filter(column => column.id && ['numeroDemande', 'contactNomPrenom', 'createdAt', 'status'].includes(column.id));
  if (error) {
    handleServerError(error);
  }
  return (
    <DemandesProvider>
      {isLoading ? (
        <TableSkeleton rows={6} columns={4} />
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
        <DemandesTable data={demandes ?? []} columns={fewDemandesColumns} hideTools={true} />
      )}

    </DemandesProvider>
  )
}
