'use client';

import { useDemandeAutreChargeService, useDemandeService, useDemandeSituationHistoryService } from '@/api/demande/demandeService';
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
import { Plus, X } from 'lucide-react';
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
        onOpenChange(state);
      }}
    >
      <SheetContent className="flex flex-col" >
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
            }} className="space-y-4 p-0.5">

              <FormField
                control={form.control}
                name="contactId"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Bénéficiaire</FormLabel>
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
              <FormField
                control={form.control}
                name="categorieDemandeur"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Catégorie du bénéficiaire</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value?.toString()}
                      onValueChange={field.onChange}
                      placeholder="Choisissez une categorie"
                      className="col-span-4"
                      items={[...categorieTypes]}

                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='nombreEnfants'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      Nombre d'enfants
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='de 1 à 20'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                        type='number'
                        onChange={(e) => {
                          const inputValue = parseInt(e.target.value, 10);
                          field.onChange(inputValue < 0 ? 0 : inputValue);
                        }}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}

              />
                {/* --- CHAMP NOMBRE DE PERSONNES --- */}
      <FormField
        control={form.control}
        name="nombrePersonnes"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel>Nb. de personnes dans le foyer</FormLabel>
            <FormControl>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="de 1 à 20"
                  type="number"
                  className="col-span-4"
                  {...field}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    field.onChange(v < 0 ? 0 : v);
                  }}
                />

                
              </div>
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
              {
                nombreEnfants > 0 && <FormField
                  control={form.control}
                  name='agesEnfants'
                  render={({ field }) => (
                    <FormItem className='space-y-1'>
                      <FormLabel>
                        Ages des enfants
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Ex : 9, 13 et 17 '
                          className='col-span-4'
                          autoComplete='off'
                          {...field}

                        />
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}

                />
              }
              <FormField
                control={form.control}
                name="situationFamiliale"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Situation matrimoniale</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Choisissez une situation"
                      className="col-span-4"
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
                    <FormLabel>Situation professionnelle</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Choisissez une situation"
                      className="col-span-4"
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
                    <FormLabel>Situation pro. Conjoint</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Choisissez une situation"
                      className="col-span-4"
                      items={[...situationTypes]}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />}


              <FormField
                control={form.control}
                name='revenus'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      Revenus  (€)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Sans centimes, sans singe €'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}


                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}

              />
              {situationFamiliale === "marié" && <FormField
                control={form.control}
                name='revenusConjoint'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      Revenus du conjoint  (€)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Sans centimes, sans singe €'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}

                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />}
              <FormField
                control={form.control}
                name='apl'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      APL  (€)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Sans centimes, sans singe €'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}

              />
              <FormField
                control={form.control}
                name='autresAides'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      Autres aides
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Association, Famille...'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}

              />
              <FormField
                control={form.control}
                name='loyer'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      Loyer mensuel (€)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Sans centimes, sans singe €'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}

              />
              <FormField
                control={form.control}
                name='facturesEnergie'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      Factures Energie (€)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Sans centimes, sans singe €'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}

              />
               <div className="space-y-4">
                {!isEdit ? (
                  <FormField
                    control={form.control}
                    name="autresCharges"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Autres charges (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Sans centimes, sans signe €"
                            className="col-span-4"
                            autoComplete="off"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="col-span-4 col-start-3" />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormItem className="space-y-1">
                    <FormLabel>Autres charges (€) — composition</FormLabel>

                    <div className="space-y-2">
                      {chargeRows.map((charge) => (
                        <div key={charge.id} className="flex gap-2">
                          <Input
                            placeholder="Nom de la charge"
                            value={charge.nom}
                            onChange={(e) => handleChargeRowChange(charge.id, 'nom', e.target.value)}
                            autoComplete="off"
                            className="flex-[2]"
                          />
                          <Input
                            type="number"
                            placeholder="Montant €"
                            value={charge.montant}
                            onChange={(e) => handleChargeRowChange(charge.id, 'montant', e.target.value)}
                            autoComplete="off"
                            className="flex-1"
                          />
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

              <FormField
                control={form.control}
                name='dettes'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      Dettes (€)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Sans centimes, sans singe €'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}

              />
              {dettes > 0 && <FormField
                control={form.control}
                name='natureDettes'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>
                      Natures des dettes
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Retard de loyer, Amendes...'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}

              />}

              {/* 📌 Sélecteur de statut */}
              {isEdit && <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Statut</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Choisissez un statut"
                      className="col-span-4"
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
                    <FormLabel>Attribuée à</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Choisissez un membre"
                      className="col-span-4"
      
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
                  <FormItem className="space-y-1">
                    <FormLabel>Remarques</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ajoutez une remarque" className="col-span-4 min-h-[150px]" autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
