'use client'


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AidesTable } from '@/features/aides/components/aides-table'
import { columns as aidecolumns } from '@/features/aides/components/aides-columns'
import { ActivityType, Demande, DemandeStatus } from '@/model/demande/Demande'
import { situationTypes } from '@/model/demande/Demande'
import { situationFamilleTypes } from '@/model/demande/Demande'
import { DocumentsManager } from '@/features/documents/documents-manager'
import { useDocumentService } from '@/api/document/documentService'
import { Button } from '@/components/ui/button'
import { Plus, FileText, StickyNote, PhoneMissed, PhoneCall, RefreshCw, RefreshCwOff, CheckCircle, PauseCircle, MapPin } from 'lucide-react';
import { useDocumentActions } from '@/features/documents/useDocumentActions'
import { getUserId } from '@/lib/session'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { TypeDocument } from '@/model/typeDocument/typeDocument'
import { useTypeDocumentService } from '@/api/typeDocument/typeDocumentService'
import { useRef, useState } from 'react'
import { categorieTypes } from '../data/data'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TabsContent } from '@radix-ui/react-tabs'
import { DemandeActivityTimeline } from './DemandeActivityTimeline'
import { useDemandeService } from '@/api/demande/demandeService'
import { NoteSuiviSheet } from './NoteSuiviSheet'
import { Document } from '@/model/document/Document'
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useConfirmDialog } from './demande-confirm-dialog'
import { useAides } from '@/features/aides/context/aides-context'
import { AidesDialogs } from '@/features/aides/components/aides-dialogs'


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
  const { createDemandeActivity, updateDemande } = useDemandeService();
  const [openNoteSheet, setOpenNoteSheet] = useState(false);
  /*const { demandes, loading: isLoading, error } = useDemandeService({where : {id :{equals:demandeId} }});
  //const { setOpen, setCurrentRow } = useDemandes()
  const currentRow: Demande | undefined = demandes.length > 0 ? demandes[0] : undefined;*/
  const { openConfirmDialog, ConfirmDialogComponent } = useConfirmDialog()
  const pendingStatusUpdate = useRef(false);
  const nextStatusRef = useRef< DemandeStatus | null>(null);
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
  const { typeDocuments: typeDocumentsSuivi } = useTypeDocumentService({
    where: { rattachement: 'Suivi' },
  });

  const { setOpenAide} = useAides()
  const { typeDocuments } = useTypeDocumentService({ where: { rattachement: 'Demande' } });
  const handleTypeClick = (typeId: number) => {
    setSelectedTypeId(typeId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const selectedType = typeDocumentsSuivi?.find((t: TypeDocument) => t.id === selectedTypeId);

    if (file && selectedTypeId) {
      await handleFileUpload(currentRow.contact.id, file, selectedTypeId, currentRow.id);

      // Enregistrer une activité liée au document
      await createDemandeActivity({
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
          "Souhaitez-vous faire passer cette demande au statut « en commission » ?",
          async () => {
            if (pendingStatusUpdate.current) {
              await updateDemande(currentRow.id, { status: "en_commision" });
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

  const handleCreatePredefinedActivity = async (type: ActivityType) => {
    const titlesAndMessages: Record<ActivityType, { titre: string; message: string }> = {
      priseContactEchec: {
        titre: "Prise de contact échouée",
        message: "Impossible de joindre le demandeur.",
      },
      priseContactReussie: {
        titre: "Entretien avec le demandeur",
        message: "Le demandeur été contacté.",
      },
      note: {
        titre: "Note de suivi",
        message: "",
      },
      visite: {
        titre: "Visite programmée",
        message: "Une visite a été convenue avec le demandeur",
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
        titre: "Demande ajournée en commission",
        message: "La demande a été ajournée après etude en commission",
      },
      expiration: {
        titre: "Aide expirée",
        message: "Une aide dans le cadre de cette demande a expiré",
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
    if (type === "priseContactEchec" && currentRow.status === "recue") {
      nextStatusRef.current = "EnAttente";
      openConfirmDialog(
        "Changer le statut de la demande ?",
        "Souhaitez-vous mettre ma demande en attente ?",
        handleConfirmedStatusChange,
        { confirmText: "Oui", cancelBtnText: "Annuler" }
      );
    }

    if (type === "visite") {
      nextStatusRef.current = "en_visite";
      openConfirmDialog(
        "Changer le statut de la demande ?",
        "Souhaitez-vous passer la demande en visite ?",
        handleConfirmedStatusChange,
        { confirmText: "Oui", cancelBtnText: "Annuler" }
      );
    }

    if (type === "accept") {
      nextStatusRef.current = "EnCours";
     
      openConfirmDialog(
        "Ajouter un aide ?",
        "Souhaitez-vous ajouter une aide maintenant ?",
        handleAddAide,
        { confirmText: "Oui", cancelBtnText: "Annuler" }
      );
      await updateDemande(currentRow.id, { status: nextStatusRef.current });
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
  


  return (

    <div className="sm:min-w-full grid grid-cols-1 xl:grid-cols-1 2xl:grid-cols-3 md:grid-cols-1 gap-6 mt-6">

      {showContact && <div className="col-span-1">


        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Suivi et actions</CardTitle>
            {!['clôturée', 'Abandonnée'].includes(currentRow.status) && (
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
                    <DropdownMenuItem onClick={() =>handleCreatePredefinedActivity("refuse")}>
                      <PauseCircle className="mr-2 h-4 w-4" />
                      Ajourner la demande
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>


                }
                {/* Partie Activités */}
                <DropdownMenuLabel>Activités</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleCreatePredefinedActivity("priseContactEchec")}>
                  <PhoneMissed className="mr-2 h-4 w-4" />
                  Prise de contact échouée
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCreatePredefinedActivity("priseContactReussie")}>
                  <PhoneCall className="mr-2 h-4 w-4" />
                  Entretien avec le demandeur
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCreatePredefinedActivity("abandon")}>
                  <RefreshCwOff className="mr-2 h-4 w-4" />
                  Abandon de la demande
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCreatePredefinedActivity("visite")}>
                  <MapPin className="mr-2 h-4 w-4" />
                  Visite programmée
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpenNoteSheet(true)}>
                  <StickyNote className="mr-2 h-4 w-4" />
                  Note de suivi
                </DropdownMenuItem>


                <DropdownMenuSeparator />

                {/* Partie Documents */}
                <DropdownMenuLabel>Documents</DropdownMenuLabel>
                {typeDocumentsSuivi?.map((type: TypeDocument) => (
                  <DropdownMenuItem key={type.id} onClick={() => handleTypeClick(type.id)}>
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
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="Activites">Activités</TabsTrigger>
                <TabsTrigger value="Documents">Documents</TabsTrigger>
              </TabsList>
              <TabsContent value='Activites' >
                <DemandeActivityTimeline activities={currentRow.demandeActivities} />
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
            </Tabs>
          </CardContent>


        </Card>
      </div>}
      <NoteSuiviSheet
        open={openNoteSheet}
        onOpenChange={setOpenNoteSheet}
        onSubmit={handleSubmitNote}
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
              <DetailRow label="Âge" value={currentRow?.contact?.age + ' ans' ?? 'N/A'} />
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
                <CardTitle>Aides Reçues par le demandeur</CardTitle>
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
                <CardTitle>Justificatifs du demandeur</CardTitle>
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
      <AidesDialogs showContactSearch={false} forContactId={currentRow.contact.id } forDemandeId={currentRow.id} showDemandeSearch={false}/>
    </div>



  )
}

function DetailRow({ label, value, link, capitalize = false }: { label: string; value: React.ReactNode; link?: string, capitalize?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center w-3/5">
        <span className="font-medium text-gray-700 whitespace-nowrap label-style">{label}</span>
      </div>
      <div className={`${capitalize && 'capitalize'} text-right  whitespace-nowrap overflow-hidden truncate value-style `}>
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
