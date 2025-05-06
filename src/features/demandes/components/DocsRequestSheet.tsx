'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";

interface DocsRequestSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { objet: string; message: string; sendMail: boolean }) => Promise<void>;
}

export const DocsRequestSheet: React.FC<DocsRequestSheetProps> = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const [objet, setObjet] = useState("Pièces justificatives");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (sendMail: boolean) => {
    if (!objet.trim()) return;
    setIsSubmitting(true);
    await onSubmit({ objet: objet, message, sendMail });
    setIsSubmitting(false);
    onOpenChange(false);
    setObjet("");
    setMessage("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="rightfull" className="space-y-4 p-6">
        <SheetHeader>
          <SheetTitle>Demande de pièces justificatives</SheetTitle>
          <SheetDescription>
          Rédigez le message à envoyer au bénéficiaire pour lui demander des pièces justificatives.<br/>
          Sinon Vous pouvez envoyer le mail vous-même depuis votre propre messagerie .
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          <Input
            placeholder="Objet du mail"
            value={objet}
            onChange={(e) => setObjet(e.target.value)}
          />
          <RichTextEditor value={message} onChange={setMessage}  initialValue="<p>Bonjour, veuillez nous transmettre les documents suivants :</p><ul><li>Justificatif de domicile</li><li>Dernier avis d’imposition</li></ul>" />
        </div>

        <SheetFooter className="pt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enregistrement..." : "Je préfère envoyer moi-même"}
          </Button>
          <Button
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Envoi en cours..." : "Envoyer"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
