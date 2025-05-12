'use client'


import { useDemandeService } from '@/api/demande/demandeService'
import { useDocumentService } from '@/api/document/documentService'
import { useTypeDocumentService } from '@/api/typeDocument/typeDocumentService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
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
import { TabsContent } from '@radix-ui/react-tabs'
import { CheckCircle, ExternalLink, FilePlus2, FileText, MapPin, PauseCircle, PhoneCall, PhoneMissed, Plus, RefreshCwOff, StickyNote, UserCheck } from 'lucide-react'
import { useRef, useState } from 'react'
import { categorieTypes } from '../data/data'
import { DemandeActivityTimeline } from './DemandeActivityTimeline'
import { NoteSuiviSheet } from './NoteSuiviSheet'
import { useConfirmDialog } from './demande-confirm-dialog'
import { DocsRequestSheet } from './DocsRequestSheet'
import { useContactService } from '@/api/contact/contact-service'
import CoordinateursMapSheet from './assign-coordinateur'
import { User } from '@/model/user/User'
import { useUserServicev2 } from '@/api/user/userService.v2'
import { equal } from 'assert'
import { addMonths } from 'date-fns'
import { shareFicheVisite } from '@/api/demande/demandeService'
import { FicheVisiteShareSheet } from './shareFicheVisite'
import { useNavigate } from '@tanstack/react-router'
import { AssignDemandeSheet } from './assign-demande-dialog'


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

  const { documents } = useDocumentService({ where: { demande: { id: currentRow.id } } });
  const suiviDocuments = documents.filter((doc: Document) => doc.typeDocument?.rattachement === "Suivi");
  const suiviDdemandeur = documents.filter((doc: Document) => doc.typeDocument?.rattachement === "Demande");
  const userId = getUserId();
  const { handleFileUpload, handleDelete } = useDocumentActions({ demande: { id: currentRow.id } });
  const { createDemandeActivity, updateDemande } = useDemandeService({where : {id:{equals:currentRow.id}}});
  const [openNoteSheet, setOpenNoteSheet] = useState(false);
  const [openShareFicheVisite, setOpenShareFicheVisite] = useState(false);
  
  const [openDocsRequestSheet, setOpenDocsRequestSheet] = useState(false);
  const [openAssignDemandeSheet, setOpenAssignDemandeSheet] = useState(false);
  const [openVisiteSheet, setOpenVisiteSheet] = useState(false);
  
  const { openConfirmDialog, ConfirmDialogComponent } = useConfirmDialog()
  const pendingStatusUpdate = useRef(false);
  const nextStatusRef = useRef<DemandeStatus | null>(null);
  const fewAidesColumns = aidecolumns.filter(column =>
    column.id && ['dateAide', 'montant', 'frequence', 'verse', 'resteAVerser'].includes(column.id)
  );
  const totalRevenus = (currentRow?.revenus ?? 0) + (currentRow?.revenusConjoint ?? 0) + (currentRow?.apl ?? 0)
  const totalCharges = (currentRow?.loyer ?? 0) + (currentRow?.facturesEnergie ?? 0) + (currentRow?.autresCharges ?? 0)
  const totalDettes = currentRow?.dettes ?? 0
  const totalAides = currentRow?.contact?.aides?.reduce((acc, aide) => acc + (aide.montant ?? 0), 0) ?? 0
  const resteAVivre = totalRevenus - totalCharges
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const { sendMessage, isSubmitting } = useContactService({where : {id:{equals:currentRow.contact.id}}}); // ✅ Utilisation du service
  const { typeDocuments: typeDocumentsSuivi } = useTypeDocumentService({
    where: { rattachement: 'Suivi' },
  });
  const hasDocument  =  suiviDdemandeur&& suiviDdemandeur.length > 0
  const { setOpenAide } = useAides()
  const { typeDocuments } = useTypeDocumentService({ where: { rattachement: 'Demande' } });
  const handleTypeClick = (typeId: number) => {
    setSelectedTypeId(typeId);
    fileInputRef.current?.click();
  };
  const navigate = useNavigate();
 const {users}: { users: User[] } = useUserServicev2({where:{role:{equals:"tresorier"}}})
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const selectedType = typeDocumentsSuivi?.find((t: TypeDocument) => t.id === selectedTypeId);
    
    if (file && selectedTypeId) {
      await handleFileUpload(currentRow.contact.id, file, selectedTypeId, currentRow.id);

      // Enregistrer une activité liée au document
      selectedType?.internalCode === "rapport_visite" && await createDemandeActivity({
        titre: "Rapport de visite ajouté",
        message: "Un rapport de visite a été ajouté à la demande.",
        typeField: "docAjout",
        demandeId: currentRow.id,
        userId: userId!,
      });

      // Si statut = en_visite et doc = rapport_visite, demander confirmation
      if (selectedType?.internalCode === "rapport_visite" && currentRow.status === "en_visite") {
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

      setSelectedTypeId(null);
      e.target.value = '';
    }
  };

  const handleCreatePredefinedActivity = async (type: ActivityType,variables?: Record<string, string>) => {
    const titlesAndMessages: Record<ActivityType, { titre: string; message: string }> = {
      priseContactEchec: {
        titre: "Prise de contact échouée",
        message: "Impossible de joindre le bénéficiaire.",
      },
      priseContactReussie: {
        titre: "Entretien avec le bénéficiaire",
        message: "Le bénéficiaire été contacté.",
      },
      note: {
        titre: "Note de suivi",
        message: "",
      },
      visite: {
        titre: "Coordinateur de visite designé ",
        message: variables ? `${variables.coordinateur} a été désigné comme coordinateur de la visite. Le bénévole le plus proche du bénéficiaire est ${variables.visiteur}` 
        :" Un Coordinateur de visiste a été désigné"
      },
      statusUpdate: {
        titre: "Changement de statut",
        message: "",
      },
      abandon: {
        titre: "Abandon de la demande",
        message: "La demande est abandonnée.",
      },
      docAjout: {
        titre: "Un docuement Ajouté",
        message: "Un nouveau docuement a été ajouté à la demande",
      },
      accept: {
        titre: "Demande Approuvée en commission",
        message: "La demande a été approuvé après etude en commission",
      },
      refuse: {
        titre: "Demande rejetée en commission",
        message: "La demande a été ajournée après etude en commission",
      },
      expiration: {
        titre: "Aide expirée",
        message: "Une aide dans le cadre de cette demande a expiré",
      },
      docsRequest: {
        titre: "Justificatifs demandés",
        message: "Un mail a été envoyé au bénéficiaire  pour demander les pièces justificatifs",
      }


    };

    const { titre, message } = titlesAndMessages[type];


    
    const success = await createDemandeActivity({
      titre,
      message,
      typeField: type,
      demandeId: currentRow.id,
      userId: userId!,
    });
    // Déclencher confirmation si applicable
     if (type === "priseContactEchec" && ["recue", "EnAttenteDocs"].includes(currentRow.status) && (currentRow.nombreRelances &&  currentRow.nombreRelances > 2)) {
      nextStatusRef.current = "EnAttente";
      openConfirmDialog(
        "Mettre en attente ?",  
        `Le bénéficiaire est injoignable après 4 tentavives de contact.
         Souhaitez-vous mettre la demande en attente?
         Sans retour du bénéficiaire, la demande sera cloturée automatiquement le ${addMonths(new Date(),1).toLocaleDateString()}`,
        handleConfirmedStatusChange,
        { confirmText: "Oui", cancelBtnText: "Annuler" }
      );
    } 

  /*   if (type === "visite") {
      nextStatusRef.current = "en_visite";
      openConfirmDialog(
        "Changer le statut de la demande ?",
        "Souhaitez-vous passer la demande en visite ?",
        handleConfirmedStatusChange,
        { confirmText: "Oui", cancelBtnText: "Annuler" }
      );
    } */

    if (type === "accept") {
      nextStatusRef.current = "EnCours";

      openConfirmDialog(
        "Ajouter un aide ?",
        "Souhaitez-vous ajouter une aide maintenant ?",
        handleAddAide,
        { confirmText: "Oui", cancelBtnText: "Annuler" }
      );
      const firstTresorier: User | undefined = users.length > 0 ? users[0] : undefined;
      await updateDemande(currentRow.id, { status: nextStatusRef.current,...(firstTresorier && { acteur: { id: firstTresorier.id } }), });
    }
    if (type === "refuse") {
      nextStatusRef.current = "refusée";
      await updateDemande(currentRow.id, { status: nextStatusRef.current });

    }

  };

  const handleSubmitNote = async ({ titre, message }: { titre: string; message: string }) => {
    await createDemandeActivity({
      titre,
      message,
      typeField: "note", // ici très important
      demandeId: currentRow.id,
      userId: userId!,
    });
  };
  const handleSubmitFicheVisite = async ({ userId, message }: { userId: string; message: string }) => {
    await shareFicheVisite({demandeId:currentRow.id,userId:userId,subordoneId:userId});
          setOpenShareFicheVisite(false);
  };
  const handDownloadFicheVisite = async()=>{
    
    navigate({ to: `/demandes/${currentRow.id}/fiche-visite-pdf` });
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
        message, // ⬅️ ici, message est le HTML du RichTextEditor

      });
    }
  
    await handleCreatePredefinedActivity("docsRequest");
    await updateDemande(currentRow.id, { status: "EnAttenteDocs" });
  };

  const handleConfirmedStatusChange = async () => {
    if (nextStatusRef.current) {
      await updateDemande(currentRow.id, { status: nextStatusRef.current });

    }
    nextStatusRef.current = null;
  };

  const handleAddAide = async () => {
    if (nextStatusRef.current) {

      setOpenAide('add');
    }
    nextStatusRef.current = null;
  };

  const handleDocsRequest = async () => {
   
    setOpenDocsRequestSheet(true)
  
  };
  
  const handleOpenVisiteSheet = async () => {
   
    setOpenVisiteSheet(true); // Ouvre la Sheet
  };
  const handleAbandonnerDemande =async() =>{

    await handleCreatePredefinedActivity("abandon");
    await updateDemande(currentRow.id, { status: "Abandonnée" });
  }
  const handleOpenAssigSheet = async () => {
   
    setOpenAssignDemandeSheet(true); // Ouvre la Sheet
  };
  const handleSubmitAssignDemande = async ({ userId, message }: { userId: string; message: string }) => {
   await updateDemande(currentRow.id ,{acteur:{id:userId}})
  };
  
 const hasContactAttempts:boolean = (currentRow.demandeActivities.filter((e) => (e.typeField==="priseContactReussie"))).length >0
  
  return (

    <div className="sm:min-w-full grid grid-cols-1 xl:grid-cols-1 2xl:grid-cols-3 md:grid-cols-1 gap-6 mt-6">

      {showContact && <div className="col-span-1">


        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Suivi et actions</CardTitle>
            {!['clôturée', 'Abandonnée','EnAttente','refusée'].includes(currentRow.status) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>

                  {currentRow.status === 'en_commision' &&
                    <>
                      <DropdownMenuLabel>Décision</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleCreatePredefinedActivity("accept")}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approuver la demande
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCreatePredefinedActivity("refuse")}>
                        <PauseCircle className="mr-2 h-4 w-4" />
                        Rejeter la demande
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>


                  }
                  {/* Partie Activités */}
                  <DropdownMenuLabel>Evénements</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleCreatePredefinedActivity("priseContactEchec")}>
                    <PhoneMissed className="mr-2 h-4 w-4" />
                    Prise de contact échouée
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCreatePredefinedActivity("priseContactReussie")}>
                    <PhoneCall className="mr-2 h-4 w-4" />
                    Entretien avec le bénéficiaire
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setOpenNoteSheet(true)}>
                    <StickyNote className="mr-2 h-4 w-4" />
                    Note de suivi
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleOpenAssigSheet()}>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Affecter la demande à...
                  </DropdownMenuItem>        
                  <DropdownMenuItem onClick={() => handleDocsRequest()} disabled={!hasContactAttempts}>
                    <FilePlus2 className="mr-2 h-4 w-4" />
                    Demander des justificatifs
                  </DropdownMenuItem>                
                   <DropdownMenuItem onClick={handleOpenVisiteSheet}  disabled={["recue", "EnAttente"].includes(currentRow.status) ||  !hasContactAttempts || !hasDocument}>
                    <MapPin className="mr-2 h-4 w-4" />
                    Organiser une visite
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setOpenShareFicheVisite(true)} disabled={["recue", "EnAttente"].includes(currentRow.status) ||  !hasContactAttempts || !hasDocument}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Partager Fiche de visite
                  </DropdownMenuItem>                  
                  <DropdownMenuItem onClick={() => handleAbandonnerDemande()}>
                    <RefreshCwOff className="mr-2 h-4 w-4" />
                    Abandonner la demande
                  </DropdownMenuItem>


                  <DropdownMenuSeparator />

                  {/* Partie Documents */}
                  <DropdownMenuLabel>Ajouer un documents</DropdownMenuLabel>
                  {typeDocumentsSuivi?.map((type: TypeDocument) => (
                    <DropdownMenuItem key={type.id} onClick={() => handleTypeClick(type.id)}  
                    disabled={type.internalCode == 'rapport_visite' && ( ["recue", "EnAttente"].includes(currentRow.status) ||  !hasContactAttempts)}>
                      <FileText className="mr-2 h-4 w-4" />
                      {type.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

          </CardHeader>

          <CardContent className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            <Tabs defaultValue="Activites" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="Activites">Activités</TabsTrigger>
                <TabsTrigger value="Documents">Documents</TabsTrigger>
                <TabsTrigger value="Visites">Visites</TabsTrigger>
              </TabsList>
              <TabsContent value='Activites' >
                <DemandeActivityTimeline demandeId={currentRow.id} activities={currentRow.demandeActivities} />
              </TabsContent>
              <TabsContent value="Documents">
                {suiviDocuments.length > 0 ? (
                  <DocumentsManager
                    documents={suiviDocuments}
                    contactId={currentRow.contact.id}
                    onUpload={handleFileUpload}
                    onDelete={handleDelete}
                  />
                ) : (
                  <p className="text-gray-500 text-sm">Aucun document de suivi pour cette demande.</p>
                )}
              </TabsContent>
              <TabsContent value='Visites' >
              Fonctionalité à venir
              </TabsContent>
            </Tabs>
          </CardContent>


        </Card>
      </div>}
      <NoteSuiviSheet
        open={openNoteSheet}
        onOpenChange={setOpenNoteSheet}
        onSubmit={handleSubmitNote}
      />
       <FicheVisiteShareSheet
        open={openShareFicheVisite}
        onOpenChange={setOpenShareFicheVisite}
        onSubmit={handleSubmitFicheVisite}
        onDownload={handDownloadFicheVisite}
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
        onAssign={async (data: { visiteur: User; coordinateur: User}) => {
          console.log("Assignation déclenchée côté parent avec :", data.visiteur.id);
          data.coordinateur =data.coordinateur  ? data.coordinateur :data.visiteur
          await handleCreatePredefinedActivity("visite",{visiteur: `${data.visiteur.firstName} ${data.visiteur.lastName}`,coordinateur:`${data.coordinateur.firstName} ${data.coordinateur.lastName}`}); // Enregistre l'activité "visite"
          const acteur = data.coordinateur ?  data.coordinateur : data.visiteur
          await updateDemande(currentRow.id, { status: "en_visite", acteur: { id: acteur.id } })
          const baseUrl = import.meta.env.VITE_FRONTEND_URL;
         
          await shareFicheVisite({demandeId:currentRow.id,userId:data.coordinateur.id,subordoneId:data.visiteur.id});
          setOpenVisiteSheet(false);
        }}
      />

      <div className={`${showContact ? "col-span-2" : "col-span-3 "} space-y-6`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-5 gap-2">
          <InfoCard title="Revenus" value={`${totalRevenus?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}`} />
          <InfoCard title="Charges" value={`${totalCharges?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}`} />
          <InfoCard title="Dettes" value={`${totalDettes?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}`} />
          <InfoCard title="Aides Reçues" value={`${totalAides?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}`} />
          <InfoCard title="Reste à Vivre" value={`${resteAVivre?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Informations sur le Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <DetailRow label="Nom et Prénom" value={`${currentRow?.contact?.nom} ${currentRow?.contact?.prenom}`} link={`/contacts/${currentRow.contact.id}`} capitalize={true} />
              <DetailRow
                label="Âge"
                value={
                  currentRow?.contact?.age != null
                    ? `${currentRow.contact.age} ans`
                    : 'N/A'
                }
              />
              <DetailRow label="Email" value={currentRow?.contact.email ?? 'N/A'} />
              <DetailRow label="Tél" value={currentRow?.contact.telephone ?? 'N/A'} />
              <DetailRow label="Adresse" value={currentRow?.contact.adresse ?? 'N/A'} capitalize={true} />
              <DetailRow label="Code Postal" value={currentRow?.contact.codePostal ?? 'N/A'} />
              <DetailRow label="Ville" value={currentRow?.contact.ville ?? 'N/A'} capitalize={true} />
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
                    <DetailRow label="Situation F." value={situationFamilleTypes.find(s => s.value === currentRow?.situationFamiliale)?.label ?? 'N/A'} />
                    <DetailRow label="Situation Pro." value={situationTypes.find(s => s.value === currentRow?.situationProfessionnelle)?.label ?? 'N/A'} />
                    {currentRow?.situationFamiliale === 'marié' && <DetailRow label="Situation Pro. Conjoint" value={situationTypes.find(s => s.value === currentRow?.situationProConjoint)?.label ?? 'N/A'} />}
                    {(currentRow?.nombreEnfants > 0) && <DetailRow label="Nombre d'enfants" value={currentRow?.nombreEnfants ?? '0'} />}
                    {(currentRow?.nombreEnfants > 0) && <DetailRow label="Ages Enfants" value={currentRow?.agesEnfants ?? 'N/A'} />}
                    <DetailRow label="Categorie" value={categorieTypes.find(s => s.value === currentRow?.categorieDemandeur)?.label ?? 'N/A'} />
                  </TabsContent>
                  <TabsContent value='Revenues' className="space-y-2">
                    <DetailRow label="Revenus personnels" value={`${currentRow?.revenus?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}`} />
                    {currentRow?.situationFamiliale === 'marié' && <DetailRow label="Revenus du conjoint" value={`${currentRow?.revenusConjoint?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }) ?? '0'}`} />}
                    <DetailRow label="APL" value={`${currentRow?.apl?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }) ?? '0'}`} />
                    <DetailMultiLineRow label="Aides diverses" value={currentRow?.autresAides ?? 'N/A'} />
                  </TabsContent>
                  <TabsContent value='Charges' className="space-y-2">
                    <DetailRow label="Loyer" value={`${currentRow?.loyer?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })} `} />
                    <DetailRow label="Factures Énergie" value={`${currentRow?.facturesEnergie?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}`} />
                    <DetailRow label="Dettes" value={`${currentRow?.dettes?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`} />
                    < DetailRow label="Autres charges" value={`${currentRow?.autresCharges?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }) ?? 0} `} />
                    <DetailMultiLineRow label="Nature dettes" value={currentRow?.natureDettes ?? 'N/A'} />
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
                <CardTitle>Aides Reçues par le bénéficiaire</CardTitle>
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
                    <Button variant="outline" size="sm" className="h-8">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {typeDocuments?.map((type: TypeDocument) => (
                      <DropdownMenuItem key={type.id} onClick={() => handleTypeClick(type.id)}>
                        {type.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                <DocumentsManager documents={suiviDdemandeur} contactId={currentRow?.contact.id} onUpload={handleFileUpload} onDelete={handleDelete} />
              </CardContent>
            </Card>
          }
        </div>

      </div>
      {ConfirmDialogComponent}
      <AidesDialogs showContactSearch={false} forContactId={currentRow.contact.id} forDemandeId={currentRow.id} showDemandeSearch={false} />
    </div>



  )
}

function DetailRow({ label, value, link, capitalize = false }: { label: string; value: React.ReactNode; link?: string, capitalize?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center w-3/5">
        <span className="font-medium text-gray-700 whitespace-nowrap label-style">{label}</span>
      </div>
      <div className={`${capitalize && 'capitalize'} text-right  whitespace-nowrap overflow-hidden truncate `}>
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

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-md whitespace-nowrap overflow-hidden truncate">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-bold whitespace-nowrap overflow-hidden truncate ">
        {value}
      </CardContent>
    </Card>
  )
}
