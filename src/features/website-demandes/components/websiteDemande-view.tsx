'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WebsiteDemande } from '@/model/website-demandes/website-demandes.ts';

interface Props {
  currentRow: WebsiteDemande;
}

export function WebsiteDemandeView({ currentRow }: Props) {
  if (!currentRow) return null;

  return (
    <div className="sm:min-w-full grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-3 md:grid-cols-1 gap-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations du bénéficiaire</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Nom :</strong> {currentRow.nomDemandeur}</p>
          <p><strong>Prénom :</strong> {currentRow.prenomDemandeur}</p>
          <p><strong>Téléphone :</strong> {currentRow.telephoneDemandeur}</p>
          <p><strong>Email :</strong> {currentRow.emailDemandeur}</p>
          <p><strong>Ville :</strong> {currentRow.villeDemandeur}</p>
          <p><strong>Etat :</strong> {currentRow.status}</p>
          <p><strong>Créée le :</strong> {new Date(currentRow.createdAt).toLocaleDateString('fr-FR')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
