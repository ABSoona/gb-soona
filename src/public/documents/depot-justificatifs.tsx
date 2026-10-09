import { useEffect, useRef, useState } from 'react'
import { useSearch } from '@tanstack/react-router'
import { CheckCircle2, FileText, Loader2, UploadCloud } from 'lucide-react'
import ViteLogo from '@/assets/logo.png'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/use-toast'
import {
  getPublicUploadInfo,
  uploadPublicDocument,
  PublicUploadInfo,
} from '@/api/document/publicUploadService'

function extractErrorMessage(error: unknown, fallback: string): string {
  const data = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data
  const message = data?.message
  if (Array.isArray(message)) return message.join(', ')
  if (typeof message === 'string') return message
  return fallback
}

export default function DepotJustificatifs() {
  const { token } = useSearch({ from: '/(auth)/depot-justificatifs' })

  const [info, setInfo] = useState<PublicUploadInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadedByType, setUploadedByType] = useState<Record<number, string[]>>({})
  const [uploadingTypeId, setUploadingTypeId] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedTypeIdRef = useRef<number | null>(null)

  useEffect(() => {
    getPublicUploadInfo(token)
      .then(setInfo)
      .catch((err) => setError(extractErrorMessage(err, 'Ce lien est invalide ou a expiré.')))
      .finally(() => setLoading(false))
  }, [token])

  const handleChooseFile = (typeId: number) => {
    selectedTypeIdRef.current = typeId
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const typeId = selectedTypeIdRef.current
    e.target.value = ''
    if (!file || typeId === null) return

    setUploadingTypeId(typeId)
    try {
      await uploadPublicDocument(token, typeId, file)
      setUploadedByType((prev) => ({
        ...prev,
        [typeId]: [...(prev[typeId] ?? []), file.name],
      }))
      toast({ title: 'Document envoyé avec succès.' })
    } catch (err) {
      toast({
        title: "Erreur lors de l'envoi",
        description: extractErrorMessage(err, 'Merci de réessayer.'),
        variant: 'destructive',
      })
    } finally {
      setUploadingTypeId(null)
    }
  }

  return (
    <div className="min-h-svh flex flex-col items-center bg-muted/30 py-10 px-4">
      <div className="bg-zinc-900 rounded-lg px-8 py-4 mb-6">
        <img src={ViteLogo} className="h-12" alt="Mizana" />
      </div>

      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Dépôt de vos justificatifs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : !info ? null : !info.demandeActive ? (
            <p className="text-sm text-muted-foreground">
              Cette demande n'est plus active. Si vous souhaitez tout de même transmettre un
              document, merci de contacter directement votre interlocuteur.
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Bonjour{info.contactPrenom ? ` ${info.contactPrenom}` : ''}, merci de déposer
                ci-dessous les documents demandés. Vous pouvez revenir sur cette page à tout
                moment pour compléter votre dossier.
              </p>

              <div className="space-y-3">
                {info.typeDocuments.map((type) => {
                  const uploaded = uploadedByType[type.id] ?? []
                  const isUploading = uploadingTypeId === type.id
                  return (
                    <div
                      key={type.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border rounded-lg p-3"
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{type.label}</p>
                          {type.description && (
                            <p className="text-xs text-muted-foreground">{type.description}</p>
                          )}
                          {uploaded.length > 0 && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              {uploaded.length} fichier{uploaded.length > 1 ? 's' : ''} envoyé
                              {uploaded.length > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleChooseFile(type.id)}
                        disabled={isUploading}
                        className="w-full sm:w-auto shrink-0"
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UploadCloud className="h-4 w-4" />
                        )}
                        {uploaded.length > 0 ? 'Ajouter un autre' : 'Choisir un fichier'}
                      </Button>
                    </div>
                  )
                })}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
