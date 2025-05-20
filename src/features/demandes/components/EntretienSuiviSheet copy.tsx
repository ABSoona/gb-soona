'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface EntretienSuiviSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {message: string }) => Promise<void>;
}

export const EntretienSuiviSheet: React.FC<EntretienSuiviSheetProps> = ({ open, onOpenChange, onSubmit }) => {

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {

    setIsSubmitting(true);
    await onSubmit({ message });
    setIsSubmitting(false);
    onOpenChange(false);

    setMessage("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="space-y-4 p-6">
        <SheetHeader>
          <SheetTitle>Réumé de l'entretien</SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
     
          <Textarea
            placeholder="Ecrire ici un resumé de l'entretien avec le bénéficiaire "
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
