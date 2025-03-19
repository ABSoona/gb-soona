'use client'


import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Contact } from '@/model/contact/Contact'
import { columns } from '@/features/demandes/components/demandes-columns'
import { columns as aidecolumns } from '@/features/aides/components/aides-columns'
import DemandesProvider, { useDemandes } from '@/features/demandes/context/demandes-context'
import { DemandesTable, detailOpenOption } from '@/features/demandes/components/demandes-table'
import { Button } from '@/components/ui/button'
import { useContacts } from '../context/contacts-context'
import { DemandesDialogs } from '@/features/demandes/components/demandes-dialogs'
import { Edit, Edit2, Edit2Icon, Edit3, Edit3Icon, Plus, PlusCircle, PlusIcon } from 'lucide-react'
import { ContactsDialogs } from './contacts-dialogs'
import { AidesTable } from '@/features/aides/components/aides-table'
import { useAides } from '@/features/aides/context/aides-context'
import { AidesDialogs } from '@/features/aides/components/aides-dialogs'
import { useAideService } from '@/api/aide/aideService'
import React, { useEffect } from 'react'
import { useDemandeService } from '@/api/demande/demandeService'



interface Props {
  currentRow: Contact,
  showDetailIn: detailOpenOption

}

export function ContactView({ currentRow, showDetailIn = detailOpenOption.page }: Props) {
  if (!currentRow) {
    return null
  }

  /*const { contacts, loading: isLoading, error } = useContactService({where : {id :{equals:contactId} }});
  const { setOpen, setCurrentRow } = useContacts()
  const currentRow: Contact | undefined = contacts.length > 0 ? contacts[0] : undefined;*/
  const { setOpen, setCurrentRow } = useContacts()
  const { setOpenDemande } = useDemandes()
  const { setOpenAide } = useAides()
  const { setRefetchAides } = useAides();
  const { aides,  refetch: refetchAides  } = useAideService(currentRow.id)
  const { demandes,  refetch: refetchDemandes  } = useDemandeService({where : {contact : {id:currentRow.id}}})
  const { setRefetchDemandes } = useDemandes();
  
  useEffect(() => {
    setRefetchAides(refetchAides);
  }, [refetchAides, setRefetchAides]);

  useEffect(() => {
    setRefetchDemandes(refetchDemandes);
  }, [refetchDemandes, setRefetchDemandes]);


  const fewDemandesColumns = columns.filter(column =>
    column.id && ['numeroDemande', 'createdAt', 'status', 'actions'].includes(column.id)
  );

  const fewAidesColumns = aidecolumns.filter(column =>
    column.id && ['dateAide', 'montant', 'frequence', 'verse','resteAVerser', 'actions'].includes(column.id)
  );

  return (

    <div className="sm:min-w-full grid grid-cols-1 xl:grid-cols-1 2xl:grid-cols-3 md:grid-cols-1 gap-6 mt-6">
      <div className="col-span-1">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="whitespace-nowrap">Informations sur le Contact</CardTitle>

            <Button
              variant='outline'
              size='sm'
              className="h-8"
              onClick={() => {
                setCurrentRow(currentRow);
                setOpen('edit');
              }}
            >
              <Edit2 />
            </Button>
          </CardHeader>

          <CardContent className="space-y-2">
            <DetailRow label="Nom et Prénom" capitalize={true} value={`${currentRow?.nom} ${currentRow?.prenom}`} />
            <DetailRow label="Age" value={currentRow?.age + ' ans' ?? 'N/A'} />
            <DetailRow label="Email" value={currentRow.email ?? 'N/A'} />
            <DetailRow label="Tél" value={currentRow.telephone ?? 'N/A'} />
            <DetailRow label="Adresse" value={currentRow?.adresse ?? 'N/A'} />
            <DetailRow label="Code Postal" value={currentRow?.codePostal ?? 'N/A'} />
            <DetailRow label="Ville" capitalize={true} value={currentRow?.ville ?? 'N/A'} />
            <DetailMultiLineRow label="Remarques" value={currentRow.remarques ?? 'N/A'} />
          </CardContent>
          <CardFooter>

          </CardFooter>
        </Card>
      </div>
      <div className="col-span-2 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="whitespace-nowrap">Hitorique des Aides</CardTitle>

              <Button
                variant='outline'
                size='sm'
                className="h-8"
                onClick={() => {

                  setOpenAide('add');
                }}
              >
                <Plus />
              </Button>



            </CardHeader>
            <CardContent>

              <AidesTable data={aides} columns={fewAidesColumns} hideTools={true} hideActions={false} showDetailIn={showDetailIn} />


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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="whitespace-nowrap">Hitorique des Demandes</CardTitle>

            <Button
              variant='outline'
              size='sm'
              className="h-8"
              onClick={() => {

                setOpenDemande('add');
              }}
            >
              <Plus />
            </Button>



          </CardHeader>
          <CardContent>

            <DemandesTable data={demandes ||[]} columns={fewDemandesColumns} hideTools={true} hideActions={false} showDetailIn={showDetailIn} />


          </CardContent>
        </Card>
        <>
          <DemandesDialogs />
          <ContactsDialogs />
          <AidesDialogs showContactSearch={false} forContactId={currentRow.id} />

        </>

      </div>
    </div>

  )
}

function DetailRow({ label, value, link,capitalize=false }: { label: string; value: React.ReactNode; link?: string; capitalize?:boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center w-4/5">
        <span className="font-medium text-gray-700 whitespace-nowrap label-style">{label}</span>
      </div>
      <div className={`${capitalize && 'capitalize'} w-1/2 text-left whitespace-nowrap overflow-hidden truncate value-style`}>
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


