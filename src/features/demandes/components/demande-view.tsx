'use client'


import { useContactService } from '@/api/contact/contact-service'
import { shareFicheVisite, useDemandeService } from '@/api/demande/demandeService'
import { useDocumentService } from '@/api/document/documentService'
import { useTypeDocumentService } from '@/api/typeDocument/typeDocumentService'
import { useUserServicev2 } from '@/api/user/userService.v2'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { columns as aidecolumns } from '@/features/aides/components/aides-columns'
import { AidesDialogs } from '@/features/aides/components/aides-dialogs'
import { AidesTable } from '@/features/aides/components/aides-table'
import { useAides } from '@/features/aides/context/aides-context'
import { DocumentsManager } from '@/features/documents/documents-manager'
import { useDocumentActions } from '@/features/documents/useDocumentActions'
import { getUserId } from '@/lib/session'
import { ActivityType, Demande, DemandeStatus, situationFamilleTypes, situationTypes } from '@/model/demande/Demande'
import { Document } from '@/model/document/Document'
import { TypeDocument } from '@/model/typeDocument/typeDocument'
import { User } from '@/model/user/User'
import { TabsContent } from '@radix-ui/react-tabs'
import { useNavigate } from '@tanstack/react-router'
import { addMonths } from 'date-fns'
import { ChevronDown, Files, Plus } from 'lucide-react'
import { useRef, useState } from 'react'
import { categorieTypes } from '../data/data'
import CoordinateursMapSheet from './assign-coordinateur'
import { AssignDemandeSheet } from './assign-demande-dialog'
import { useConfirmDialog } from './demande-confirm-dialog'
import { DocsRequestSheet } from './DocsRequestSheet'
import { NoteSuiviSheet } from './NoteSuiviSheet'
import { FicheVisiteShareSheet } from './shareFicheVisite'
import { useVisiteService } from '@/api/visite/invitationService'
import { Visite } from '@/model/visite/Visite'
import { DemandeSuiviActions } from './DemandeSuiviActions'
import { EntretienSuiviSheet } from './EntretienSuiviSheet'
import { calculerAge } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'
import { TelegramSheet } from './TelegramSheet'
import { telegramPublish } from '@/api/telegram/telegramService'
import { buildTelegramMessage } from './telegram-utils'


interface Props {
  currentRow: Demande,
  showContact?: boolean,
  showAides?: boolean,
  showDocuements?: boolean,


}

