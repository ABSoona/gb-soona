'use client';

import AppLayout from '@/components/layout/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDecisionsByComite } from '@/api/decision/decisionService';
import { decisionTypeColor, decisionTypeLabels } from '@/features/demandes/data/decision-data';
import { cn } from '@/lib/utils';
import { ChevronLeft, FolderCheck, FolderX, Folders } from 'lucide-react';
import { useNavigate, useParams } from '@tanstack/react-router';

export default function ComiteDetail() {
  const comiteId = useParams({
    from: '/_authenticated/comites/$comiteId/',
    select: (params) => Number(params.comiteId),
  });
  const navigate = useNavigate();
  const { decisions, loading } = useDecisionsByComite(comiteId);

  const traites = decisions.length;
  const acceptes = decisions.filter((d) => d.type === 'Approbation').length;
  const rejetes = decisions.filter((d) => d.type === 'Refus').length;

  const dateComite = decisions[0]?.comite?.date;

  return (
    <AppLayout>
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/comites' })}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Comité {dateComite ? `du ${new Date(dateComite).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}` : ''}
          </h2>
          <p className="text-muted-foreground">Dossiers examinés lors de cette séance.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Spinner size="large" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            {[
              { title: 'Dossiers traités', value: traites, icon: <Folders className="h-7 w-7 text-muted-foreground" /> },
              { title: 'Dossiers acceptés', value: acceptes, icon: <FolderCheck className="h-7 w-7 text-muted-foreground" /> },
              { title: 'Dossiers rejetés', value: rejetes, icon: <FolderX className="h-7 w-7 text-muted-foreground" /> },
            ].map(({ title, value, icon }) => (
              <Card key={title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-md font-medium">{title}</CardTitle>
                  {icon}
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {decisions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun dossier pour ce comité.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° demande</TableHead>
                  <TableHead>Bénéficiaire</TableHead>
                  <TableHead>Décision</TableHead>
                  <TableHead>Aides accordées</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {decisions.map((decision) => (
                  <TableRow
                    key={decision.id}
                    className="cursor-pointer"
                    onClick={() => navigate({ to: '/demandes/$id', params: { id: String(decision.demande?.id ?? '') } })}
                  >
                    <TableCell>{decision.demande?.id}</TableCell>
                    <TableCell>
                      {decision.demande?.contact?.prenom} {decision.demande?.contact?.nom}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(decisionTypeColor[decision.type])}>
                        {decisionTypeLabels[decision.type]}
                      </Badge>
                    </TableCell>
                    <TableCell>{decision.aides?.length ?? 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}
    </AppLayout>
  );
}
