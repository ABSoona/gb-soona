import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { DemandeStatus, DemandeStatusHistoryEntry } from '@/model/demande/Demande'
import { demandeStatusColor, demandeStatusTypes } from '../data/data'

interface Props {
  history: DemandeStatusHistoryEntry[]
}

const statusLabel = (status: string) =>
  demandeStatusTypes.find((s) => s.value === status)?.label ?? status

export function DemandeStatusHistoryTimeline({ history }: Props) {
  if (history.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucun changement de statut enregistré.</p>
  }

  return (
    <ol className="relative border-s border-gray-200 dark:border-gray-700">
      {history.map((entry) => (
        <li key={entry.id} className="mb-6 ms-3">
          <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700" />
          <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
            {new Date(entry.createdAt).toLocaleString('fr-FR')}
          </time>
          <div className="mt-1">
            <Badge
              variant="outline"
              className={cn('first-letter:uppercase', demandeStatusColor.get(entry.status as DemandeStatus))}
            >
              {statusLabel(entry.status)}
            </Badge>
          </div>
        </li>
      ))}
    </ol>
  )
}
