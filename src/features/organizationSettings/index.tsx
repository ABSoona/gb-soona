'use client';

import {
  getOrganizationSettings,
  updateOrganizationSettings,
} from '@/api/organizationSettings/organizationSettingsService';
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
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

  useEffect(() => {
    (async () => {
      try {
        const settings = await getOrganizationSettings();
        setNom(settings.nom ?? '');
        setAdresse(settings.adresse ?? '');
        setRna(settings.rna ?? '');
        setEmail(settings.email ?? '');
        setTelephone(settings.telephone ?? '');
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
      await updateOrganizationSettings({ nom, adresse, rna, email, telephone });
      toast({ title: 'Coordonnées enregistrées' });
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
