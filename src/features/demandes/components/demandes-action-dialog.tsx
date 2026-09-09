'use client';

import { useDemandeAutreChargeService, useDemandeDetteDetailService, useDemandeService, useDemandeSituationHistoryService } from '@/api/demande/demandeService';
import { SelectDropdown } from '@/components/select-dropdown';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Demande, demandeSchema, situationFamilleTypes, situationTypes } from '@/model/demande/Demande';
import { handleServerError } from '@/utils/handle-server-error';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useDemandes } from '../context/demandes-context';
import { categorieTypes, demandeStatusTypes } from '../data/data';
import { ContactSearchCombobox } from './contact-search';
import { useUserServicev2 } from '@/api/user/userService.v2';
import { User } from '@/model/user/User';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import { useAlert } from '@/components/Alert';
import { getUserId } from '@/lib/session';


const situationBase = {
  célibataire: 1,
  marié: 2,
  divorcé: 1, // <-- corrigé avec accent
  veuf: 1,
  Inconnu:1
} as const;
// 📌 Schéma de validation du formulaire avec Zod
const formSchema = demandeSchema
  .omit({ id: true, contact: true, createdAt: true, demandeActivities: true,acteur :true,proprietaire:true
  }) // Supprime les champs "id" et "contact"
  .extend({ contactId: z.any(), acteurId: z.any()})
  .superRefine((data, ctx) => {
    if (data.situationFamiliale === 'marié') {
      if (!data.situationProConjoint) {
        ctx.addIssue({
          path: ['situationProConjoint'],
          code: z.ZodIssueCode.custom,
          message: 'Champ requis si la personne est mariée',
        });
      }
      if (data.revenusConjoint === undefined || isNaN(data.revenusConjoint)) {
        ctx.addIssue({
          path: ['revenusConjoint'],
          code: z.ZodIssueCode.custom,
          message: 'Champ requis si la personne est mariée',
        });
      }
    }
  }); // Ajoute "contactId"


type DemandeForm = z.infer<typeof formSchema>;

interface Props {
  currentRow?: Demande;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refetch: () => void;


}

// 🔥 Titre de section reutilisable pour regrouper les champs du formulaire
// (Situation personnelle, Revenus, Charges, Suivi...).
function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
        <Separator />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4">
        {children}
      </div>
    </div>
  );
}

