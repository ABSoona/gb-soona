import { GET_BENEFICIAIRE_UPLOAD_NOTIFICATIONS } from '@/api/document/queries';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQuery } from '@apollo/client';
import { Link } from '@tanstack/react-router';
import { Bell, FileUp } from 'lucide-react';

interface PersonRef {
  id: number;
  nom: string | null;
  prenom: string | null;
}

interface NotificationDocument {
  id: string;
  name: string | null;
  createdAt: string;
  typeDocument: { label: string } | null;
  demande: { id: number; contact: PersonRef | null } | null;
  contact: PersonRef | null;
}

type NotificationTarget =
  | { to: '/demandes/$id'; params: { id: string } }
  | { to: '/contacts/$id'; params: { id: string } }
  | null;

interface NotificationGroup {
  key: string;
  docs: NotificationDocument[];
  target: NotificationTarget;
  contactLabel: string | null;
  latestCreatedAt: string;
}

// Un beneficiaire qui depose plusieurs documents d'un coup ne doit produire
// qu'une seule entree (par demande, ou a defaut par contact) plutot que
// d'inonder la cloche d'un item par fichier.
function groupNotifications(documents: NotificationDocument[]): NotificationGroup[] {
  const groups = new Map<string, NotificationGroup>();

  for (const doc of documents) {
    const key = doc.demande ? `demande-${doc.demande.id}` : doc.contact ? `contact-${doc.contact.id}` : `doc-${doc.id}`;
    const existing = groups.get(key);

    if (existing) {
      existing.docs.push(doc);
      if (doc.createdAt > existing.latestCreatedAt) existing.latestCreatedAt = doc.createdAt;
      continue;
    }

    const target: NotificationTarget = doc.demande
      ? { to: '/demandes/$id', params: { id: String(doc.demande.id) } }
      : doc.contact
        ? { to: '/contacts/$id', params: { id: String(doc.contact.id) } }
        : null;

    const personRef = doc.contact ?? doc.demande?.contact ?? null;
    const contactLabel = personRef ? `${personRef.prenom ?? ''} ${personRef.nom ?? ''}`.trim() || null : null;

    groups.set(key, { key, docs: [doc], target, contactLabel, latestCreatedAt: doc.createdAt });
  }

  return Array.from(groups.values()).sort((a, b) => (a.latestCreatedAt < b.latestCreatedAt ? 1 : -1));
}

export function NotificationBell() {
  const { data } = useQuery<{ documents: NotificationDocument[] }>(
    GET_BENEFICIAIRE_UPLOAD_NOTIFICATIONS,
    { pollInterval: 30000 }
  );

  const groups = groupNotifications(data?.documents ?? []);
  const count = groups.length;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='relative scale-95 rounded-full'>
          <Bell className='size-[1.2rem]' />
          {count > 0 && (
            <span className='absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white'>
              {count > 9 ? '9+' : count}
            </span>
          )}
          <span className='sr-only'>Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-80'>
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {groups.length === 0 ? (
          <div className='px-2 py-4 text-center text-sm text-muted-foreground'>
            Aucune nouvelle notification
          </div>
        ) : (
          groups.map((group) => {
            const docCount = group.docs.length;
            const title =
              docCount > 1
                ? `${docCount} documents déposés`
                : (group.docs[0].typeDocument?.label ?? group.docs[0].name ?? 'Document');

            const content = (
              <div className='flex items-start gap-2 w-full'>
                <FileUp className='h-4 w-4 mt-0.5 shrink-0 text-primary' />
                <div className='min-w-0'>
                  <p className='text-sm font-medium truncate'>{title}</p>
                  <p className='text-xs text-muted-foreground truncate'>
                    Déposé par le bénéficiaire{group.contactLabel ? ` ${group.contactLabel}` : ''}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {new Date(group.latestCreatedAt).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            );

            return (
              <DropdownMenuItem key={group.key} asChild className='cursor-pointer whitespace-normal'>
                {group.target ? <Link {...group.target}>{content}</Link> : <div>{content}</div>}
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
