'use client'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Demande } from '@/model/demande/Demande'
import { demandeStatusColor, demandeStatusTypes } from '../data/data'
import { situationTypes } from '@/features/contacts/data/data'
import { situationFamilleTypes } from '@/features/contacts/data/data'
import { cn } from '@/lib/utils'
import { Url } from 'url'

interface Props {
  currentRow?: Demande
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DemandeViewDialog({ currentRow, open, onOpenChange }: Props) {
  if (!currentRow) {
    return null
  }

  const { contact, status, remarques,id,createdAt } = currentRow

  const totalRevenus = (currentRow?.revenus ?? 0) + (currentRow?.revenusConjoint ?? 0) +  (currentRow?.apl ?? 0)
  const totalCharges = (currentRow?.loyer ?? 0) + (currentRow?.facturesEnergie ?? 0) + (currentRow.autresCharges ??0)
  const totalDettes = currentRow?.dettes ?? 0
  const totalAides = contact?.aides?.reduce((acc, aide) => acc + (aide.montant ?? 0), 0) ?? 0
  const resteAVivre = totalRevenus - totalCharges

  return (
    <Sheet open={open} onOpenChange={(state) => onOpenChange(state)}>
      <SheetContent side="rightfull" className="flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <SheetHeader className="text-left">
              <SheetTitle>Fiche de la Demande N°  {id} - <span></span>
                <Badge variant="outline" className={cn('capitalize', demandeStatusColor.get(status))}>
                  {demandeStatusTypes.find(s => s.value === status)?.label ?? 'Inconnu'}
                </Badge>  
              </SheetTitle>
              <SheetDescription>Reçue le {new Date(createdAt)?.toLocaleString('fr-FR')}</SheetDescription>
            </SheetHeader>
          </div>
         
        </div>

        <ScrollArea>
          <div className="sm:min-w-full grid grid-cols-1 xl:grid-cols-1 2xl:grid-cols-3 md:grid-cols-1 gap-6 mt-6">
            <div className="col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Informations sur le Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                <DetailRow label="Nom et Prénom" value={`${contact?.nom} ${contact?.prenom}`} link='/users' /> 
                  <DetailRow label="Âge" value={contact?.age + ' ans' ?? 'N/A'} />
                  <DetailRow label="Situation Pro." value={situationTypes.find(s => s.value === currentRow.situationProfessionnelle)?.label ?? 'N/A'} /> 
                  <DetailRow label="Situation F." value={situationFamilleTypes.find(s => s.value === currentRow.situationFamiliale)?.label ?? 'N/A'} />
                  <DetailRow label="Nombre d'enfants" value={currentRow?.nombreEnfants ?? '0'} />
                  <DetailRow label="Ages Enfants" value={currentRow.agesEnfants ?? 'N/A'} />
                  <DetailRow label="Email" value={contact.email ?? 'N/A'} />
                  <DetailRow label="Tél" value={contact.telephone ?? 'N/A'} />
                  <DetailRow label="Ville" value={contact.ville ?? 'N/A'} />
                  <DetailMultiLineRow label="Remarques" value={remarques ?? 'N/A'} />
                </CardContent>
              </Card>
            </div>

            <div className="col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-5 gap-2">
                <InfoCard title="Revenus" value={`${totalRevenus?.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR',minimumFractionDigits: 0})}`} />
                <InfoCard title="Charges" value={`${totalCharges?.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR',minimumFractionDigits: 0})}`} />
                <InfoCard title="Dettes" value={`${totalDettes?.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR',minimumFractionDigits: 0})}`} />
                <InfoCard title="Aides Reçues" value={`${totalAides?.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR',minimumFractionDigits: 0})}`} />
                <InfoCard title="Reste à Vivre" value={`${resteAVivre?.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR',minimumFractionDigits: 0})}`} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenus</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <DetailRow label="Revenus Personnels" value={`${currentRow.revenus?.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR',minimumFractionDigits: 0})}`} />
                    <DetailRow label="Revenus du Conjoint" value={`${currentRow.revenusConjoint?.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR',minimumFractionDigits: 0}) ?? '0'}`} />
                    <DetailRow label="APL" value={`${currentRow.apl?.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR',minimumFractionDigits: 0})?? '0'}`} />
                    <DetailMultiLineRow label="Aides diverses" value={currentRow.autresAides?? 'N/A'} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Charges et Dettes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <DetailRow label="Loyer" value={`${currentRow.loyer?.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR',minimumFractionDigits: 0})} `} />
                    <DetailRow label="Factures Énergie" value={`${currentRow.facturesEnergie?.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR',minimumFractionDigits: 0})}`} />
                    <DetailRow label="Dettes" value={`${currentRow?.dettes?.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR'})}`} />
                   < DetailRow label="Autres charges" value={`${currentRow.autresCharges?.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR',minimumFractionDigits: 0})??0} `} />
                    <DetailMultiLineRow label="Nature dettes" value={currentRow?.natureDettes ?? 'N/A'} />
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Aides Reçues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {contact.aides && contact.aides.length > 0 ? (
                      <ul className="space-y-2">
                        {contact.aides.map((aide) => (
                          <li key={aide.id} className="flex justify-between">
                            <span className="whitespace-nowrap">{new Date(aide.dateAide).toLocaleDateString('fr-FR')}</span>
                            <span className="whitespace-nowrap">{aide.montant?.toLocaleString()} €</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">Aucune aide reçue.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Documents</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-bold">
                 
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          <Button>Modifier la Demande</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function DetailRow({ label, value, link }: { label: string; value: React.ReactNode; link?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center w-4/5">
        <span className="font-medium text-gray-700 whitespace-nowrap label-style">{label}</span>
      </div>
      <div className="w-1/2 text-left whitespace-nowrap overflow-hidden truncate value-style">
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-500 hover:underline">
            {value}
          </a>
        ) : (
          value
        )}
      </div>
    </div>
  );
}

function DetailMultiLineRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        <span className="font-medium text-gray-700 whitespace-nowrap label-style">{label}</span>
       
      </div>
      <div className="text-left multiline-value-style whitespace-pre-line"  >{value}</div>
    </div>
  )
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-md whitespace-nowrap overflow-hidden truncate">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-bold whitespace-nowrap overflow-hidden truncate ">
        {value}
      </CardContent>
    </Card>
  )
}
