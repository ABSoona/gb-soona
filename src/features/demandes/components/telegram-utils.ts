import { Demande, situationFamilleTypes, situationTypes } from "@/model/demande/Demande";
import { z } from "zod";

export function buildTelegramMessage(demande: Demande) {
    const lines: string[] = [];
  
    const situationFamille =
      situationFamilleTypes.find(s => s.value === demande.situationFamiliale)?.label ?? "-";
  
    const situationPro =
      situationTypes.find(s => s.value === demande.situationProfessionnelle)?.label ?? "-";
  
    const situationProConjoint =
      demande.situationFamiliale === "marié"
        ? situationTypes.find(s => s.value === demande.situationProConjoint)?.label ?? "-"
        : null;
  
    const enfantsLabel =
      demande.nombreEnfants && demande.nombreEnfants > 0
        ? `${demande.nombreEnfants} enfant${demande.nombreEnfants > 1 ? "s" : ""}`
        : "sans enfant";
  
    const agesEnfants =
      demande.nombreEnfants && demande.nombreEnfants > 0
        ? demande.agesEnfants ?? null
        : null;
  
    const totalRevenus =
      (demande.revenus ?? 0) +
      (demande.revenusConjoint ?? 0) +
      (demande.apl ?? 0);
  
    const totalCharges =
      (demande.loyer ?? 0) +
      (demande.facturesEnergie ?? 0) +
      (demande.autresCharges ?? 0);
  
    const dettes = demande.dettes ?? 0;
  
    const resteAVivre = totalRevenus - totalCharges;
    const resteAVivreParPersonne =
      resteAVivre > 0 && demande.nombrePersonnes>0
        ? resteAVivre / demande.nombrePersonnes / 30
        : 0;
  
    lines.push(`Nom : ${demande.contact.nom} ${demande.contact.prenom}`);
    lines.push(`Situation : ${situationFamille} - ${enfantsLabel}`);
    agesEnfants && lines.push(`Âges enfants : ${agesEnfants}`);
    lines.push(`Situation pro : ${situationPro}`);
  
    if (situationProConjoint) {
      lines.push(`Situation conjoint : ${situationProConjoint}`);
    }
  
    lines.push(
      `Revenus : ${totalRevenus.toLocaleString("fr-FR", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
      })}`
    );
  
    lines.push(
      `Charges : ${totalCharges.toLocaleString("fr-FR", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
      })}`
    );
  
    lines.push(
      `Dettes : ${dettes.toLocaleString("fr-FR", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
      })}`
    );

    if (demande?.natureDettes?.trim() !== "") {
      lines.push(`Nature Dettes : ${demande?.natureDettes}`);
    }
  
    lines.push(
      `Reste à vivre : ${resteAVivre.toLocaleString("fr-FR", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
      })}${
        resteAVivreParPersonne > 0
          ? ` (${resteAVivreParPersonne.toLocaleString("fr-FR", {
              style: "currency",
              currency: "EUR",
              minimumFractionDigits: 0,
            })} / j / pers.)`
          : ""
      }`
    );
  
   
    return lines;
  }
  

  const telegramSuggestion = z.union([
    z.literal('reject'),
    z.literal('accept')
  ]);
  export type telegramSuggestion = z.infer<typeof telegramSuggestion>;
  export const telegramSuggestOptions = [
    {
      label: 'Rejeter',
      value: 'reject',
    },
    {
      label: 'Accepter',
      value: 'accept',

    },
   
  ] as const;