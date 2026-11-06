'use client';

import {
  getOrganizationSettings,
  updateOrganizationSettings,
} from '@/api/organizationSettings/organizationSettingsService';
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/hooks/use-toast';
import { handleServerError } from '@/utils/handle-server-error';
import { IconBuildingBank } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

export default function OrganizationSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nom, setNom] = useState('');
  const [adresse, setAdresse] = useState('');
  const [rna, setRna] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [exigerVisitesRealiseesComite, setExigerVisitesRealiseesComite] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const settings = await getOrganizationSettings();
        setNom(settings.nom ?? '');
        setAdresse(settings.adresse ?? '');
        setRna(settings.rna ?? '');
        setEmail(settings.email ?? '');
        setTelephone(settings.telephone ?? '');
        setExigerVisitesRealiseesComite(settings.exigerVisitesRealiseesComite ?? true);
      } catch (e) {
        handleServerError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateOrganizationSettings({ nom, adresse, rna, email, telephone, exigerVisitesRealiseesComite });
      toast({ title: 'Paramètres enregistrés' });
    } catch (e) {
      handleServerError(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <IconBuildingBank className="h-6 w-6 text-primary" />
            Coordonnées de l'association
          </h2>
          <p className="text-muted-foreground">
            Ces informations apparaissent sur les documents officiels (PDF de décision de comité).
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Spinner size="large" />
        </div>
      ) : (
        <div className="space-y-4 max-w-xl">
          <div className="space-y-1.5">
            <Label>Nom</Label>
            <Input value={nom} onChange={(e) => setNom(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Adresse</Label>
            <Input value={adresse} onChange={(e) => setAdresse(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>RNA</Label>
            <Input value={rna} onChange={(e) => setRna(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Téléphone</Label>
            <Input value={telephone} onChange={(e) => setTelephone(e.target.value)} />
          </div>

          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold">Contrôles avant passage en comité</h3>
            <p className="text-sm text-muted-foreground">
              Le code postal et la date de naissance du bénéficiaire, la catégorie du demandeur et le
              nombre de personnes du foyer sont toujours exigés.
            </p>
            <div className="flex items-start gap-2">
              <Checkbox
                id="exigerVisitesRealiseesComite"
                checked={exigerVisitesRealiseesComite}
                onCheckedChange={(checked) => setExigerVisitesRealiseesComite(checked === true)}
              />
              <Label htmlFor="exigerVisitesRealiseesComite" className="font-normal leading-snug">
                Exiger au moins une visite et que toutes les visites de la demande soient réalisées
                (les visites annulées sont ignorées)
              </Label>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
