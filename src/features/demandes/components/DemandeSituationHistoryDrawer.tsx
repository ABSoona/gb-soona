'use client';

import { useDemandeSituationHistoryService } from '@/api/demande/demandeService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DemandeSituationHistory } from '@/model/demande/Demande';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronDown, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { categorieTypes } from '../data/data';
import { InfoCard } from './demande-view';

interface Props {
  demandeId?: number;
  demandeCreatedAt?: Date | string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatMontant = (value?: number | null) =>
  value === null || value === undefined ? '—' : `${value.toLocaleString('fr-FR')} €`;

const formatEuro = (value: number) =>
  value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 });

const Champ = ({ label, value }: { label: string; value?: string | number | null }) => {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
};

const SituationCard = ({
  situation,
  periodStart,
  onDelete,
}: {
  situation: DemandeSituationHistory;
  periodStart?: Date | string;
  onDelete: (id: number) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const categorieLabel = categorieTypes.find((c) => c.value === situation.categorieDemandeur)?.label;

  // Memes indicateurs/formules que sur la fiche demande (voir demande-view.tsx),
  // calcules a partir des valeurs figees de cet instantane.
  const totalRevenus = (situation.revenus ?? 0) + (situation.revenusConjoint ?? 0) + (situation.apl ?? 0);
  const totalCharges = (situation.loyer ?? 0) + (situation.facturesEnergie ?? 0) + (situation.autresCharges ?? 0);
  const totalDettes = situation.dettes ?? 0;
  const resteAVivre = totalRevenus - totalCharges;
  const resteAVivreParPersonne =
    resteAVivre > 0 && situation.nombrePersonnes ? resteAVivre / situation.nombrePersonnes / 30 : 0;

  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader
        className="flex flex-row items-start justify-between space-y-0 pb-2 cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start gap-2">
          <ChevronDown
            className={cn('h-4 w-4 mt-1 shrink-0 transition-transform duration-200', expanded && 'rotate-180')}
          />
          <div>
            <CardTitle className="text-base">
              {periodStart
                ? `Situation du ${format(new Date(periodStart), 'dd/MM/yyyy', { locale: fr })} au ${format(new Date(situation.createdAt), 'dd/MM/yyyy', { locale: fr })}`
                : `Situation au ${format(new Date(situation.createdAt), 'dd/MM/yyyy', { locale: fr })}`}
            </CardTitle>
            {situation.creePar && (
              <p className="text-xs text-muted-foreground mt-1">
                Enregistrée par {situation.creePar.firstName} {situation.creePar.lastName}
              </p>
            )}
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(situation.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <InfoCard title="Revenus" value={formatEuro(totalRevenus)} />
                <InfoCard title="Charges" value={formatEuro(totalCharges)} />
                <InfoCard title="Dettes" value={formatEuro(totalDettes)} />
                <InfoCard
                  title="Reste à Vivre"
                  subtitle={resteAVivreParPersonne ? `${formatEuro(resteAVivreParPersonne)} par j/pers` : ''}
                  value={formatEuro(resteAVivre)}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
              <Champ label="Catégorie du bénéficiaire" value={categorieLabel} />
              <Champ label="Nb. de personnes dans le foyer" value={situation.nombrePersonnes} />
              <Champ label="Nombre d'enfants" value={situation.nombreEnfants} />
              <Champ label="Ages des enfants" value={situation.agesEnfants} />
              <Champ label="Situation matrimoniale" value={situation.situationFamiliale} />
              <Champ label="Situation professionnelle" value={situation.situationProfessionnelle} />
              <Champ label="Situation pro. conjoint" value={situation.situationProConjoint} />
              <Champ label="Revenus" value={formatMontant(situation.revenus)} />
              <Champ label="Revenus du conjoint" value={formatMontant(situation.revenusConjoint)} />
              <Champ label="APL" value={formatMontant(situation.apl)} />
              <Champ label="Autres aides" value={situation.autresAides} />
              <Champ label="Loyer mensuel" value={formatMontant(situation.loyer)} />
              <Champ label="Factures énergie" value={formatMontant(situation.facturesEnergie)} />
              <Champ label="Autres charges" value={formatMontant(situation.autresCharges)} />
              <Champ label="Dettes" value={formatMontant(situation.dettes)} />
              <Champ label="Nature des dettes" value={situation.natureDettes} />
              {situation.remarques && (
                <div className="col-span-3 flex flex-col">
                  <span className="text-xs text-muted-foreground">Remarques</span>
                  <span className="text-sm whitespace-pre-line">{situation.remarques}</span>
                </div>
              )}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export function DemandeSituationHistoryDrawer({ demandeId, demandeCreatedAt, open, onOpenChange }: Props) {
  const { demandeSituationHistories, loading, deleteDemandeSituationHistory } =
    useDemandeSituationHistoryService(open ? demandeId : undefined);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-3xl">
        <SheetHeader className="text-left">
          <SheetTitle>Historique des situations</SheetTitle>
          <SheetDescription>
            Instantanés de la situation du demandeur enregistrés au fil du temps.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-full w-full py-1 pr-4">
          {loading && <p className="text-sm text-muted-foreground">Chargement...</p>}
          {!loading && demandeSituationHistories.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aucune situation historisée pour le moment.
            </p>
          )}
          {demandeSituationHistories.map((situation, index) => {
            // Liste triee par createdAt Desc : la situation precedente (plus
            // ancienne) est l'element suivant dans le tableau ; pour la toute
            // premiere historisation, on part de la date de creation de la demande.
            const previous = demandeSituationHistories[index + 1];
            const periodStart = previous ? previous.createdAt : demandeCreatedAt;
            return (
              <SituationCard
                key={situation.id}
                situation={situation}
                periodStart={periodStart}
                onDelete={deleteDemandeSituationHistory}
              />
            );
          })}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
