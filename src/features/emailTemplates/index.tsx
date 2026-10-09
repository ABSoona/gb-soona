'use client';

import {
  EMAIL_TEMPLATE_CODE_DEMANDE_JUSTIFICATIFS,
  getEmailTemplate,
  updateEmailTemplate,
} from '@/api/emailTemplate/emailTemplateService';
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/hooks/use-toast';
import { handleServerError } from '@/utils/handle-server-error';
import { IconMail } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

const VARIABLES = [
  { token: '[Nom]', description: 'Nom et prénom du bénéficiaire' },
  {
    token: '[bouton_justificatif]',
    description:
      "Bouton de dépôt en ligne des justificatifs (affiché uniquement si l'option correspondante est cochée lors de l'envoi)",
  },
];

export default function EmailTemplatesSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [objet, setObjet] = useState('');
  const [corps, setCorps] = useState('');
  const [initialCorps, setInitialCorps] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const template = await getEmailTemplate(EMAIL_TEMPLATE_CODE_DEMANDE_JUSTIFICATIFS);
        setObjet(template.objet);
        setCorps(template.corps);
        setInitialCorps(template.corps);
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
      await updateEmailTemplate(EMAIL_TEMPLATE_CODE_DEMANDE_JUSTIFICATIFS, objet, corps);
      toast({ title: 'Modèle enregistré' });
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
            <IconMail className="h-6 w-6 text-primary" />
            Modèles d'emails
          </h2>
          <p className="text-muted-foreground">
            Personnalisez le texte par défaut du mail de demande de pièces justificatives envoyé aux bénéficiaires.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Spinner size="large" />
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            <p className="font-medium mb-1">Variables disponibles</p>
            <ul className="space-y-0.5">
              {VARIABLES.map((v) => (
                <li key={v.token}>
                  <code className="bg-background px-1 py-0.5 rounded border">{v.token}</code>
                  {' - '}
                  {v.description}
                </li>
              ))}
            </ul>
          </div>

          <Input placeholder="Objet du mail" value={objet} onChange={(e) => setObjet(e.target.value)} />

          <RichTextEditor value={corps} onChange={setCorps} initialValue={initialCorps} />

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
