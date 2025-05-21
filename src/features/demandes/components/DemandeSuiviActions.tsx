// src/features/demandes/components/DemandeSuiviActions.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
  import { Plus, CheckCircle, PauseCircle, PhoneMissed, PhoneCall, StickyNote, UserCheck, FilePlus2, MapPin, ExternalLink, RefreshCwOff } from 'lucide-react';
  import { TabsContent } from '@radix-ui/react-tabs';
  import { Button } from '@/components/ui/button';
  import { DemandeActivityTimeline } from './DemandeActivityTimeline';
  import { VisiteList } from '@/features/visites/components/visite-cads-list';
  import { Demande, DemandeStatus } from '@/model/demande/Demande';
  import { Visite } from '@/model/visite/Visite';
  import { useState, useRef } from 'react';
  
  interface Props {
    currentRow: Demande;
    hasContactAttempts: boolean;
    hasDocument: boolean;
    hasPedingVisite: boolean;
    handleAcceptDemande: () => void;
    handleRefuserDemande: () => void;
    handleEchecContact: () => void;
    handleSuccessContact: (open :boolean) => void;
    setOpenNoteSheet: (open: boolean) => void;
    handleOpenAssigSheet: () => void;
    handleDocsRequest: () => void;
    handleOpenVisiteSheet: () => void;
    setOpenShareFicheVisite: (open: boolean) => void;
    handleAbandonnerDemande: () => void;
    onRapportAdded: () => void;
  }
  
  export function DemandeSuiviActions({
    currentRow,
    hasContactAttempts,
    hasDocument,
    hasPedingVisite,
    handleAcceptDemande,
    handleRefuserDemande,
    handleEchecContact,
    handleSuccessContact,
    setOpenNoteSheet,
    handleOpenAssigSheet,
    handleDocsRequest,
    handleOpenVisiteSheet,
    setOpenShareFicheVisite: setOpenShareDemande,
    handleAbandonnerDemande,
    onRapportAdded,
  }: Props) {
    if (!currentRow) return null;
  
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Suivi et actions</CardTitle>
          {!['clôturée', 'Abandonnée',  'refusée'].includes(currentRow.status) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Plus className="h-4 w-4" /> Ajouter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {currentRow.status === 'en_commision' && (
                  <>
                    <DropdownMenuLabel>Décision</DropdownMenuLabel>
                    <DropdownMenuItem onClick={handleAcceptDemande}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approuver la demande
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleRefuserDemande}>
                      <PauseCircle className="mr-2 h-4 w-4" />
                      Rejeter la demande
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuLabel>Evénements</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleEchecContact}>
                  <PhoneMissed className="mr-2 h-4 w-4" />
                  Prise de contact échouée
                </DropdownMenuItem>
                <DropdownMenuItem onClick={()=>handleSuccessContact(true)}>
                  <PhoneCall className="mr-2 h-4 w-4" />
                  Entretien avec le bénéficiaire
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpenNoteSheet(true)}>
                  <StickyNote className="mr-2 h-4 w-4" />
                  Note de suivi
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleOpenAssigSheet}>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Affecter la demande à...
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDocsRequest} disabled={!hasContactAttempts}>
                  <FilePlus2 className="mr-2 h-4 w-4" />
                  Demander des justificatifs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleOpenVisiteSheet} disabled={["recue", "EnAttente"].includes(currentRow.status) || !hasContactAttempts || !hasDocument || hasPedingVisite}>
                  <MapPin className="mr-2 h-4 w-4" />
                  Organiser une visite
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpenShareDemande(true)}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Partager la demande (PDF)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleAbandonnerDemande}>
                  <RefreshCwOff className="mr-2 h-4 w-4" />
                  Abandonner la demande
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>
        <CardContent className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
          <Tabs defaultValue="Activites" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="Activites">Activités</TabsTrigger>
              <TabsTrigger value="Visites">Visites</TabsTrigger>
            </TabsList>
            <TabsContent value="Activites">
              <DemandeActivityTimeline demandeId={currentRow.id} activities={currentRow.demandeActivities} />
            </TabsContent>
            <TabsContent value="Visites">
              <VisiteList demandeId={currentRow.id} onRapportAdded={onRapportAdded} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }
  