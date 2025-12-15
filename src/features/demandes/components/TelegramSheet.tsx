'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

interface TelegramSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { message: string,authorizeVote:boolean }) => Promise<void>;
}

export const TelegramSheet: React.FC<TelegramSheetProps> = ({ open, onOpenChange, onSubmit }) => {

  const [message, setMessage] = useState("");
  const [authorizeVote, setAuthorizeVote] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onSubmit({ message,authorizeVote });
      setMessage("");
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors de l'envoi Telegram", error);
      toast({
        title: "Erreur",
        description: "Impossible d’envoyer le message au comité",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="space-y-4 p-6">
        <SheetHeader>
          <SheetTitle>Soumettre au comité Telegram</SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
         
           <Switch
              checked={authorizeVote}
              onCheckedChange={setAuthorizeVote}
                                />
                              
          
          <Textarea
            placeholder="Recomandations / Observations"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={15}
          />
        </div>

        <SheetFooter className="pt-4">
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Enregistrement..." : "Soumettre"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
