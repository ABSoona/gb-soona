'use client';

import AppLayout from '@/components/layout/app-layout';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useComites } from '@/api/decision/decisionService';
import { IconGavel } from '@tabler/icons-react';
import { Link, useNavigate } from '@tanstack/react-router';

export default function ComitesPage() {
  const { comites, loading } = useComites();
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <IconGavel className="h-6 w-6 text-primary" />
            Comités
          </h2>
          <p className="text-muted-foreground">
            Historique des séances de comité et des décisions prises.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Spinner size="large" />
        </div>
      ) : comites.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun comité enregistré.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Dossiers traités</TableHead>
              <TableHead>Acceptés</TableHead>
              <TableHead>Refusés</TableHead>
              <TableHead>Ajournés</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comites.map((comite) => (
              <TableRow
                key={comite.id}
                className="cursor-pointer"
                onClick={() => navigate({ to: '/comites/$comiteId', params: { comiteId: String(comite.id) } })}
              >
                <TableCell className="p-0">
                  <Link
                    to="/comites/$comiteId"
                    params={{ comiteId: String(comite.id) }}
                    className="block w-full px-4 py-2"
                  >
                    Comité du {new Date(comite.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </Link>
                </TableCell>
                <TableCell>{comite.nombreTraites}</TableCell>
                <TableCell>{comite.nombreApprouves}</TableCell>
                <TableCell>{comite.nombreRefuses}</TableCell>
                <TableCell>{comite.nombreAjournes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </AppLayout>
  );
}
