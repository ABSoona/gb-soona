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
import { File } from "lucide-react";
import { useState } from "react";




interface Props {
  contactId: number;
  documents: Document[];
  nbColumns?:number;
  onUpload: (contactId: number, file: File, typeId: number, demandeId: number) => Promise<void>;
  onDelete: (docId: string) => Promise<void>;


}

export function DocumentsManager({ contactId, documents, nbColumns,onUpload, onDelete }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [docName, setDocName] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const className = nbColumns? `grid grid-cols-${nbColumns}  gap-4 max-w-[500px] `
  :"grid grid-cols-4 md:grid-cols-3 sm:grid-cols-1 gap-4 max-w-[500px] "



  const handlePreview = async (doc: Document) => {
    try {
      const { url, type } = await previewDocument(doc);
      if (type === 'unsupported') {
        toast({ title: 'Format non supporté pour la prévisualisation', variant: 'destructive' });
      } else {
        setPreviewUrl(url);
        setDocName(doc.contenu.filename)
        setPreviewType(type || 'unsupported');
        setOpen(true);
      }
    } catch (e) {
      toast({ title: 'Erreur lors de la prévisualisation', variant: 'destructive' });
    }
  };

  return (
    <>
      {/* Document Grid */}
      <div className="space-y-6">
        <div className= {className}>
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="first-letter:uppercase text-center text-sm font-medium truncate w-full cursor-default">
                      {doc.typeDocument?.label}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>{doc.contenu.filename}</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="flex justify-center w-full gap-2 mt-2 text-xs text-muted-foreground text-center">
                Ajouté le {format(new Date(doc.createdAt), 'dd/MM/yyyy')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Sheet Preview */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="rightfull" className="p-4">
          <SheetHeader>
            <SheetTitle>{docName}</SheetTitle>
          </SheetHeader>
          {previewType === 'pdf' && (
            <iframe src={previewUrl!} className="w-full h-[80vh] rounded border mt-4" />
          )}
          {['jpg', 'png', 'jpeg'].includes(previewType || '') && (
            <img src={previewUrl!} alt="preview" className="w-full max-h-[80vh] object-contain mt-4" />
          )}
          <SheetClose asChild>
            <Button variant="outline" className="mt-4">Fermer</Button>
          </SheetClose>
        </SheetContent>
      </Sheet>
    </>
  );
}
