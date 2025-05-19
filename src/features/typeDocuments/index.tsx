'use client';

import { useTypeDocumentService } from '@/api/typeDocument/typeDocumentService';
import AppLayout from '@/components/layout/app-layout';
import { TableSkeleton } from '@/components/ui/skeleton-table';
import { handleServerError } from '@/utils/handle-server-error';
import { IconFile } from '@tabler/icons-react';
import { TypeDocumentForm } from './components/type-document-form';
import { TypeDocumentPrimaryButtons } from './components/type-document-primary-buttons';
import TypeDocumentProvider from './context/type-demande-contaxt';
import { notEqual } from 'assert';

export default function SettingsTypeDocument() {
  const { typeDocuments, loading, error } = useTypeDocumentService({where:
    {isInternal:{equals:false}}})
    
  if (error) {
    handleServerError(error);
  }

  return (
    <TypeDocumentProvider>
      <AppLayout>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <IconFile className="h-6 w-6 text-primary" />
              Types de documents
            </h2>
            <p className="text-muted-foreground">
              Gérez les types de documents utilisés dans les demandes et les contacts.
            </p>
          </div>
        </div>
        <div className="mb-4 flex justify-end">
          <TypeDocumentPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {loading ? (
            <TableSkeleton rows={5} columns={2} />
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
              <p>❌ Erreur lors du chargement des types de document.</p>
              <p>{(error as Error)?.message ?? 'Une erreur inattendue est survenue.'}</p>
            </div>
          ) : typeDocuments?.length === 0 ? (
            <div className="text-center py-4">
              <p>Aucun type de document trouvé.</p>
            </div>
          ) : (
            <TypeDocumentForm typeDocuments={typeDocuments} />
          )}
        </div>
      </AppLayout>
    </TypeDocumentProvider>
  );
}
