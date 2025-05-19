import { downloadDocument, previewDocument } from '@/api/document/documentService';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from '@/hooks/use-toast';
import { Document } from "@/model/document/Document";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { IconDownload, IconTrash } from "@tabler/icons-react";
import { format } from "date-fns";
import { CalendarDays, File } from "lucide-react";
import { useState } from "react";
import DocumentPreviewSheet from './ocumentPreviewSheet';
import { AttachmentType } from '@/model/typeDocument/typeDocument';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { AvatarFallback } from '@radix-ui/react-avatar';





interface Props {
  contactId: number;
  documents: Document[];
  nbColumns?: number;
  onUpload: (contactId: number, file: File, typeId: number, demandeId: number) => Promise<void>;
  onDelete: (docId: string) => Promise<void>;
  attachement?: AttachmentType


}

export function DocumentsManager({ contactId, documents, nbColumns, onUpload, onDelete, attachement }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [document, setDocument] = useState<Document | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const className = nbColumns ? `grid grid-cols-${nbColumns}  gap-4 max-w-[500px] `
    : "grid grid-cols-4 md:grid-cols-3 sm:grid-cols-1 gap-4 max-w-[500px] "


  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const goTo = async (index: number) => {
    const doc = documents[index];
    if (!doc) return;
    const { url, type } = await previewDocument(doc);
    setCurrentIndex(index);
    setPreviewUrl(url);
    setDocument(doc);
    setPreviewType(type || 'unsupported');
  };

  const goNext = () => {
    if (currentIndex !== null && currentIndex < documents.length - 1) {
      void goTo(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex !== null && currentIndex > 0) {
      void goTo(currentIndex - 1);
    }
  };
  const handlePreview = async (doc: Document) => {
    try {
      const { url, type } = await previewDocument(doc);
      if (type === 'unsupported') {
        toast({ title: 'Format non supporté', variant: 'destructive' });
      } else {
        const index = documents.findIndex((d) => d.id === doc.id);
        setCurrentIndex(index);
        setPreviewUrl(url);
        setDocument(doc);
        setPreviewType(type || 'unsupported');
        setOpen(true);
      }
    } catch (e) {
      toast({ title: 'Erreur de prévisualisation', variant: 'destructive' });
    }
  };
  return (
    <>
      {/* Document Grid */}
      <div className="space-y-6">
        <div className={className}>
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="border rounded-lg p-4 flex flex-col items-center bg-white shadow hover:shadow-lg transition relative cursor-pointer"
              onClick={() => handlePreview(doc)}
            >
              {/* Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="absolute top-2 right-2 h-8 w-8 p-0 data-[state=open]:bg-muted"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DotsHorizontalIcon className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[180px]">
                  <DropdownMenuItem onClick={() => downloadDocument(doc.id, doc.contenu.filename)}>
                    Télécharger
                    <DropdownMenuShortcut>
                      <IconDownload size={16} />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(doc.id)}
                    className="!text-red-500"
                  >
                    Supprimer
                    <DropdownMenuShortcut>
                      <IconTrash size={16} />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <File className="h-8 w-8 text-primary mb-2" />
              <HoverCard>
                <HoverCardTrigger asChild>
                  <p className="first-letter:uppercase text-center text-xs font-medium truncate w-full cursor-default">
                    {doc.name ?? doc.contenu.filename}
                  </p>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="flex space-x-4">
                  <File className="h-8 w-8 text-primary mb-2" />
                    <div className="space-y-1">
                    <h3 className="first-letter:uppercase text-sm">
                      {doc.typeDocument?.label ?? "Type de document inconnu"} 
                      </h3>
                      <p className="text-sm font-semibold"> {doc.name ?? doc.contenu.filename}</p>
                     
                      <div className="flex items-center pt-2">
                        <CalendarDays className="mr-2 h-4 w-4 opacity-70" />{" "}
                        <span className="text-xs text-muted-foreground">
                          Ajouté le {new Date(doc.createdAt).toLocaleDateString('FR-fr')}
                        </span>
                      </div>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>

              {/*  <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>{doc.contenu.filename}</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider> */}
              <div className="flex justify-center w-full gap-2 mt-2 text-xs text-muted-foreground text-center">
                {doc.typeDocument?.label}
                {/*    Ajouté le {format(new Date(doc.createdAt), 'dd/MM/yyyy')} */}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Sheet Preview */}
      <DocumentPreviewSheet
        open={open}
        onOpenChange={setOpen}
        previewUrl={previewUrl}
        document={document}
        previewType={previewType}
        onNext={goNext}
        onPrev={goPrev}
        canNext={currentIndex !== null && currentIndex < documents.length - 1}
        canPrev={currentIndex !== null && currentIndex > 0}
        doctypeAttachment={attachement}
      />
    </>
  );
}
