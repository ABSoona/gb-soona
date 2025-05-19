import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Document } from "@/model/document/Document";
import { useTypeDocumentService } from "@/api/typeDocument/typeDocumentService";
import { useDocumentService } from "@/api/document/documentService";
import { AttachmentType, TypeDocument } from "@/model/typeDocument/typeDocument";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewUrl: string | null;
  document: Document | null;
  previewType: string | null;
  onNext?: () => void;
  onPrev?: () => void;
  canNext?: boolean;
  canPrev?: boolean;
  doctypeAttachment?: AttachmentType;
  showType?: boolean;
}

export default function DocumentPreviewSheet({
  open,
  onOpenChange,
  previewUrl,
  document,
  doctypeAttachment,
  showType = true,
  previewType,
  onNext,
  onPrev,
  canNext,
  canPrev,
}: Props) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingType, setIsEditingType] = useState(false);
  const [name, setName] = useState(document?.name || "");
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(document?.typeDocument.id || null);

  const where = doctypeAttachment ? { rattachement: doctypeAttachment } : {};
  const { typeDocuments }: { typeDocuments: TypeDocument[] } = useTypeDocumentService({
    where: where,
  });
  const { updateDocument } = useDocumentService();

  useEffect(() => {
    setName(document?.name || "");
    setSelectedTypeId(document?.typeDocument.id || null);
  }, [document]);

  const handleNameSave = async () => {
    if (document && name !== document.name) {
      await updateDocument(document.id, { name });
      toast({ title: "Nom mis à jour" });
    }
    setIsEditingName(false);
  };

  const handleTypeChange = async (newTypeId: string) => {
    if (document) {
      const newType = typeDocuments.find(t => t.id === Number(newTypeId));
      if (newType) {
        setSelectedTypeId(newType.id);
        await updateDocument(document.id, { typeDocument: { id: newType.id } });
        toast({ title: "Type mis à jour" });
      }
    }
    setIsEditingType(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="rightfull" className="p-4">
        <SheetHeader>
          <SheetTitle>
            {isEditingName ? (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameSave();
                  if (e.key === 'Escape') {
                    setName(document?.name || "");
                    setIsEditingName(false);
                  }
                }}
                autoFocus
                className="w-[400px] text-xl font-semibold"
              />
            ) : (
              <span onClick={() => setIsEditingName(true)} className="cursor-pointer hover:underline">
                {name || document?.contenu.filename}
              </span>
            )}
          </SheetTitle>

          <SheetDescription>
            {showType && (
              isEditingType ? (
                <Select
                  value={selectedTypeId?.toString()}
                  onValueChange={handleTypeChange}
                >
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Type de document" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeDocuments.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => setIsEditingType(true)}
                >
                  {typeDocuments.find(t => t.id === selectedTypeId)?.label}
                </span>
              )
            )}
          </SheetDescription>

          <div className="flex justify-between items-center mt-2">
            <Button onClick={onPrev} disabled={!canPrev} variant="outline">
              ← Précédent
            </Button>
            <Button onClick={onNext} disabled={!canNext} variant="outline">
              Suivant →
            </Button>
          </div>
        </SheetHeader>

        {previewType === "pdf" && previewUrl && (
          <iframe src={previewUrl} className="w-full h-[80vh] rounded border mt-4" />
        )}

        {["jpg", "jpeg", "png"].includes(previewType || "") && previewUrl && (
          <img
            src={previewUrl}
            alt="preview"
            className="w-full max-h-[80vh] object-contain mt-4"
          />
        )}

        <SheetClose asChild>
          <Button variant="outline" className="mt-4">
            Fermer
          </Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}
