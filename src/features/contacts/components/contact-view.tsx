'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Contact } from '@/model/contact/Contact';
import { columns } from '@/features/demandes/components/demandes-columns';
import { columns as aidecolumns } from '@/features/aides/components/aides-columns';
import { useDemandes } from '@/features/demandes/context/demandes-context';
import { DemandesTable, detailOpenOption } from '@/features/demandes/components/demandes-table';
import { Button } from '@/components/ui/button';
import { useContacts } from '../context/contacts-context';
import { DemandesDialogs } from '@/features/demandes/components/demandes-dialogs';
import { Plus, Edit2 } from 'lucide-react';
import { ContactsDialogs } from './contacts-dialogs';
import { AidesTable } from '@/features/aides/components/aides-table';
import { useAides } from '@/features/aides/context/aides-context';
import { AidesDialogs } from '@/features/aides/components/aides-dialogs';
import { useAideService } from '@/api/aide/aideService';
import React, { useEffect, useRef, useState } from 'react';
import { useDemandeService } from '@/api/demande/demandeService';
import { DocumentsManager } from '@/features/documents/documents-manager';
import { useDocumentService } from '@/api/document/documentService';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { TableSkeleton } from '@/components/ui/skeleton-table';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { useTypeDocumentService } from '@/api/typeDocument/typeDocumentService';
import { Stepper } from '@/components/stepper';
import { TypeDocument } from '@/model/typeDocument/typeDocument';
import { useDocumentActions } from '@/features/documents/useDocumentActions';

interface Props {
  currentRow: Contact,
  showDetailIn: detailOpenOption
}

export function ContactView({ currentRow, showDetailIn = detailOpenOption.page }: Props) {
  if (!currentRow) return null;

  const { setOpen, setCurrentRow } = useContacts();
  const { setOpenDemande } = useDemandes();
  const { setOpenAide } = useAides();
  const { setRefetchAides } = useAides();
  const { aides, refetch: refetchAides, loading: loadingAides } = useAideService({ where: { contact: { id: currentRow.id } } });
  const { demandes, refetch: refetchDemandes, loading: loadingDemandes } = useDemandeService({ where: { contact: { id: currentRow.id } } });
  const { setRefetchDemandes } = useDemandes();
  const { documents } = useDocumentService({ where: { contact: { id: currentRow.id } } });
 const { handleFileUpload, handleDelete } = useDocumentActions({ contact: { id: currentRow.id } });
  const { typeDocuments } = useTypeDocumentService({ where: { rattachement: 'Contact' } });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  useEffect(() => {
    setRefetchAides(refetchAides);
  }, [refetchAides, setRefetchAides]);

  useEffect(() => {
    setRefetchDemandes(refetchDemandes);
  }, [refetchDemandes, setRefetchDemandes]);

  const fewDemandesColumns = columns.filter(column => column.id && ['numeroDemande', 'createdAt', 'status', 'actions'].includes(column.id));
  const fewAidesColumns = aidecolumns.filter(column => column.id && ['dateAide', 'montant', 'frequence', 'verse', 'resteAVerser', 'actions'].includes(column.id));


  const handleTypeClick = (typeId: number) => {
    setSelectedTypeId(typeId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedTypeId) {
      await handleFileUpload(currentRow.id,file, selectedTypeId);
      setSelectedTypeId(null);
      e.target.value = '';
    }
  };
  return (
   

      

      <div className="sm:min-w-full grid grid-cols-1 xl:grid-cols-1 2xl:grid-cols-3 md:grid-cols-1 gap-6 mt-6">

        <div className="col-span-1">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="whitespace-nowrap">Informations sur le Contact</CardTitle>
              <Button variant='outline' size='sm' className="h-8" onClick={() => { setCurrentRow(currentRow); setOpen('edit'); }}>
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
            <CardFooter></CardFooter>
          </Card>
        </div>

        <div className="col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="whitespace-nowrap">Hitorique des Demandes</CardTitle>
                <Button variant='outline' size='sm' className="h-8" onClick={() => setOpenDemande('add')}>
                  <Plus />
                </Button>
              </CardHeader>
              <CardContent>
                {loadingDemandes ? <TableSkeleton rows={3} columns={4} /> : (
                  <DemandesTable
                    data={demandes || []}
                    columns={fewDemandesColumns}
                    hideTools={true}
                    hideActions={false}
                    showDetailIn={showDetailIn}
                  />
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Documents</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {typeDocuments?.map((type: TypeDocument) => (
                      <DropdownMenuItem key={type.id} onClick={() => handleTypeClick(type.id)}>
                        {type.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
              </CardHeader>
              <CardContent>
                <DocumentsManager contactId={currentRow.id} documents={documents} onUpload={handleFileUpload} onDelete={handleDelete} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="whitespace-nowrap">Hitorique des Aides</CardTitle>
              <Button variant='outline' size='sm' className="h-8" onClick={() => setOpenAide('add')}>
                <Plus />
              </Button>
            </CardHeader>
            <CardContent>
              {loadingAides ? <TableSkeleton rows={3} columns={4} /> : (
                <AidesTable data={aides} columns={fewAidesColumns} hideTools={true} hideActions={false} showDetailIn={showDetailIn} />)}
            </CardContent>
          </Card>


          <>
            <DemandesDialogs />
            <ContactsDialogs />
            <AidesDialogs showContactSearch={false} forContactId={currentRow.id} />
          </>
        </div>
      </div>

  );
}

function DetailRow({ label, value, link, capitalize = false }: { label: string; value: React.ReactNode; link?: string; capitalize?: boolean }) {
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



