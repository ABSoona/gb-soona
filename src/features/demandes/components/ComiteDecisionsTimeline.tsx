import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useDecisionService, downloadDecisionPdf } from '@/api/decision/decisionService'
import { Decision } from '@/model/decision/Decision'
import { useAides } from '@/features/aides/context/aides-context'
import { decisionTypeColor, decisionTypeLabels } from '../data/decision-data'
import { Plus, Download, Pencil } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Props {
  demandeId: number
}

interface MotivationEditorProps {
  decision: Decision
  onSave: (motivation: string) => Promise<unknown>
}

function MotivationEditor({ decision, onSave }: MotivationEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(decision.motivation ?? '')
  const [saving, setSaving] = useState(false)

  if (isEditing) {
    return (
      <div className="mt-1 space-y-2">
        <Textarea value={value} onChange={(e) => setValue(e.target.value)} rows={3} className="text-sm" />
        <div className="flex gap-2">
          <Button
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={saving}
            onClick={async () => {
              setSaving(true)
              try {
                await onSave(value)
                setIsEditing(false)
              } catch {
                // l'erreur est deja affichee via handleServerError
              } finally {
                setSaving(false)
              }
            }}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={saving}
            onClick={() => {
              setValue(decision.motivation ?? '')
              setIsEditing(false)
            }}
          >
            Annuler
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-1 flex items-start gap-2">
      {decision.motivation ? (
        <p className="text-sm whitespace-pre-wrap">{decision.motivation}</p>
      ) : (
        <p className="text-sm text-muted-foreground italic">Aucune observation.</p>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0"
        onClick={() => {
          setValue(decision.motivation ?? '')
          setIsEditing(true)
        }}
      >
        <Pencil className="h-3 w-3" />
      </Button>
    </div>
  )
}

export function ComiteDecisionsTimeline({ demandeId }: Props) {
  const { decisions, loading, updateDecisionMotivation } = useDecisionService(demandeId)
  const { setPendingDecisionId, setOpenAide } = useAides()

  if (loading && decisions.length === 0) {
    return <p className="text-sm text-muted-foreground">Chargement...</p>
  }

  if (decisions.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucune decision de comite enregistree.</p>
  }

  return (
    <ol className="relative border-s border-gray-200 dark:border-gray-700">
      {decisions.map((decision) => (
        <li key={decision.id} className="mb-6 ms-3">
          <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700" />
          <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
            Comite du {new Date(decision.comite.date).toLocaleDateString('fr-FR')} -{' '}
            {new Date(decision.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </time>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="outline" className={cn('first-letter:uppercase', decisionTypeColor[decision.type])}>
              {decisionTypeLabels[decision.type]}
            </Badge>
            {decision.acteur && (
              <span className="text-xs text-muted-foreground">
                par {decision.acteur.firstName} {decision.acteur.lastName}
              </span>
            )}
          </div>
          <MotivationEditor
            decision={decision}
            onSave={(motivation) => updateDecisionMotivation(decision.id, motivation)}
          />
          {decision.type === 'Approbation' && (
            <div className="mt-2 space-y-1">
              {(decision.aides ?? []).map((aide) => (
                <div key={aide.id} className="text-xs text-muted-foreground">
                  Aide #{aide.id} - {aide.typeField === 'FinanciRe' ? `${aide.montant}€ (${aide.frequence})` : 'Assistance administrative'}
                </div>
              ))}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => {
                    setPendingDecisionId(decision.id)
                    setOpenAide('add')
                  }}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Ajouter une aide
                </Button>
                {decision.situationHistory && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={async () => {
                      try {
                        await downloadDecisionPdf(decision.id)
                      } catch {
                        toast({ title: 'Échec du téléchargement du compte rendu', variant: 'destructive' })
                      }
                    }}
                  >
                    <Download className="mr-1 h-3 w-3" />
                    Télécharger le compte rendu
                  </Button>
                )}
              </div>
            </div>
          )}
        </li>
      ))}
    </ol>
  )
}
