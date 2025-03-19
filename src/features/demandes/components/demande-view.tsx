'use client'


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AidesTable } from '@/features/aides/components/aides-table'
import { columns as aidecolumns } from '@/features/aides/components/aides-columns'
import { Demande } from '@/model/demande/Demande'
import { situationTypes } from '@/model/demande/Demande'
import { situationFamilleTypes } from '@/model/demande/Demande'

interface Props {
  currentRow: Demande,
  showContact?: boolean,
  showAides?: boolean,
  showDocuements?: boolean,


}

export function DemandeView({ currentRow, showContact = true, showAides = true, showDocuements = true }: Props) {
  if (!currentRow) {
    return null
  }

  /*const { demandes, loading: isLoading, error } = useDemandeService({where : {id :{equals:demandeId} }});
  //const { setOpen, setCurrentRow } = useDemandes()
  const currentRow: Demande | undefined = demandes.length > 0 ? demandes[0] : undefined;*/

  const fewAidesColumns = aidecolumns.filter(column =>
    column.id && ['dateAide', 'montant', 'frequence' ,'verse', 'resteAVerser'].includes(column.id)
  );
  const totalRevenus = (currentRow?.revenus ?? 0) + (currentRow?.revenusConjoint ?? 0) + (currentRow?.apl ?? 0)
  const totalCharges = (currentRow?.loyer ?? 0) + (currentRow?.facturesEnergie ?? 0) + (currentRow?.autresCharges ?? 0)
  const totalDettes = currentRow?.dettes ?? 0
  const totalAides = currentRow?.contact?.aides?.reduce((acc, aide) => acc + (aide.montant ?? 0), 0) ?? 0
  const resteAVivre = totalRevenus - totalCharges

  return (

    <div className="sm:min-w-full grid grid-cols-1 xl:grid-cols-1 2xl:grid-cols-3 md:grid-cols-1 gap-6 mt-6">
      {showContact && <div className="col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Informations sur le Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <DetailRow label="Nom et Prénom" value={`${currentRow?.contact?.nom} ${currentRow?.contact?.prenom}`} link={`/contacts/${currentRow.contact.id}`} capitalize={true} />
            <DetailRow label="Âge" value={currentRow?.contact?.age + ' ans' ?? 'N/A'} />
            <DetailRow label="Email" value={currentRow?.contact.email ?? 'N/A'} />
            <DetailRow label="Tél" value={currentRow?.contact.telephone ?? 'N/A'} />
            <DetailRow label="Adresse" value={currentRow?.contact.adresse ?? 'N/A'} capitalize={true} />
            <DetailRow label="Code Postal" value={currentRow?.contact.codePostal ?? 'N/A'} />
            <DetailRow label="Ville" value={currentRow?.contact.ville ?? 'N/A'} capitalize={true} />
            <DetailMultiLineRow label="Remarques" value={currentRow?.remarques ?? 'N/A'} />
          </CardContent>
        </Card>

      </div>}


      <div className={`${showContact ? "col-span-2" : "col-span-3 "} space-y-6`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-5 gap-2">
          <InfoCard title="Revenus" value={`${totalRevenus?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}`} />
          <InfoCard title="Charges" value={`${totalCharges?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}`} />
          <InfoCard title="Dettes" value={`${totalDettes?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}`} />
          <InfoCard title="Aides Reçues" value={`${totalAides?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}`} />
          <InfoCard title="Reste à Vivre" value={`${resteAVivre?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Situation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <DetailRow label="Situation Pro." value={situationTypes.find(s => s.value === currentRow?.situationProfessionnelle)?.label ?? 'N/A'} />
                <DetailRow label="Situation F." value={situationFamilleTypes.find(s => s.value === currentRow?.situationFamiliale)?.label ?? 'N/A'} />
                <DetailRow label="Nombre d'enfants" value={currentRow?.nombreEnfants ?? '0'} />
                <DetailRow label="Ages Enfants" value={currentRow?.agesEnfants ?? 'N/A'} />
                <DetailMultiLineRow label="Remarques" value={currentRow?.remarques ?? 'N/A'} />
              </CardContent>
            </Card>

          </div>
          <Card>
            <CardHeader>
              <CardTitle>Revenus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <DetailRow label="Revenus Personnels" value={`${currentRow?.revenus?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}`} />
              <DetailRow label="Revenus du Conjoint" value={`${currentRow?.revenusConjoint?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }) ?? '0'}`} />
              <DetailRow label="APL" value={`${currentRow?.apl?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }) ?? '0'}`} />
              <DetailMultiLineRow label="Aides diverses" value={currentRow?.autresAides ?? 'N/A'} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Charges et Dettes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <DetailRow label="Loyer" value={`${currentRow?.loyer?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })} `} />
              <DetailRow label="Factures Énergie" value={`${currentRow?.facturesEnergie?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}`} />
              <DetailRow label="Dettes" value={`${currentRow?.dettes?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`} />
              < DetailRow label="Autres charges" value={`${currentRow?.autresCharges?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }) ?? 0} `} />
              <DetailMultiLineRow label="Nature dettes" value={currentRow?.natureDettes ?? 'N/A'} />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
          {showAides &&
            <Card>
              <CardHeader>
                <CardTitle>Aides Reçues par le demandeur</CardTitle>
              </CardHeader>
              <CardContent>
                {currentRow?.contact.aides && currentRow?.contact.aides.length > 0 ? (
                  <AidesTable data={currentRow?.contact.aides} columns={fewAidesColumns} hideTools={true} hideActions={false} />
                ) : (
                  <p className="text-gray-500">Aucune aide reçue.</p>
                )}
              </CardContent>
            </Card>
          }
          
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {showDocuements &&
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">

              </CardContent>
            </Card>
          }
        </div>

      </div>
    </div>

  )
}

function DetailRow({ label, value, link, capitalize = false }: { label: string; value: React.ReactNode; link?: string, capitalize?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center w-3/5">
        <span className="font-medium text-gray-700 whitespace-nowrap label-style">{label}</span>
      </div>
      <div className={`${capitalize && 'capitalize'} text-right  whitespace-nowrap overflow-hidden truncate value-style `}>
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
