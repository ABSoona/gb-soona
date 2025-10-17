import {
    Card,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuShortcut,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { CirclePlus, File, CalendarDays, PencilLine, Check, RefreshCwOff, UserCheck, FileX, FileX2, FileText } from "lucide-react";
import { format } from "date-fns";
import { useRef, useState } from "react";
import { Visite } from "@/model/visite/Visite";
import { previewDocument } from "@/api/document/documentService";
import { useDocumentActions } from "@/features/documents/useDocumentActions";
import { useDocumentService } from "@/api/document/documentService";
import { Document } from "@/model/document/Document";
import DocumentPreviewSheet from "@/features/documents/ocumentPreviewSheet";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { visiteStatusColor, visiteStatusTypes } from "../data/data";
import { cn } from "@/lib/utils";
import { useVisiteService } from "@/api/visite/invitationService";
import { useTypeDocumentService } from "@/api/typeDocument/typeDocumentService";
import { toast } from "@/hooks/use-toast";
import { User } from "@/model/user/User";
import CoordinateursMapSheet from "@/features/demandes/components/assign-coordinateur";
import { DatePicker } from "@/components/ui/date-picker";

interface VisiteListProps {
    demandeId: number;
    onRapportAdded?: () => void;
    onVisitDone?:() => void
    onAffecterA?: () => void
}

export const VisiteList = ({ demandeId, onRapportAdded, onAffecterA,onVisitDone }: VisiteListProps) => {
    const { visites, updateVisite, refetch, isSubmitting } = useVisiteService({
        where: { demande: { id: demandeId } },orderBy:{createdAt:'Asc'}
    });
    const [openVisiteSheet, setOpenVisiteSheet] = useState(false);
    const { handleFileUpload } = useDocumentActions({});
    const { deleteDocument } = useDocumentService();

    const { typeDocuments: typeDocRapport } = useTypeDocumentService({
        where: { internalCode: { equals: "rapport_visite" } },
    });

    const [editingDateId, setEditingDateId] = useState<number | null>(null);
    const [editedDate, setEditedDate] = useState<Date | undefined>(undefined);


    const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
    const [editedNote, setEditedNote] = useState<string>('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [document, setDocument] = useState<Document | null>(null);
    const [previewType, setPreviewType] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [currentVisite, setCurrentVisite] = useState<Visite | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const openPreview = async (doc: Document) => {
        try {
            const { url, type } = await previewDocument(doc);
            setPreviewUrl(url);
            setDocument(doc);
            setPreviewType(type ?? "unsupported");
            setOpen(true);
        } catch {
            toast({ title: "Erreur lors de la prévisualisation", variant: "destructive" });
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && currentVisite) {
            const typeDocId = typeDocRapport?.[0]?.id;
            if (!typeDocId) {
                toast({ title: "Type de document 'rapport_visite' introuvable", variant: "destructive" });
                return;
            }
            await handleFileUpload(0, file, typeDocId, 0, 0, 0, currentVisite.id);
            await refetch();
            await updateVisite(currentVisite.id, { status: 'Realisee', dateVisite: new Date() })
            onRapportAdded?.();
        }
    };

    const handleTypeClick = (visite: Visite) => {
        setCurrentVisite(visite);
        fileInputRef.current?.click();
    };

    const handleDeleteDocument = async (e: React.MouseEvent, documentId: string) => {
        e.stopPropagation();
        await deleteDocument(documentId);
        await refetch();
    };

    if (!visites.length) {
        return <p className="text-muted-foreground">Aucune visite enregistrée.</p>;
    }

    const handleOpenVisiteSheet = async (visite: Visite) => {
        setCurrentVisite(visite);
        setOpenVisiteSheet(true); // Ouvre la Sheet
    };

    const handleAssign = async (data: { visiteur: User }, visite?: Visite) => {
        console.log("Assignation déclenchée côté parent avec :", data.visiteur.id);
        const coordinateur = data.visiteur.superieur ?? data.visiteur;
        visite && await updateVisite(visite.id, {  acteur: { id: data.visiteur.id }})
        /*  await updateDemande(currentRow.id, {
            status: "en_visite",
            acteur: { id: coordinateur.id }
          });*/

        setOpenVisiteSheet(false);
    };

    return (
        <>
            <div className="space-y-4">
                {visites.map((visite: Visite) => (
                    <Card key={visite.id} className="p-4 space-y-3 ">
                        {/* Ligne 1 : Date + menu */}
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2 text-base font-semibold">
                               
                                {editingDateId === visite.id ? (
                                    <div className="flex items-center gap-2">
                                        <DatePicker
                                            date={editedDate}
                                            className="w-[200px]"
                                            onDateChange={(newDate) => setEditedDate(newDate)}
                                            
                                        />
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            disabled={isSubmitting}
                                            onClick={async () => {
                                                if (editedDate) {
                                                    await updateVisite(visite.id, { dateVisite: editedDate, status: "Planifiee"   });
                                                    setEditingDateId(null);
                                                }
                                            }}
                                        >
                                            <Check />
                                        </Button>
                                    </div>
                                ) : (
                                    <div
                                        className="cursor-pointer hover:underline flex items-center gap-2"
                                        onClick={() => {
                                            setEditingDateId(visite.id);
                                            setEditedDate(visite.dateVisite ? new Date(visite.dateVisite) : undefined);
                                        }}
                                    >
                                        <CalendarDays className="w-5 h-5 text-muted-foreground" />
                                        {visite.dateVisite
                                            ? `Visite du ${format(new Date(visite.dateVisite), "dd/MM/yyyy")}`
                                            : "Date à définir"}
                                    </div>
                                )}
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                        <DotsHorizontalIcon className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem disabled={visite.status == "Annulee"} onClick={() => handleOpenVisiteSheet(visite)}>
                                        <UserCheck />
                                        Affecter la visite à…
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                    onClick={() => {                                        
                                        onVisitDone?.();
                                        updateVisite(visite.id, { status: "Realisee", dateVisite: new Date() })
                                    }}
                                    >
  <Check />
  Marquer comme réalisée
</DropdownMenuItem>
                                    <DropdownMenuItem disabled={visite.status == "Annulee"} onClick={() => updateVisite(visite.id, { status: "Annulee" })}>
                                        <RefreshCwOff />
                                        Annuler la visite
                                    </DropdownMenuItem>


                                    {visite.document && (
                                        <>
                                            <hr className="my-1" />
                                            <DropdownMenuItem onClick={(e) => handleDeleteDocument(e as any, visite.document!.id)}>
                                                <FileX2 />
                                                Retirer le rapport de visite
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Ligne 2 + 3 : badge + infos + doc */}
                        <div className="flex justify-between gap-4">
                            <div className="flex-1 space-y-2">
                                <Badge className={cn("mb-1", visiteStatusColor.get(visite.status))}>
                                    {visiteStatusTypes.find((s) => s.value === visite.status)?.label ?? "Inconnu"}
                                </Badge>
                                <p className=" font-medium">
                                    Affectée à {visite.acteur.firstName} {visite.acteur.lastName}
                                </p>
                                {visite.acteur.superieur && (
                                    <span className="text-sm text-muted-foreground">
                                        En relation avec {visite.acteur.superieur.firstName} {visite.acteur.superieur.lastName}
                                    </span>
                                )}

                                {editingNoteId === visite.id ? (
                                    <div className="flex gap-2 items-start">
                                        <textarea
                                            value={editedNote}
                                            onChange={(e) => setEditedNote(e.target.value)}
                                            rows={4}
                                            className="w-full text-sm border rounded p-1 resize-none"
                                        />
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            disabled={isSubmitting}
                                            onClick={async () => {
                                                await updateVisite(visite.id, { note: editedNote });
                                                setEditingNoteId(null);
                                            }}
                                        >
                                            <Check />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground flex items-start gap-2">
                                        <PencilLine
                                            onClick={() => {
                                                setEditingNoteId(visite.id);
                                                setEditedNote(visite.note || '');
                                            }}
                                            className="w-6 h-6 mt-1 cursor-pointer rounded p-1 hover:bg-muted hover:text-foreground transition"
                                        />
                                        <span className="flex-1">
                                            {visite.note}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Bloc document */}
                            <div className="w-[120px] shrink-0">
                                {visite.document ? (
                                    <Card
                                        onClick={() => visite.document && openPreview(visite.document)}
                                        className="relative h-[120px] border  rounded-lg bg-white shadow hover:shadow-md transition flex flex-col items-center justify-center cursor-pointer"
                                    >
                                        <FileText className="h-6 w-6 text-primary mb-1 " />
                                        <p className="text-sm font-medium  max-w-[100px] text-center ">
                                            {visite.document.typeDocument.label}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            Ajouté le {format(new Date(visite.document.createdAt), "dd/MM/yyyy")}
                                        </p>
                                    </Card>
                                ) : (
                                    <Button
                                        variant="outline"
                                        className="w-full h-[120px] flex flex-col items-center justify-center"
                                        onClick={() => handleTypeClick(visite)}
                                    >
                                        <CirclePlus className="w-10 h-10 text-muted-foreground" />
                                        <span className="text-xs text-center text-muted-foreground">
                                            <strong>Ajouter le Rapport</strong>
                                        </span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
            </div>

            {document && (
                <DocumentPreviewSheet
                    open={open}
                    onOpenChange={setOpen}
                    previewUrl={previewUrl}
                    document={document}
                    previewType={previewType}
                    doctypeAttachment="Demande"
                    showType={false}
                />
            )}
            <CoordinateursMapSheet
                open={openVisiteSheet}
                onOpenChange={setOpenVisiteSheet}
                contactId={0}
                onAssign={handleAssign}
                visite={currentVisite ?? undefined}
            />
        </>
    );
};
