'use client';

import {
  EMAIL_TEMPLATE_CODE_DEMANDE_JUSTIFICATIFS,
  EMAIL_TEMPLATE_CODE_DEMANDE_JUSTIFICATIFS_WHATSAPP,
  getEmailTemplate,
  updateEmailTemplate,
} from '@/api/emailTemplate/emailTemplateService';
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { handleServerError } from '@/utils/handle-server-error';
import { IconBrandWhatsapp, IconMail } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

const VARIABLES_EMAIL = [
  { token: '[Nom]', description: 'Nom et prénom du bénéficiaire' },
  {
    token: '[bouton_justificatif]',
    description:
      "Bouton de dépôt en ligne des justificatifs (affiché uniquement si l'option correspondante est cochée lors de l'envoi)",
  },
];

const VARIABLES_WHATSAPP = [{ token: '[Nom]', description: 'Nom et prénom du bénéficiaire' }];

function VariablesLegend({ variables }: { variables: { token: string; description: string }[] }) {
  return (
    <div className="rounded-md border bg-muted/40 p-3 text-sm">
      <p className="font-medium mb-1">Variables disponibles</p>
      <ul className="space-y-0.5">
        {variables.map((v) => (
          <li key={v.token}>
            <code className="bg-background px-1 py-0.5 rounded border">{v.token}</code>
            {' - '}
            {v.description}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function EmailTemplatesSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [objet, setObjet] = useState('');
  const [corps, setCorps] = useState('');
  const [initialCorps, setInitialCorps] = useState('');

  const [savingWhatsapp, setSavingWhatsapp] = useState(false);
  const [corpsWhatsapp, setCorpsWhatsapp] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [template, templateWhatsapp] = await Promise.all([
          getEmailTemplate(EMAIL_TEMPLATE_CODE_DEMANDE_JUSTIFICATIFS),
          getEmailTemplate(EMAIL_TEMPLATE_CODE_DEMANDE_JUSTIFICATIFS_WHATSAPP),
        ]);
        setObjet(template.objet);
        setCorps(template.corps);
        setInitialCorps(template.corps);
        setCorpsWhatsapp(templateWhatsapp.corps);
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

  const handleSaveWhatsapp = async () => {
    setSavingWhatsapp(true);
    try {
      await updateEmailTemplate(EMAIL_TEMPLATE_CODE_DEMANDE_JUSTIFICATIFS_WHATSAPP, '', corpsWhatsapp);
      toast({ title: 'Message enregistré' });
    } catch (e) {
      handleServerError(e);
    } finally {
      setSavingWhatsapp(false);
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
            Personnalisez les messages par défaut de demande de pièces justificatives envoyés aux bénéficiaires.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Spinner size="large" />
        </div>
      ) : (
        <div className="space-y-8 max-w-3xl">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <IconMail className="h-4 w-4" />
              Message par email
            </h3>
            <VariablesLegend variables={VARIABLES_EMAIL} />

            <Input placeholder="Objet du mail" value={objet} onChange={(e) => setObjet(e.target.value)} />

            <RichTextEditor value={corps} onChange={setCorps} initialValue={initialCorps} />

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <IconBrandWhatsapp className="h-4 w-4" />
              Message WhatsApp
            </h3>
            <VariablesLegend variables={VARIABLES_WHATSAPP} />

            <Textarea
              placeholder="Message envoyé par WhatsApp"
              value={corpsWhatsapp}
              onChange={(e) => setCorpsWhatsapp(e.target.value)}
              rows={8}
            />

            <div className="flex justify-end">
              <Button onClick={handleSaveWhatsapp} disabled={savingWhatsapp}>
                {savingWhatsapp ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
