'use client';

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { DecisionType } from "@/model/decision/Decision";
import { useEffect, useState } from "react";

interface DecisionSheetProps {
  type: DecisionType | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { type: DecisionType; motivation: string }) => Promise<void>;
}

const DECISION_LABELS: Record<DecisionType, { title: string; description: string }> = {
  Approbation: {
    title: "Approuver la demande",
    description: "Cette decision sera consignee dans l'onglet Comite. Vous pourrez ensuite ajouter une ou plusieurs aides.",
  },
  Refus: {
    title: "Rejeter la demande",
    description: "Cette decision sera consignee dans l'onglet Comite.",
  },
  Ajournement: {
    title: "Ajourner la demande",
    description: "La demande repart au statut Pre-comite, en attente d'une nouvelle presentation au comite.",
  },
};

export function DecisionSheet({ type, onOpenChange, onSubmit }: DecisionSheetProps) {
  const [motivation, setMotivation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (type) {
      setMotivation("");
    }
  }, [type]);

  const handleSubmit = async () => {
    if (!type || !motivation.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({ type, motivation });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const labels = type ? DECISION_LABELS[type] : null;

  return (
    <Sheet open={!!type} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="space-y-4 p-6">
        <SheetHeader>
          <SheetTitle>{labels?.title}</SheetTitle>
          <SheetDescription>{labels?.description}</SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          <Textarea
            placeholder="Motivation de la decision"
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            rows={10}
          />
        </div>

        <SheetFooter className="pt-4">
          <Button onClick={handleSubmit} disabled={isSubmitting || !motivation.trim()} className="w-full">
            {isSubmitting ? "Enregistrement..." : "Confirmer"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
