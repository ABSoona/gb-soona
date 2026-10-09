'use client';

import {
  EMAIL_TEMPLATE_CODE_DEMANDE_JUSTIFICATIFS,
  EMAIL_TEMPLATE_CODE_DEMANDE_JUSTIFICATIFS_WHATSAPP,
  getEmailTemplate,
} from "@/api/emailTemplate/emailTemplateService";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { handleServerError } from "@/utils/handle-server-error";
import { useEffect, useState } from "react";

type Channel = "email" | "whatsapp";

interface DocsRequestSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactHasEmail: boolean;
  contactHasPhone: boolean;
  onSubmit: (data: {
    objet: string;
    message: string;
    sendMail: boolean;
    includeUploadLink: boolean;
    sendWhatsapp: boolean;
    whatsappMessage: string;
  }) => Promise<void>;
}

export const DocsRequestSheet: React.FC<DocsRequestSheetProps> = ({
  open,
  onOpenChange,
  contactHasEmail,
  contactHasPhone,
  onSubmit,
}) => {
  const [activeTab, setActiveTab] = useState<Channel>("email");

  const [objet, setObjet] = useState("");
  const [message, setMessage] = useState("");
  const [initialMessage, setInitialMessage] = useState<string | null>(null);
  const [includeUploadLink, setIncludeUploadLink] = useState(true);

  const [whatsappMessage, setWhatsappMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Recharge les modeles a chaque ouverture : ils peuvent avoir ete modifies
  // dans les parametres depuis la derniere utilisation.
  useEffect(() => {
    if (!open) return;
    setInitialMessage(null);
    setActiveTab(contactHasEmail ? "email" : "whatsapp");
    (async () => {
      try {
        const [template, templateWhatsapp] = await Promise.all([
          getEmailTemplate(EMAIL_TEMPLATE_CODE_DEMANDE_JUSTIFICATIFS),
          getEmailTemplate(EMAIL_TEMPLATE_CODE_DEMANDE_JUSTIFICATIFS_WHATSAPP),
        ]);
        setObjet(template.objet);
        setMessage(template.corps);
        setInitialMessage(template.corps);
        setWhatsappMessage(templateWhatsapp.corps);
      } catch (e) {
        handleServerError(e);
      }
    })();
  }, [open, contactHasEmail, contactHasPhone]);

  const handleSkip = async () => {
    setIsSubmitting(true);
    await onSubmit({
      objet,
      message,
      sendMail: false,
      includeUploadLink,
      sendWhatsapp: false,
      whatsappMessage,
    });
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleSend = async (channel: Channel) => {
    if (channel === "email" && !objet.trim()) return;
    setIsSubmitting(true);
    await onSubmit({
      objet,
      message,
      sendMail: channel === "email",
      includeUploadLink,
      sendWhatsapp: channel === "whatsapp",
      whatsappMessage,
    });
    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="rightfull" className="flex flex-col h-full p-6">
        <SheetHeader>
          <SheetTitle>Demande de pièces justificatives</SheetTitle>
          <SheetDescription>
          Rédigez le(s) message(s) à envoyer au bénéficiaire pour lui demander des pièces justificatives.<br/>
          Sinon vous pouvez vous en charger vous-même depuis votre propre messagerie.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-y-auto mt-4">
        {initialMessage === null ? (
          <div className="flex items-center justify-center py-10">
            <Spinner size="large" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Channel)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" disabled={!contactHasEmail}>
                Email{!contactHasEmail && " (indisponible)"}
              </TabsTrigger>
              <TabsTrigger value="whatsapp" disabled={!contactHasPhone}>
                WhatsApp{!contactHasPhone && " (indisponible)"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-3 pt-4">
              <Input
                placeholder="Objet du mail"
                value={objet}
                onChange={(e) => setObjet(e.target.value)}
              />
              <RichTextEditor value={message} onChange={setMessage} initialValue={initialMessage} />
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
            </TabsContent>

            <TabsContent value="whatsapp" className="space-y-3 pt-4">
              <Textarea
                value={whatsappMessage}
                onChange={(e) => setWhatsappMessage(e.target.value)}
                rows={14}
              />
              <p className="text-xs text-muted-foreground">
                Le bénéficiaire pourra répondre directement avec des photos de ses documents : elles
                s'ajoutent automatiquement à son dossier, à classer ensuite dans l'application.
              </p>
            </TabsContent>
          </Tabs>
        )}
        </div>

        <SheetFooter className="pt-4 flex justify-end gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enregistrement..." : "Je préfère envoyer moi-même"}
          </Button>
          {activeTab === "email" ? (
            <Button onClick={() => handleSend("email")} disabled={isSubmitting || !contactHasEmail}>
              {isSubmitting ? "Envoi en cours..." : "Envoyer par email"}
            </Button>
          ) : (
            <Button onClick={() => handleSend("whatsapp")} disabled={isSubmitting || !contactHasPhone}>
              {isSubmitting ? "Envoi en cours..." : "Envoyer par WhatsApp"}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
