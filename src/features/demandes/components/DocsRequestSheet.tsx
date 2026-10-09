'use client';

import { EMAIL_TEMPLATE_CODE_DEMANDE_JUSTIFICATIFS, getEmailTemplate } from "@/api/emailTemplate/emailTemplateService";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Spinner } from "@/components/ui/spinner";
import { handleServerError } from "@/utils/handle-server-error";
import { useEffect, useState } from "react";

interface DocsRequestSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { objet: string; message: string; sendMail: boolean; includeUploadLink: boolean }) => Promise<void>;
}

export const DocsRequestSheet: React.FC<DocsRequestSheetProps> = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const [objet, setObjet] = useState("");
  const [message, setMessage] = useState("");
  const [initialMessage, setInitialMessage] = useState<string | null>(null);
  const [includeUploadLink, setIncludeUploadLink] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Recharge le modele a chaque ouverture : il peut avoir ete modifie dans
  // les parametres depuis la derniere utilisation.
  useEffect(() => {
    if (!open) return;
    setInitialMessage(null);
    (async () => {
      try {
        const template = await getEmailTemplate(EMAIL_TEMPLATE_CODE_DEMANDE_JUSTIFICATIFS);
        setObjet(template.objet);
        setMessage(template.corps);
        setInitialMessage(template.corps);
      } catch (e) {
        handleServerError(e);
      }
    })();
  }, [open]);

  const handleSubmit = async (sendMail: boolean) => {
    if (!objet.trim()) return;
    setIsSubmitting(true);
    await onSubmit({ objet: objet, message, sendMail, includeUploadLink });
    setIsSubmitting(false);
    onOpenChange(false);
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
          {initialMessage === null ? (
            <div className="flex items-center justify-center py-10">
              <Spinner size="large" />
            </div>
          ) : (
            <RichTextEditor value={message} onChange={setMessage} initialValue={initialMessage} />
          )}
          <div className="flex items-center gap-2">
            <Checkbox
              id="includeUploadLink"
              checked={includeUploadLink}
              onCheckedChange={(checked) => setIncludeUploadLink(checked === true)}
            />
            <label htmlFor="includeUploadLink" className="text-sm leading-none cursor-pointer">
              Ajouter un bouton permettant au bénéficiaire de déposer ses justificatifs en ligne
            </label>
          </div>
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