export function DemandeView({ currentRow, showContact = true, showAides = true, showDocuements = true }: Props) {
  if (!currentRow) {
    return null
  }

  const { documents, loading: isLoadingDocuments } = useDocumentService({
    where: { demande: { id: currentRow.id } }
  });

  const suiviDdemandeur = documents.filter((doc: Document) => doc.typeDocument?.rattachement === "Demande");
  const userId = getUserId();
  const { handleFileUpload, handleDelete } = useDocumentActions({ demande: { id: currentRow.id } });
  const { createDemandeActivity, updateDemande } = useDemandeService({ where: { id: { equals: currentRow.id } } });
  const [openNoteSheet, setOpenNoteSheet] = useState(false);
  const [openEntretienSheet, setOpenEntretienSheet] = useState(false);
  const [openShareFicheVisite, setOpenShareFicheVisite] = useState(false);
  const [openTelegramSheet, setOpenTelegramSheet] = useState(false);

  const [openDocsRequestSheet, setOpenDocsRequestSheet] = useState(false);
  const [openAssignDemandeSheet, setOpenAssignDemandeSheet] = useState(false);
  const [openVisiteSheet, setOpenVisiteSheet] = useState(false);

  const { openConfirmDialog, ConfirmDialogComponent } = useConfirmDialog()
  const pendingStatusUpdate = useRef(false);
  const nextStatusRef = useRef<DemandeStatus | null>(null);
  const fewAidesColumns = aidecolumns.filter(column =>
    column.id && ['dateAide', 'montant', 'frequence', 'status'].includes(column.id)
  );
  const totalRevenus = (currentRow?.revenus ?? 0) + (currentRow?.revenusConjoint ?? 0) + (currentRow?.apl ?? 0)
  const totalCharges = (currentRow?.loyer ?? 0) + (currentRow?.facturesEnergie ?? 0) + (currentRow?.autresCharges ?? 0)
  const totalDettes = currentRow?.dettes ?? 0
  const totalAides = currentRow?.contact?.aides?.reduce((acc, aide) => acc + (aide.montant ?? 0), 0) ?? 0
  const resteAVivre = totalRevenus - totalCharges
  const resteAVivreParPersonne = resteAVivre > 0 ? resteAVivre / currentRow.nombrePersonnes / 30 : 0
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputMultiRef = useRef<HTMLInputElement>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const { sendMessage } = useContactService({ where: { id: { equals: currentRow.contact.id } } }); // ✅ Utilisation du service

  const { visites, createVisite, refetch: refetchVisites } = useVisiteService({ where: { demande: { id: currentRow.id } } })

  const hasDocument = suiviDdemandeur && suiviDdemandeur.length > 0
  const { setOpenAide } = useAides()
  const { typeDocuments }: { typeDocuments: TypeDocument[] } = useTypeDocumentService();
  const typeDocumentsDemande = typeDocuments.filter((e) => (e.rattachement == "Demande" && e.internalCode !== 'unknown_demande'))
  const typeDocumentUnknown = typeDocuments.filter((e) => (e.rattachement == "Demande" && e.internalCode == 'unknown_demande'))[0]
  const handleTypeClick = (typeId: number) => {
    setSelectedTypeId(typeId);
    fileInputRef.current?.click();
  };
  const navigate = useNavigate();
  const { users }: { users: User[] } = useUserServicev2({ where: { role: { equals: "tresorier" } } })
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file && selectedTypeId) {
      await handleFileUpload(currentRow.contact.id, file, selectedTypeId, currentRow.id);
      setSelectedTypeId(null);
      e.target.value = '';
    }
  };
  const handleMultipleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    for (const file of files) {
      // Optionnel : demander à l'utilisateur le type de document (via un prompt ou une modale)
      const typeId = selectedTypeId || typeDocumentsDemande[0]?.id;
      if (!typeId) continue;

      await handleFileUpload(currentRow.contact.id, file, typeDocumentUnknown.id, currentRow.id);
    }

    // Reset input
    e.target.value = '';
  };

  const handleEchecContact = async () => {
    if (["recue", "EnAttenteDocs"].includes(currentRow.status) && (currentRow.nombreRelances && currentRow.nombreRelances > 2)) {
      nextStatusRef.current = "EnAttente";
      openConfirmDialog(
        "Mettre en attente ?",
        `Le bénéficiaire est injoignable après 4 tentavives de contact.
         Souhaitez-vous mettre la demande en attente?
         Sans retour du bénéficiaire, la demande sera cloturée automatiquement le ${addMonths(new Date(), 1).toLocaleDateString()}`,
        handleConfirmedStatusChange,
        { confirmText: "Oui", cancelBtnText: "Annuler" }
      );
    }
    await createDemandeActivity({
      titre: "Echec de contact",
      message: "Impossible de joindre le bénéficiaire.",
      typeField: "priseContactEchec", // ici très important
      demandeId: currentRow.id,
      userId: userId!,
    });
  }


  const handleRefuserDemande = async () => {
    nextStatusRef.current = "refusée";
    await updateDemande(currentRow.id, { status: nextStatusRef.current, decisionDate: new Date() });
  }

  const handleAcceptDemande = async () => {
    nextStatusRef.current = "EnCours";
    openConfirmDialog(
      "Ajouter une aide ?",
      "Souhaitez-vous ajouter une aide maintenant ?",
      handleAddAide,
      { confirmText: "Oui", cancelBtnText: "Annuler" }
    );
    const firstTresorier: User | undefined = users.length > 0 ? users[0] : undefined;
    await updateDemande(currentRow.id, { decisionDate: new Date(), status: nextStatusRef.current, ...(firstTresorier && { acteur: { id: firstTresorier.id } }), });
  }

  const handleAskAgainAide = async ()=>{
    openConfirmDialog(
      "Ajouter une autre aide ?",
      "Souhaitez-vous ajouter une autre aide ?",
      handleAddAide,
      { confirmText: "Oui", cancelBtnText: "Annuler" }
    );

  }

  const handleSubmitNote = async ({ titre, message }: { titre: string; message: string }) => {
    await createDemandeActivity({
      titre,
      message,
      typeField: "note", // ici très important
      demandeId: currentRow.id,
      userId: userId!,
    });
  };
  const handleSubmitEntretien = async ({ message }: { message: string }) => {
    await createDemandeActivity({
      titre: "Entretien avec le bénéficiaire",
      message: message,
      typeField: "priseContactReussie", // ici très important
      demandeId: currentRow.id,
      userId: userId!,
    });
  };


  const handleSubmitFicheVisite = async ({ userId }: { userId: string; message: string }) => {
    await shareFicheVisite({ demandeId: currentRow.id, userId: userId, subordoneId: userId });
    setOpenShareFicheVisite(false);
  };

  const handleSubmitTelegram = async ({ message,authorizeVote }: { message: string, authorizeVote:boolean }) => {
    const lines = buildTelegramMessage(currentRow, message);
    const demandeUrl = `${window.location.origin}/demandes/${currentRow.id}`;
    await telegramPublish({
      demandeId: currentRow.id,
      title: `Demande #${currentRow.id}`,
      lines,
      demandeUrl: demandeUrl,
      authorizeVote : authorizeVote
    });

    setOpenTelegramSheet(false);
  };

  const handDownloadFicheVisite = async () => {
    navigate({ to: `/demandes/${currentRow.id}/pdf` });
  }

  const handleSubmitDocsRequest = async ({
    objet,
    message,
    sendMail,
  }: {
    objet: string;
    message: string;
    sendMail: boolean;
  }) => {
    if (sendMail) {
      await sendMessage({
        contactId: currentRow.contact.id.toString(),
        objet,
        message,

      });
    }
    await updateDemande(currentRow.id, { status: "EnAttenteDocs" });
  };

  const handleConfirmedStatusChange = async () => {
    if (nextStatusRef.current) {
      await updateDemande(currentRow.id, { status: nextStatusRef.current });
    }
    nextStatusRef.current = null;
  };

  const handleAddAide = async () => {
   
      setOpenAide('add');

    nextStatusRef.current = null;
  };

  const handleDocsRequest = async () => {
    setOpenDocsRequestSheet(true)
  };

  const handleOpenVisiteSheet = async () => {
    setOpenVisiteSheet(true); // Ouvre la Sheet
  };


  const handleAbandonnerDemande = async () => {
    await updateDemande(currentRow.id, { status: "Abandonnée" });
  }

  const handleOpenAssigSheet = async () => {
    setOpenAssignDemandeSheet(true); // Ouvre la Sheet
  };

  const handleSubmitAssignDemande = async ({ userId }: { userId: string; message: string }) => {
    await updateDemande(currentRow.id, { acteur: { id: userId } })
  };

  const hasContactAttempts: boolean = (currentRow.demandeActivities.filter((e) => (e.typeField === "priseContactReussie"))).length > 0
  const hasPedingVisite: boolean = visites.filter((e: Visite) => (e.status === 'Programee' || e.status === 'Planifiee')).length > 0

  async function handleChnageToEnComite() {
    await createDemandeActivity({
      titre: "Rapport de visite ajouté",
      message: "Un rapport de visite a été ajouté à la demande.",
      typeField: "docAjout",
      demandeId: currentRow.id,
      userId: userId!,
    });

    if (currentRow.status === "en_visite") {
      pendingStatusUpdate.current = true;
      openConfirmDialog(
        "Passer la demande en commission ?",
        "Souhaitez-vous soumette cette demande à la comité » ?",
        async () => {
          if (pendingStatusUpdate.current) {

            await updateDemande(currentRow.id, {
              status: "en_commision",

            });
            pendingStatusUpdate.current = false;
          }
        },
        { confirmText: "Confirmer", cancelBtnText: "Annuler", destructive: false }
      );
    }
  }

  async function onRapportAdded() {
    handleChnageToEnComite()
  }

  async function onVisitDone() {
    handleChnageToEnComite()
  }

  const handleAssign = async (data: { visiteur: User }) => {
    console.log("Assignation déclenchée côté parent avec :", data.visiteur.id);
    const coordinateur = data.visiteur.superieur ?? data.visiteur;
    await createVisite({ acteur: { id: data.visiteur.id }, demande: { id: currentRow.id }, status: 'Programee' })
    await updateDemande(currentRow.id, {
      status: "en_visite", acteur: { id: coordinateur.id }

    });


    setOpenVisiteSheet(false);
  };

  return (
    
    <div className="sm:min-w-full grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-3 md:grid-cols-1 gap-6 mt-6">
      {currentRow.telegramComiteeAction && (
  <div className="col-span-full">
    <Card className="border-green-500 bg-green-50 dark:bg-green-900/20">
      <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4">
        <div>
          <p className="font-semibold text-green-700 dark:text-green-300">
            Demande traitée lors du comité Telegram
          </p>
          <p className="text-sm text-green-600 dark:text-green-400">
            Vous pouvez confirmer la décision et ajouter une aide.
          </p>
        </div>

        <Button onClick={handleAcceptDemande}>
          Confirmer
        </Button>
      </CardContent>
    </Card>
  </div>
)}

      {showContact && (
        <div className="col-span-1">
          <DemandeSuiviActions
            currentRow={currentRow}
            hasContactAttempts={hasContactAttempts}
            hasDocument={hasDocument}
            hasPedingVisite={hasPedingVisite}
            handleAcceptDemande={handleAcceptDemande}
            handleRefuserDemande={handleRefuserDemande}
            handleEchecContact={handleEchecContact}
            handleSuccessContact={setOpenEntretienSheet}
            setOpenNoteSheet={setOpenNoteSheet}
            handleOpenAssigSheet={handleOpenAssigSheet}
            handleDocsRequest={handleDocsRequest}
            handleOpenVisiteSheet={handleOpenVisiteSheet}
            setOpenShareFicheVisite={setOpenShareFicheVisite}
            setOpenTelegramSheet={setOpenTelegramSheet}
            handleAbandonnerDemande={handleAbandonnerDemande}
            onRapportAdded={onRapportAdded}
            onVisitDone={onVisitDone}
          />
        </div>
      )}
      <NoteSuiviSheet
        open={openNoteSheet}
        onOpenChange={setOpenNoteSheet}
        onSubmit={handleSubmitNote}
      />

      <EntretienSuiviSheet
        open={openEntretienSheet}
        onOpenChange={setOpenEntretienSheet}
        onSubmit={handleSubmitEntretien}
      />
      <FicheVisiteShareSheet
        open={openShareFicheVisite}
        onOpenChange={setOpenShareFicheVisite}
        onSubmit={handleSubmitFicheVisite}
        onDownload={handDownloadFicheVisite}
      />
      <TelegramSheet
        open={openTelegramSheet}
        onOpenChange={setOpenTelegramSheet}
        onSubmit={handleSubmitTelegram}

      />

      <DocsRequestSheet
        open={openDocsRequestSheet}
        onOpenChange={setOpenDocsRequestSheet}
        onSubmit={handleSubmitDocsRequest}
      />
      <AssignDemandeSheet
        open={openAssignDemandeSheet}
        onOpenChange={setOpenAssignDemandeSheet}
        onSubmit={handleSubmitAssignDemande}
      />
      <CoordinateursMapSheet
        open={openVisiteSheet}
        onOpenChange={setOpenVisiteSheet}
        contactId={currentRow.contact.id}
        onAssign={handleAssign}
      />
      <div className={`${showContact ? "col-span-2" : "col-span-3 "} space-y-6`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2">
          <InfoCard title="Revenus" value={`${totalRevenus?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}`} />
          <InfoCard title="Charges" value={`${totalCharges?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}`} />
          <InfoCard title="Dettes" value={`${totalDettes?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}`} />
          <InfoCard title="Historique Aides" value={`${totalAides?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}`} />
          <InfoCard title="Reste à Vivre" subtitle={resteAVivreParPersonne ? `${resteAVivreParPersonne?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}  par j/pers` : ""}
            value={`${resteAVivre?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Informations sur le Bénéficiaire</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <DetailRow label="Nom et Prénom" value={`${currentRow?.contact?.nom} ${currentRow?.contact?.prenom}`} link={`/contacts/${currentRow.contact.id}`} capitalize={true} />
              <DetailRow
                label="Âge"
                value={
                  currentRow?.contact?.dateNaissance
                    ? `${calculerAge(currentRow.contact.dateNaissance)} ans`
                    : '-'
                }
              />
              <DetailRow label="Email" value={currentRow?.contact.email ?? '-'} />
              <DetailRow label="Tél" value={currentRow?.contact.telephone ?? '-'} />
              <DetailRow label="Adresse" value={currentRow?.contact.adresse ?? '-'} capitalize={true} />
              <DetailRow label="Code Postal" value={currentRow?.contact.codePostal ?? '-'} />
              <DetailRow label="Ville" value={currentRow?.contact.ville ?? '-'} capitalize={true} />
            </CardContent>
          </Card>
          <div className="col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Situation Personnelle et financière</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Tabs defaultValue="Situation" className="w-full ">
                  <TabsList className="grid w-full grid-cols-3 mb-6 ">
                    <TabsTrigger value="Situation">Situation</TabsTrigger>
                    <TabsTrigger value="Revenues">Revenues</TabsTrigger>
                    <TabsTrigger value="Charges">Charges</TabsTrigger>
                  </TabsList>
                  <TabsContent value='Situation' className="space-y-2">
                    <DetailRow label="Situation F." value={situationFamilleTypes.find(s => s.value === currentRow?.situationFamiliale)?.label ?? '-'} />
                    <DetailRow label="Situation Pro." value={situationTypes.find(s => s.value === currentRow?.situationProfessionnelle)?.label ?? '-'} />
                    {currentRow?.situationFamiliale === 'marié' && <DetailRow label="Situation Pro. Conjoint" value={situationTypes.find(s => s.value === currentRow?.situationProConjoint)?.label ?? '-'} />}
                    {(currentRow?.nombreEnfants > 0) && <DetailRow label="Nombre d'enfants" value={currentRow?.nombreEnfants ?? '0'} />}
                    {(currentRow?.nombreEnfants > 0) && <DetailRow label="Ages Enfants" value={currentRow?.agesEnfants ?? '-'} />}
                    <DetailRow label="Categorie" value={categorieTypes.find(s => s.value === currentRow?.categorieDemandeur)?.label ?? '-'} />
                  </TabsContent>
                  <TabsContent value='Revenues' className="space-y-2">
                    <DetailRow label="Revenus personnels" value={`${currentRow?.revenus?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}`} />
                    {currentRow?.situationFamiliale === 'marié' && <DetailRow label="Revenus du conjoint" value={`${currentRow?.revenusConjoint?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }) ?? '0'}`} />}
                    <DetailRow label="APL" value={`${currentRow?.apl?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }) ?? '0'}`} />
                    <DetailMultiLineRow label="Aides diverses" value={currentRow?.autresAides ?? '-'} />
                  </TabsContent>
                  <TabsContent value='Charges' className="space-y-2">
                    <DetailRow label="Loyer" value={`${currentRow?.loyer?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })} `} />
                    <DetailRow label="Factures Énergie" value={`${currentRow?.facturesEnergie?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}`} />
                    <DetailRow label="Dettes" value={`${currentRow?.dettes?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`} />
                    < DetailRow label="Autres charges" value={`${currentRow?.autresCharges?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }) ?? 0} `} />
                    <DetailMultiLineRow label="Nature dettes" value={currentRow?.natureDettes ?? '-'} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
          {showAides &&
            <Card>
              <CardHeader>
                <CardTitle>Historique des aides Reçues</CardTitle>
              </CardHeader>
              <CardContent>
                {currentRow?.contact.aides && currentRow?.contact.aides.length > 0 ? (
                  <AidesTable data={currentRow?.contact.aides} columns={fewAidesColumns} hideTools={true} hideActions={false} />
                ) : (
                  <p className="text-gray-500">Aucune aide reçue.</p>
                )}
              </CardContent>
            </Card>
          }
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
          {showDocuements &&
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Justificatifs du bénéficiaire</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='outline' size="sm" >
                      Ajouter <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {typeDocumentsDemande?.map((type: TypeDocument) => (
                      <DropdownMenuItem key={type.id} onClick={() => handleTypeClick(type.id)}>
                        {type.label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => fileInputMultiRef.current?.click()}>
                      <Files className="mr-2 h-4 w-4" />
                      Charger plusieurs documents
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
                <input
                  ref={fileInputMultiRef}
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleMultipleFileChange}
                />
              </CardHeader>
              <CardContent className="text-xl font-bold">
                {isLoadingDocuments ? (
                  <div className="flex justify-center py-6">
                    <Spinner size="large" />
                  </div>
                ) : (
                  <DocumentsManager
                    attachement="Demande"
                    documents={suiviDdemandeur}
                    contactId={currentRow?.contact.id}
                    onUpload={handleFileUpload}
                    onDelete={handleDelete}
                  />
                )}
              </CardContent>
            </Card>
          }
        </div>
      </div>
      {ConfirmDialogComponent}
      <AidesDialogs showContactSearch={false} forContactId={currentRow.contact.id} forDemandeId={currentRow.id} showDemandeSearch={false} 
      onSuccess={handleAskAgainAide}
     />
    </div>
  )
}

function DetailRow({ label, value, link, capitalize = false }: { label: string; value: React.ReactNode; link?: string, capitalize?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center w-3/5">
        <span className=" whitespace-nowrap label-style">{label}</span>
      </div>
      <div className={`text-right value-style whitespace-nowrap overflow-hidden truncate ${capitalize && `first-letter:uppercase`}`}>
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-500 hover:underline">
            {value}
          </a>
        ) : (
          value
        )}
      </div>
    </div>
  );
}

function DetailMultiLineRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        <span className="font-medium text-gray-700 whitespace-nowrap label-style">{label}</span>

      </div>
      <div className="text-left multiline-value-style whitespace-pre-line"  >{value}</div>
    </div>
  )
}

function InfoCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-md whitespace-nowrap overflow-hidden truncate">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="whitespace-nowrap overflow-hidden truncate">
        <div className="text-xl font-bold truncate">{value}</div>

        {subtitle && (
          <div className="text-sm text-muted-foreground mt-1 truncate">
            {subtitle}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
