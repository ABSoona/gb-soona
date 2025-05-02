'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface NoteSuiviSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { titre: string; message: string }) => Promise<void>;
}

export const NoteSuiviSheet: React.FC<NoteSuiviSheetProps> = ({ open, onOpenChange, onSubmit }) => {
  const [titre, setTitre] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!titre.trim()) return;
    setIsSubmitting(true);
    await onSubmit({ titre, message });
    setIsSubmitting(false);
    onOpenChange(false);
    setTitre("");
    setMessage("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="space-y-4 p-6">
        <SheetHeader>
          <SheetTitle>Nouvelle note de suivi</SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          <Input
            placeholder="Titre de la note"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
          />
          <Textarea
            placeholder="Contenu de la note"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={15}
          />
        </div>

        <SheetFooter className="pt-4">
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
