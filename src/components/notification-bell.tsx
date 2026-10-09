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

interface NotificationDocument {
  id: string;
  name: string | null;
  createdAt: string;
  typeDocument: { label: string } | null;
  demande: { id: number } | null;
  contact: { id: number; nom: string | null; prenom: string | null } | null;
}

export function NotificationBell() {
  const { data } = useQuery<{ documents: NotificationDocument[] }>(
    GET_BENEFICIAIRE_UPLOAD_NOTIFICATIONS,
    { pollInterval: 30000 }
  );

  const notifications = data?.documents ?? [];
  const count = notifications.length;

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
        {notifications.length === 0 ? (
          <div className='px-2 py-4 text-center text-sm text-muted-foreground'>
            Aucune nouvelle notification
          </div>
        ) : (
          notifications.map((doc) => {
            const target = doc.demande
              ? { to: '/demandes/$id' as const, params: { id: String(doc.demande.id) } }
              : doc.contact
                ? { to: '/contacts/$id' as const, params: { id: String(doc.contact.id) } }
                : null;

            const contactLabel = doc.contact
              ? `${doc.contact.prenom ?? ''} ${doc.contact.nom ?? ''}`.trim()
              : null;

            const content = (
              <div className='flex items-start gap-2 w-full'>
                <FileUp className='h-4 w-4 mt-0.5 shrink-0 text-primary' />
                <div className='min-w-0'>
                  <p className='text-sm font-medium truncate'>
                    {doc.typeDocument?.label ?? doc.name ?? 'Document'}
                  </p>
                  <p className='text-xs text-muted-foreground truncate'>
                    Déposé par le bénéficiaire{contactLabel ? ` ${contactLabel}` : ''}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {new Date(doc.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            );

            return (
              <DropdownMenuItem key={doc.id} asChild className='cursor-pointer whitespace-normal'>
                {target ? <Link {...target}>{content}</Link> : <div>{content}</div>}
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
