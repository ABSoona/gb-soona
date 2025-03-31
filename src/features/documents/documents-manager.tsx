import { useState } from "react"; 
import { File, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { IconDownload, IconTrash } from "@tabler/icons-react";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { downloadDocument, previewDocument } from '@/api/document/documentService';
import { toast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose
} from '@/components/ui/sheet';

interface Document {
  id: string;
  createdAt: string;
  updatedAt: string;
  contenu: { filename: string; url: string };
}

interface Props {
  contactId: number;
  documents: Document[];
  onUpload: (file: File) => Promise<void>;
  onDelete: (docId: string) => Promise<void>;
}

export function DocumentsManager({ contactId, documents, onUpload, onDelete }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [docName, setDocName] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handlePreview = async (doc: Document) => {
    try {
      const { url, type } = await previewDocument(doc);
      if (type === 'unsupported') {
        toast({ title: 'Format non supporté pour la prévisualisation', variant: 'destructive' });
      } else {
        setPreviewUrl(url);
        setDocName(doc.contenu.filename)
        setPreviewType(type ||'unsupported');
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-[500px] ">
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
                    <p className="text-center text-sm font-medium truncate w-full cursor-default">
                      {doc.contenu.filename}
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