export function DemandesActionDialog({ currentRow, open, onOpenChange,refetch }: Props) {
  const { openAlert, AlertNode } = useAlert()
  const { users } = useUserServicev2(
     { where: { role: { not: "visiteur" } } }
  );

  const isEdit = !!currentRow;

  // 🔥 Decomposition (nom + montant) du champ "Autres charges", uniquement en
  // mode modification (en creation, "Autres charges" reste un simple champ,
  // conformement au comportement existant). Voir useDemandeAutreChargeService.
  type ChargeRow = { id: number; dbId?: number; nom: string; montant: string };
  const [chargeRows, setChargeRows] = useState<ChargeRow[]>([]);
  const [editingChargeNameId, setEditingChargeNameId] = useState<number | null>(null);
  const chargesSeededRef = useRef(false);
  const {
    demandeAutreCharges,
    loading: autreChargesLoading,
    createDemandeAutreCharge,
    updateDemandeAutreCharge,
    deleteDemandeAutreCharge,
  } = useDemandeAutreChargeService(isEdit ? currentRow?.id : undefined);

  const handleAddChargeRow = () => {
    setChargeRows(prev => [...prev, { id: Date.now(), nom: '', montant: '' }]);
  };
  const handleChargeRowChange = (id: number, field: 'nom' | 'montant', newValue: string) => {
    setChargeRows(prev => prev.map(c => (c.id === id ? { ...c, [field]: newValue } : c)));
  };
  const handleRemoveChargeRow = (id: number) => {
    setChargeRows(prev => (prev.length > 1 ? prev.filter(c => c.id !== id) : prev));
  };

  // Reinitialise le flag de seed a chaque changement de demande éditée.
  useEffect(() => {
    chargesSeededRef.current = false;
  }, [currentRow?.id]);

  // Charge une seule fois la composition existante (ou, a defaut, pre-remplit
  // une ligne unique avec le montant global actuel — on ne perd rien).
  useEffect(() => {
    if (!isEdit || autreChargesLoading || chargesSeededRef.current) return;
    chargesSeededRef.current = true;
    if (demandeAutreCharges.length > 0) {
      setChargeRows(demandeAutreCharges.map(c => ({ id: c.id, dbId: c.id, nom: c.nom, montant: String(c.montant) })));
    } else if (currentRow?.autresCharges) {
      setChargeRows([{ id: Date.now(), nom: 'Autres charges', montant: String(currentRow.autresCharges) }]);
    } else {
      setChargeRows([{ id: Date.now(), nom: '', montant: '' }]);
    }
  }, [isEdit, autreChargesLoading, demandeAutreCharges, currentRow]);

  // Synchronise le total des lignes avec le champ "autresCharges" du formulaire.
  useEffect(() => {
    if (!isEdit || !chargesSeededRef.current) return;
    const totalAutresCharges = chargeRows.reduce((acc, c) => acc + Number(c.montant || 0), 0);
    form.setValue("autresCharges", totalAutresCharges);
  }, [chargeRows, isEdit]);

  // 🔥 Decomposition (nom + montant) du champ "Dettes", meme principe que
  // pour "Autres charges" : uniquement en mode modification, persistee via
  // useDemandeDetteDetailService, le champ "dettes" reste la somme.
  const [detteRows, setDetteRows] = useState<ChargeRow[]>([]);
  const [editingDetteNameId, setEditingDetteNameId] = useState<number | null>(null);
  const dettesSeededRef = useRef(false);
  const {
    demandeDetteDetails,
    loading: dettesDetailLoading,
    createDemandeDetteDetail,
    updateDemandeDetteDetail,
    deleteDemandeDetteDetail,
  } = useDemandeDetteDetailService(isEdit ? currentRow?.id : undefined);

  const handleAddDetteRow = () => {
    setDetteRows(prev => [...prev, { id: Date.now(), nom: '', montant: '' }]);
  };
  const handleDetteRowChange = (id: number, field: 'nom' | 'montant', newValue: string) => {
    setDetteRows(prev => prev.map(c => (c.id === id ? { ...c, [field]: newValue } : c)));
  };
  const handleRemoveDetteRow = (id: number) => {
    setDetteRows(prev => (prev.length > 1 ? prev.filter(c => c.id !== id) : prev));
  };

  useEffect(() => {
    dettesSeededRef.current = false;
  }, [currentRow?.id]);

  useEffect(() => {
    if (!isEdit || dettesDetailLoading || dettesSeededRef.current) return;
    dettesSeededRef.current = true;
    if (demandeDetteDetails.length > 0) {
      setDetteRows(demandeDetteDetails.map(c => ({ id: c.id, dbId: c.id, nom: c.nom, montant: String(c.montant) })));
    } else if (currentRow?.dettes) {
      setDetteRows([{ id: Date.now(), nom: 'Dettes', montant: String(currentRow.dettes) }]);
    } else {
      setDetteRows([{ id: Date.now(), nom: '', montant: '' }]);
    }
  }, [isEdit, dettesDetailLoading, demandeDetteDetails, currentRow]);

  // Synchronise le total des lignes avec le champ "dettes" du formulaire.
  useEffect(() => {
    if (!isEdit || !dettesSeededRef.current) return;
    const totalDettes = detteRows.reduce((acc, c) => acc + Number(c.montant || 0), 0);
    form.setValue("dettes", totalDettes);
  }, [detteRows, isEdit]);

  const whereClause = isEdit ? {where:{id : {equals:currentRow.id}}}:{where:{id:{equals:0}}}
  const { createDemande, updateDemande,  isSubmitting } = useDemandeService();
  const { createDemandeSituationHistory } = useDemandeSituationHistoryService();
  const [isHistorizing, setIsHistorizing] = useState(false);
  const form = useForm<DemandeForm>({
    resolver: zodResolver(formSchema),

    defaultValues: isEdit
    ? {
        contactId: currentRow?.contact?.id ?? '',
        status: currentRow?.status ?? 'recue',
        remarques: currentRow?.remarques ?? '',
        nombreEnfants: currentRow?.nombreEnfants ?? 0,
        nombrePersonnes: currentRow?.nombrePersonnes,
        agesEnfants: currentRow?.agesEnfants ?? '',
        situationFamiliale: currentRow?.situationFamiliale ?? undefined,
        situationProfessionnelle: currentRow?.situationProfessionnelle ?? undefined,
        situationProConjoint: currentRow?.situationProConjoint ?? undefined,
        revenus: currentRow?.revenus ?? 0,
        revenusConjoint: currentRow?.revenusConjoint ?? 0,
        loyer: currentRow?.loyer ?? 0,
        facturesEnergie: currentRow?.facturesEnergie ?? 0,
        dettes: currentRow?.dettes ?? 0,
        natureDettes: currentRow?.natureDettes ?? '',
        autresAides: currentRow?.autresAides ?? '',
        autresCharges:currentRow?.autresCharges ?? 0,
        apl: currentRow?.apl ?? 0,
        categorieDemandeur: currentRow?.categorieDemandeur ?? undefined,
        acteurId: currentRow?.acteur?.id ?? undefined,
        telegramComiteeAction:currentRow.telegramComiteeAction??false
      }
    : {
        contactId: '',
        status: 'recue',
        remarques: '',
        nombreEnfants: 0,
        agesEnfants: '',
        situationFamiliale: undefined,
        situationProfessionnelle: undefined,
        situationProConjoint: undefined,
        revenus: 0,
        revenusConjoint: 0,
        loyer: 0,
        facturesEnergie: 0,
        dettes: 0,
        natureDettes: '',
        autresAides: '',
        autresCharges: 0,
        apl: 0,
        categorieDemandeur: undefined,
        acteurId: undefined,
        telegramComiteeAction : false
      }

  });
  const situationFamiliale = form.watch("situationFamiliale");
  const dettes = form.watch("dettes");
  const nombreEnfants = form.watch("nombreEnfants");

  const suggestion = useMemo(() => {
    if (!situationFamiliale) return null;

    const base = situationBase[situationFamiliale] ?? 1;
    return base + (nombreEnfants || 0);
  }, [situationFamiliale, nombreEnfants]);

  const onSubmit = async (values: DemandeForm, historiser: boolean = false) => {
    console.log("erreur de validation: ");
    const demandePayload = {
      contact: { id: Number(values.contactId) }, // Utilisation du contact ID sélectionné
      acteur : {id : values.acteurId},
      status: values.status,
      remarques: values.remarques,
      revenus: Number(values.revenus),
      nombreEnfants: Number(values.nombreEnfants),
      nombrePersonnes : Number(values.nombrePersonnes),
      agesEnfants: values.agesEnfants,
      situationFamiliale: values.situationFamiliale,
      situationProfessionnelle: values.situationProfessionnelle,
      situationProConjoint: values.situationProConjoint,
      revenusConjoint: Number(values.revenusConjoint),
      loyer: Number(values.loyer),
      facturesEnergie: (values.facturesEnergie),
      dettes: Number(values.dettes),
      natureDettes: values.natureDettes,
      autresAides: values.autresAides,
      autresCharges: Number(values.autresCharges),
      apl: Number(values.apl),
      categorieDemandeur: values.categorieDemandeur,
      proprietaire: !isEdit? {id : values.acteurId}:null,
      telegramComiteeAction :isEdit ?currentRow.telegramComiteeAction:false

    };

    try {
      if (isEdit && currentRow?.id) {
       if( values.status == 'EnCours' && values.categorieDemandeur == undefined  )
        throw Error("Vous devez d'abord renseigner la categorie du demandeur");

        // 🔥 L'historisation doit figer la situation telle qu'elle était AVANT
        // cette mise à jour (currentRow, chargé avant l'édition), pas les
        // nouvelles valeurs qu'on est en train d'enregistrer — sinon
        // l'historique ne fait que dupliquer l'état courant.
        if (historiser) {
          setIsHistorizing(true);
          try {
            const userId = getUserId();
            await createDemandeSituationHistory({
              demande: { id: currentRow.id },
              creePar: userId ? { id: userId } : undefined,
              nombreEnfants: currentRow.nombreEnfants ?? 0,
              nombrePersonnes: currentRow.nombrePersonnes ?? 0,
              agesEnfants: currentRow.agesEnfants,
              situationFamiliale: currentRow.situationFamiliale,
              situationProfessionnelle: currentRow.situationProfessionnelle,
              situationProConjoint: currentRow.situationProConjoint,
              revenus: currentRow.revenus ?? 0,
              revenusConjoint: currentRow.revenusConjoint ?? 0,
              loyer: currentRow.loyer ?? 0,
              facturesEnergie: currentRow.facturesEnergie ?? 0,
              dettes: currentRow.dettes ?? 0,
              natureDettes: currentRow.natureDettes,
              autresAides: currentRow.autresAides,
              autresCharges: currentRow.autresCharges ?? 0,
              apl: currentRow.apl ?? 0,
              categorieDemandeur: currentRow.categorieDemandeur,
              remarques: currentRow.remarques,
            });
          } finally {
            setIsHistorizing(false);
          }
        }

        await updateDemande(currentRow.id, demandePayload);

        // 🔥 Synchronise la composition des "Autres charges" : supprime les
        // lignes retirées, met à jour les existantes, crée les nouvelles.
        const currentDbIds = new Set(chargeRows.map(c => c.dbId).filter((id): id is number => !!id));
        await Promise.all(
          demandeAutreCharges
            .filter(c => !currentDbIds.has(c.id))
            .map(c => deleteDemandeAutreCharge(c.id))
        );
        await Promise.all(
          chargeRows.map(c => {
            const nom = c.nom.trim();
            const montant = Number(c.montant || 0);
            if (!nom && !montant) return Promise.resolve();
            if (c.dbId) {
              return updateDemandeAutreCharge(c.dbId, { nom: nom || 'Autres charges', montant });
            }
            return createDemandeAutreCharge({ demande: { id: currentRow.id }, nom: nom || 'Autres charges', montant });
          })
        );

        // 🔥 Synchronise la composition des "Dettes" : meme logique que pour
        // les "Autres charges".
        const currentDetteDbIds = new Set(detteRows.map(c => c.dbId).filter((id): id is number => !!id));
        await Promise.all(
          demandeDetteDetails
            .filter(c => !currentDetteDbIds.has(c.id))
            .map(c => deleteDemandeDetteDetail(c.id))
        );
        await Promise.all(
          detteRows.map(c => {
            const nom = c.nom.trim();
            const montant = Number(c.montant || 0);
            if (!nom && !montant) return Promise.resolve();
            if (c.dbId) {
              return updateDemandeDetteDetail(c.dbId, { nom: nom || 'Dettes', montant });
            }
            return createDemandeDetteDetail({ demande: { id: currentRow.id }, nom: nom || 'Dettes', montant });
          })
        );

        toast({ title: 'Demande mise à jour avec succès !' });
      } else {
        console.log(demandePayload);
        await createDemande(demandePayload);

        toast({ title: 'Nouvelle demande créée avec succès !' });
      }
      onOpenChange(false);
      await refetch();
      form.reset();

    } catch (error : any) {
        handleServerError(error);
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });

    }
  };

  return (
    <>{AlertNode}
    <Sheet

      open={open}
      onOpenChange={(state) => {
        form.reset();
        chargesSeededRef.current = false;
        dettesSeededRef.current = false;
        onOpenChange(state);
      }}
    >
      <SheetContent className="flex flex-col w-full sm:max-w-3xl">
        <SheetHeader className="text-left">
          <SheetTitle>{isEdit ? 'Modifier la Demande' : 'Ajouter une Demande'}</SheetTitle>
          <SheetDescription>
            {isEdit ? 'Mettez à jour la demande ici.' : 'Créez une nouvelle demande ici.'} Cliquez sur "Enregistrer" lorsque vous avez terminé.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-full w-full py-1 pr-4">
          <Form {...form}>
            <form id="demande-form" onSubmit={(e) => {
              console.log(form.formState.errors);
              form.handleSubmit((values) => onSubmit(values, false))(e);
              console.log("✅ handleSubmit exécuté !");
            }} className="space-y-9 p-0.5">

              <FormField
                control={form.control}
                name="contactId"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-foreground/70 font-medium">Bénéficiaire</FormLabel>
                    <FormControl>
                      <ContactSearchCombobox
                        onSelect={(contactId) => {
                          console.log('🔄 Nouveau contact sélectionné :', contactId); // ✅ Vérification
                          field.onChange(contactId); // ✅ Met à jour correctement `form`
                        }}
                        defaultContact={
                          isEdit && currentRow?.contact
                            ? { id: currentRow.contact.id, nom: currentRow.contact.nom, prenom: currentRow.contact.prenom }
                            : undefined
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormSection title="Situation personnelle">
                <FormField
                  control={form.control}
                  name="categorieDemandeur"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-foreground/70 font-medium">Catégorie du bénéficiaire</FormLabel>
                      <SelectDropdown
                        defaultValue={field.value?.toString()}
                        onValueChange={field.onChange}
                        placeholder="Choisissez une categorie"
                        className="w-full"
                        items={[...categorieTypes]}

                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="situationFamiliale"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-foreground/70 font-medium">Situation matrimoniale</FormLabel>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder="Choisissez une situation"
                        className="w-full"
                        items={[...situationFamilleTypes]}

                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="situationProfessionnelle"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-foreground/70 font-medium">Situation professionnelle</FormLabel>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder="Choisissez une situation"
                        className="w-full"
                        items={[...situationTypes]}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {situationFamiliale === "marié" && <FormField
                  control={form.control}
                  name="situationProConjoint"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-foreground/70 font-medium">Situation pro. Conjoint</FormLabel>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder="Choisissez une situation"
                        className="w-full"
                        items={[...situationTypes]}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />}
                <FormField
                  control={form.control}
                  name='nombreEnfants'
                  render={({ field }) => (
                    <FormItem className='space-y-1'>
                      <FormLabel className="text-foreground/70 font-medium">
                        Nombre d'enfants
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='de 1 à 20'
                          autoComplete='off'
                          {...field}
                          type='number'
                          onChange={(e) => {
                            const inputValue = parseInt(e.target.value, 10);
                            field.onChange(inputValue < 0 ? 0 : inputValue);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}

                />
                {
                  nombreEnfants > 0 && <FormField
                    control={form.control}
                    name='agesEnfants'
                    render={({ field }) => (
                      <FormItem className='space-y-1'>
                        <FormLabel className="text-foreground/70 font-medium">
                          Ages des enfants
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Ex : 9, 13 et 17 '
                            autoComplete='off'
                            {...field}

                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}

                  />
                }
                <FormField
                  control={form.control}
                  name="nombrePersonnes"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-foreground/70 font-medium">Nb. de personnes dans le foyer</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="de 1 à 20"
                          type="number"
                          {...field}
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10);
                            field.onChange(v < 0 ? 0 : v);
                          }}
                        />
                      </FormControl>

                      {/* --- Texte suggestion --- */}
                      {suggestion && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Suggestion : {suggestion} personne{suggestion > 1 ? "s" : ""}
                        </p>
                      )}

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>

              <FormSection title="Revenus">
                <FormField
                  control={form.control}
                  name='revenus'
                  render={({ field }) => (
                    <FormItem className='space-y-1'>
                      <FormLabel className="text-foreground/70 font-medium">
                        Revenus  (€)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Sans centimes, sans singe €'
                          autoComplete='off'
                          {...field}


                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}

                />
                {situationFamiliale === "marié" && <FormField
                  control={form.control}
                  name='revenusConjoint'
                  render={({ field }) => (
                    <FormItem className='space-y-1'>
                      <FormLabel className="text-foreground/70 font-medium">
                        Revenus du conjoint  (€)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Sans centimes, sans singe €'
                          autoComplete='off'
                          {...field}

                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />}
                <FormField
                  control={form.control}
                  name='apl'
                  render={({ field }) => (
                    <FormItem className='space-y-1'>
                      <FormLabel className="text-foreground/70 font-medium">
                        APL  (€)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Sans centimes, sans singe €'
                          autoComplete='off'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}

                />
                <FormField
                  control={form.control}
                  name='autresAides'
                  render={({ field }) => (
                    <FormItem className='space-y-1'>
                      <FormLabel className="text-foreground/70 font-medium">
                        Autres aides
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Association, Famille...'
                          autoComplete='off'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}

                />
              </FormSection>

              <FormSection title="Charges">
                <FormField
                  control={form.control}
                  name='loyer'
                  render={({ field }) => (
                    <FormItem className='space-y-1'>
                      <FormLabel className="text-foreground/70 font-medium">
                        Loyer mensuel (€)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Sans centimes, sans singe €'
                          autoComplete='off'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}

                />
                <FormField
                  control={form.control}
                  name='facturesEnergie'
                  render={({ field }) => (
                    <FormItem className='space-y-1'>
                      <FormLabel className="text-foreground/70 font-medium">
                        Factures Energie (€)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Sans centimes, sans singe €'
                          autoComplete='off'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}

                />
                <div className="sm:col-span-2 lg:col-span-3 space-y-4">
                  {!isEdit ? (
                    <FormField
                      control={form.control}
                      name="autresCharges"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-foreground/70 font-medium">Autres charges (€)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Sans centimes, sans signe €"
                              className="sm:max-w-xs"
                              autoComplete="off"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-foreground/70 font-medium">Autres charges (€) - composition</FormLabel>

                      <div className="space-y-2">
                        {chargeRows.map((charge) => (
                          <div key={charge.id} className="flex gap-2 items-center">
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2">
                              {editingChargeNameId === charge.id ? (
                                <Input
                                  placeholder="Nom de la charge"
                                  value={charge.nom}
                                  onChange={(e) => handleChargeRowChange(charge.id, 'nom', e.target.value)}
                                  onBlur={() => setEditingChargeNameId(null)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      setEditingChargeNameId(null);
                                    }
                                  }}
                                  autoFocus
                                  autoComplete="off"
                                />
                              ) : (
                                <div className="flex items-center gap-2 px-1 py-2">
                                  <span className={`text-sm truncate ${charge.nom ? '' : 'text-muted-foreground'}`}>
                                    {charge.nom || 'Nom de la charge'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setEditingChargeNameId(charge.id)}
                                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              )}
                              <Input
                                type="number"
                                placeholder="Montant €"
                                value={charge.montant}
                                onChange={(e) => handleChargeRowChange(charge.id, 'montant', e.target.value)}
                                autoComplete="off"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                              onClick={() => handleRemoveChargeRow(charge.id)}
                              disabled={chargeRows.length <= 1}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <Button type="button" variant="secondary" size="sm" onClick={handleAddChargeRow} className="mt-1">
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter une charge
                      </Button>

                      {/* 🔥 Texte du total mis à jour en live */}
                      <p className="text-sm text-muted-foreground mt-2">
                        Total des charges : <span className="font-medium">{chargeRows.reduce((acc, c) => acc + Number(c.montant || 0), 0).toLocaleString('fr-FR')} €</span>
                      </p>
                    </FormItem>
                  )}
                </div>
              </FormSection>

              <FormSection title="Dettes">
                <div className="sm:col-span-2 lg:col-span-3 space-y-4">
                  {!isEdit ? (
                    <FormField
                      control={form.control}
                      name="dettes"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-foreground/70 font-medium">Dettes (€)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Sans centimes, sans signe €"
                              className="sm:max-w-xs"
                              autoComplete="off"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-foreground/70 font-medium">Dettes (€) - composition</FormLabel>

                      <div className="space-y-2">
                        {detteRows.map((detteRow) => (
                          <div key={detteRow.id} className="flex gap-2 items-center">
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2">
                              {editingDetteNameId === detteRow.id ? (
                                <Input
                                  placeholder="Nom de la dette"
                                  value={detteRow.nom}
                                  onChange={(e) => handleDetteRowChange(detteRow.id, 'nom', e.target.value)}
                                  onBlur={() => setEditingDetteNameId(null)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      setEditingDetteNameId(null);
                                    }
                                  }}
                                  autoFocus
                                  autoComplete="off"
                                />
                              ) : (
                                <div className="flex items-center gap-2 px-1 py-2">
                                  <span className={`text-sm truncate ${detteRow.nom ? '' : 'text-muted-foreground'}`}>
                                    {detteRow.nom || 'Nom de la dette'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setEditingDetteNameId(detteRow.id)}
                                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              )}
                              <Input
                                type="number"
                                placeholder="Montant €"
                                value={detteRow.montant}
                                onChange={(e) => handleDetteRowChange(detteRow.id, 'montant', e.target.value)}
                                autoComplete="off"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                              onClick={() => handleRemoveDetteRow(detteRow.id)}
                              disabled={detteRows.length <= 1}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <Button type="button" variant="secondary" size="sm" onClick={handleAddDetteRow} className="mt-1">
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter une dette
                      </Button>

                      <p className="text-sm text-muted-foreground mt-2">
                        Total des dettes : <span className="font-medium">{detteRows.reduce((acc, c) => acc + Number(c.montant || 0), 0).toLocaleString('fr-FR')} €</span>
                      </p>
                    </FormItem>
                  )}
                </div>
                {dettes > 0 && <FormField
                  control={form.control}
                  name='natureDettes'
                  render={({ field }) => (
                    <FormItem className='space-y-1 lg:col-span-2'>
                      <FormLabel className="text-foreground/70 font-medium">
                        Natures des dettes
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Retard de loyer, Amendes...'
                          autoComplete='off'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}

                />}
              </FormSection>

              <FormSection title="Suivi">
                {isEdit && <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-foreground/70 font-medium">Statut</FormLabel>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder="Choisissez un statut"
                        className="w-full"
                        items={[...demandeStatusTypes]}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />}
                <FormField
                  control={form.control}
                  name="acteurId"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-foreground/70 font-medium">Attribuée à</FormLabel>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder="Choisissez un membre"
                        className="w-full"

                        items={users.map((user: User) => {
                          const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
                          const label = (
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-black text-xs text-center font-medium text-white flex items-center justify-center">
                                {initials}
                              </div>
                              <span>{user.firstName} {user.lastName}</span>
                            </div>
                          );

                          return {
                            value: user.id.toString(),
                            label,
                          };
                        })}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 📌 Champ Remarques */}
                <FormField
                  control={form.control}
                  name="remarques"
                  render={({ field }) => (
                    <FormItem className="space-y-1 sm:col-span-2 lg:col-span-3">
                      <FormLabel className="text-foreground/70 font-medium">Remarques</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Ajoutez une remarque" className="min-h-[150px]" autoComplete="off" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>
            </form>
          </Form>
        </ScrollArea>
        <SheetFooter>
          {isEdit && (
            <Button
              type="button"
              variant="secondary"
              disabled={isSubmitting || isHistorizing}
              onClick={() => form.handleSubmit((values) => onSubmit(values, true))()}
            >
              {isHistorizing ? 'En cours...' : 'Enregistrer et historiser'}
            </Button>
          )}
          <Button type="submit" form="demande-form" disabled={isSubmitting}>
            {isSubmitting ? 'En cours...' : 'Enregistrer'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet></>
  );
}
