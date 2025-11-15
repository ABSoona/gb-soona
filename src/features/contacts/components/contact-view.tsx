'use client';

import { useAideService } from '@/api/aide/aideService';
import { useDemandeService } from '@/api/demande/demandeService';
import { useDocumentService } from '@/api/document/documentService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TableSkeleton } from '@/components/ui/skeleton-table';
import { columns as aidecolumns } from '@/features/aides/components/aides-columns';
import { AidesDialogs } from '@/features/aides/components/aides-dialogs';
import { AidesTable } from '@/features/aides/components/aides-table';
import { useAides } from '@/features/aides/context/aides-context';
import { columns } from '@/features/demandes/components/demandes-columns';
import { DemandesDialogs } from '@/features/demandes/components/demandes-dialogs';
import { DemandesTable, detailOpenOption } from '@/features/demandes/components/demandes-table';
import { useDemandes } from '@/features/demandes/context/demandes-context';
import { DocumentsManager } from '@/features/documents/documents-manager';
import { Contact } from '@/model/contact/Contact';
import { Edit2, Plus } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useContacts } from '../context/contacts-context';
import { ContactsDialogs } from './contacts-dialogs';
import { Document } from '@/model/document/Document';

import { useTypeDocumentService } from '@/api/typeDocument/typeDocumentService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useDocumentActions } from '@/features/documents/useDocumentActions';
import { TypeDocument } from '@/model/typeDocument/typeDocument';
import { format } from 'date-fns';

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

  const { documents }:{ documents: Document[] } = useDocumentService({ where: { contact: { id: currentRow.id }, } }) ;
  const { handleFileUpload, handleDelete } = useDocumentActions({ contact: { id: currentRow.id } });
  const { typeDocuments } :{typeDocuments:TypeDocument[]}= useTypeDocumentService({ where: { rattachement: 'Contact' }  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  useEffect(() => {
    setRefetchAides(refetchAides);
  }, [refetchAides, setRefetchAides]);


  const fewDemandesColumns = columns.filter(column => column.id && ['numeroDemande', 'createdAt', 'status', 'actions'].includes(column.id));
  const fewAidesColumns = aidecolumns.filter(column => column.id && ['dateAide', 'montant', 'frequence', 'verse', 'resteAVerser', 'actions'].includes(column.id));


  const handleTypeClick = (typeId: number) => {
    setSelectedTypeId(typeId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedTypeId) {
      await handleFileUpload(currentRow.id, file, selectedTypeId);
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
              <Edit2 /> Modifier
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            <DetailRow label="Nom et Prénom" capitalize={true} value={`${currentRow?.nom} ${currentRow?.prenom}`} />
            {/* <DetailRow label="Age" value={currentRow?.age != null ? `${ new Date().getFullYear() - currentRow.age} ans`: '-'} /> */}
            {/* <DetailRow label="Age" value={currentRow?.age != null ? `${currentRow.age} ans`: '-'} /> */}
            <DetailRow label="Date Naissance" value={currentRow?.dateNaissance != null ? `${format(currentRow.dateNaissance, "dd/MM/yyyy")}`: '-'} />
            <DetailRow label="Email" value={currentRow.email ?? '-'} />
            <DetailRow label="Tél" value={currentRow.telephone ?? '-'} />
            <DetailRow label="Adresse" value={currentRow?.adresse ?? '-'} />
            <DetailRow label="Code Postal" value={currentRow?.codePostal ?? '-'} />
            <DetailRow label="Ville" capitalize={true} value={currentRow?.ville ?? '-'} />
            {/* <DetailMultiLineRow label="Remarques" value={currentRow.remarques ?? '-'} /> */}
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </div>

      <div className="col-span-2 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="whitespace-nowrap">Historique des Demandes</CardTitle>
              <Button variant='outline' size='sm' className="h-8" onClick={() => setOpenDemande('add')}>
                <Plus /> Nouvelle demande
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
                  ShowPagination={false}
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
                    <Plus className="h-4 w-4" /> Ajouter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {typeDocuments.filter((e)=>(e.internalCode!=='unknown_contact'))?.map((type: TypeDocument) => (
                    <DropdownMenuItem key={type.id} onClick={() => handleTypeClick(type.id)}>
                      {type.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
            </CardHeader>
            <CardContent>
              <DocumentsManager attachement={'Contact'} contactId={currentRow.id} documents={documents.filter((e)=>(e.typeDocument.rattachement=='Contact'))} onUpload={handleFileUpload} onDelete={handleDelete} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="whitespace-nowrap">Hitorique des Aides</CardTitle>
            <Button variant='outline' size='sm' className="h-8" onClick={() => setOpenAide('add')}>
              <Plus /> Nouvelle aide
            </Button>
          </CardHeader>
          <CardContent>
            {loadingAides ? <TableSkeleton rows={3} columns={4} /> : (
              <AidesTable data={aides} columns={fewAidesColumns} hideTools={true} hideActions={false} showDetailIn={showDetailIn} />)}
          </CardContent>
        </Card>


        <>
          <DemandesDialogs  refetch={refetchDemandes}/>
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
      <div className="flex items-center w-2/5">
        <span className="f whitespace-nowrap label-style">{label}</span>
      </div>
      <div className={`first-letter:uppercase w-3/5 text-left whitespace-nowrap overflow-hidden truncate value-style`}>
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



