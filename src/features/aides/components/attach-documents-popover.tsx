import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/hooks/use-toast';
import { previewDocument } from '@/api/document/documentService';
import { PlusCircledIcon } from '@radix-ui/react-icons';
import { ChevronLeft, ChevronRight, Paperclip } from 'lucide-react';
import { Document } from '@/model/document/Document';

interface Props {
  documents: Document[];
  onAttach: (documentIds: string[]) => Promise<void>;
}

export function AttachDocumentsPopover({ documents, onAttach }: Props) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [isAttaching, setIsAttaching] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);

  // Le document en cours peut disparaître de `documents` juste après son
  // attachement (la liste ne contient que les justificatifs pas encore
  // attachés) : on recale l'index pour rester dans les bornes et afficher
  // naturellement le suivant.
  useEffect(() => {
    if (index > documents.length - 1) {
      setIndex(Math.max(0, documents.length - 1));
    }
  }, [documents.length, index]);

  const currentDoc = documents[index];

  useEffect(() => {
    if (!open || !currentDoc) {
      setPreviewUrl(null);
      setPreviewType(null);
      return;
    }
    let cancelled = false;
    setIsLoadingPreview(true);
    previewDocument(currentDoc)
      .then(({ url, type }) => {
        if (cancelled) return;
        setPreviewUrl(url);
        setPreviewType(type || 'unsupported');
      })
      .catch(() => {
        if (!cancelled) toast({ title: 'Erreur de prévisualisation', variant: 'destructive' });
      })
      .finally(() => {
        if (!cancelled) setIsLoadingPreview(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentDoc?.id]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setIndex(0);
    }
  };

  const handleAttachCurrent = async () => {
    if (!currentDoc) return;
    setIsAttaching(true);
    try {
      await onAttach([currentDoc.id]);
    } finally {
      setIsAttaching(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => handleOpenChange(true)}
        disabled={documents.length === 0}
      >
        <PlusCircledIcon className="h-4 w-4" />
        Attacher un justificatif
      </Button>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="rightfull" className="flex flex-col p-4">
          <SheetHeader>
            <SheetTitle className="truncate">
              {currentDoc ? currentDoc.name ?? currentDoc.contenu.filename : 'Aucun justificatif disponible'}
            </SheetTitle>
            <SheetDescription>{currentDoc?.typeDocument?.label}</SheetDescription>
            <div className="flex justify-between items-center mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index <= 0}
              >
                <ChevronLeft /> Précédent
              </Button>
              {documents.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {index + 1} / {documents.length}
                </span>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => setIndex((i) => Math.min(documents.length - 1, i + 1))}
                disabled={index >= documents.length - 1}
              >
                Suivant <ChevronRight />
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-1 flex items-center justify-center overflow-auto mt-4">
            {isLoadingPreview ? (
              <Spinner size="large" />
            ) : previewType === 'pdf' && previewUrl ? (
              <iframe src={previewUrl} className="w-full h-[75vh] rounded border" />
            ) : ['jpg', 'jpeg', 'png'].includes(previewType || '') && previewUrl ? (
              <img src={previewUrl} alt="preview" className="max-w-full max-h-[75vh] object-contain" />
            ) : (
              <p className="text-sm text-muted-foreground">
                {currentDoc ? 'Aperçu non disponible pour ce format.' : 'Aucun justificatif disponible sur cette demande.'}
              </p>
            )}
          </div>

          <SheetFooter className="flex items-center justify-end mt-4">
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Fermer
              </Button>
              <Button type="button" onClick={handleAttachCurrent} disabled={!currentDoc || isAttaching}>
                <Paperclip className="h-4 w-4" />
                {isAttaching ? 'En cours...' : 'Attacher ce document'}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
