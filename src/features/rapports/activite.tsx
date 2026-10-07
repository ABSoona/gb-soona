import { ReactNode, useState } from 'react'
import { saveAs } from 'file-saver'
import { endOfMonth, endOfYear, format, startOfMonth, startOfYear, subMonths, subYears } from 'date-fns'
import { fr } from 'date-fns/locale'
import { DateRange } from 'react-day-picker'
import { Download } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from '@/hooks/use-toast'
import { downloadActivityReportPdf, useActivityReportService } from '@/api/rapport/activiteReportService'

type Periode = 'mois' | 'moisPrecedent' | 'annee' | 'anneePrecedente' | 'custom'

const formatEuro = (val: number | null | undefined) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val ?? 0)

function StatCard({ value, label, className }: { value: ReactNode; label: string; className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  )
}

function DelaiCard({ titre, stats }: { titre: string; stats: { moy: number | null; min: number | null; max: number | null } }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-2xl font-bold">{stats.moy !== null ? `${stats.moy} j` : 'N/A'}</div>
        <p className="text-sm text-muted-foreground mt-1">{titre}</p>
        {stats.moy !== null && (
          <p className="text-xs text-muted-foreground mt-1">
            min {stats.min} j · max {stats.max} j
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default function RapportActivite() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(subMonths(new Date(), 1)),
    to: endOfMonth(subMonths(new Date(), 1)),
  })
  const [periode, setPeriode] = useState<Periode>('moisPrecedent')
  const [showCustomPicker, setShowCustomPicker] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const handlePeriodeChange = (p: Periode) => {
    setPeriode(p)

    switch (p) {
      case 'mois':
        setShowCustomPicker(false)
        setDateRange({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) })
        break
      case 'moisPrecedent': {
        setShowCustomPicker(false)
        const prevMonth = subMonths(new Date(), 1)
        setDateRange({ from: startOfMonth(prevMonth), to: endOfMonth(prevMonth) })
        break
      }
      case 'annee':
        setShowCustomPicker(false)
        setDateRange({ from: startOfYear(new Date()), to: endOfYear(new Date()) })
        break
      case 'anneePrecedente': {
        setShowCustomPicker(false)
        const prevYear = subYears(new Date(), 1)
        setDateRange({ from: startOfYear(prevYear), to: endOfYear(prevYear) })
        break
      }
      case 'custom':
        setShowCustomPicker(true)
        break
    }
  }

  const { data, loading } = useActivityReportService(dateRange.from, dateRange.to)

  const handleDownloadPdf = async () => {
    if (!dateRange.from || !dateRange.to) return
    setIsDownloading(true)
    try {
      const blob = await downloadActivityReportPdf(dateRange.from, dateRange.to)
      saveAs(
        blob,
        `rapport-activite-${format(dateRange.from, 'dd-MM-yyyy')}-${format(dateRange.to, 'dd-MM-yyyy')}.pdf`
      )
    } catch (_error) {
      toast({ title: 'Erreur lors du téléchargement du PDF', variant: 'destructive' })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <>
      <Header>
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-xl font-bold tracking-tight'>Rapport d'activité</h1>
          <Button variant='outline' size='sm' onClick={handleDownloadPdf} disabled={isDownloading || loading}>
            <Download className='mr-2 h-4 w-4' />
            {isDownloading ? 'Téléchargement...' : 'Télécharger le PDF'}
          </Button>
        </div>

        <div className='mb-4 flex items-center justify-between flex-wrap gap-2'>
          <div className='flex gap-2 flex-wrap'>
            <Button size='sm' variant={periode === 'mois' ? 'default' : 'outline'} onClick={() => handlePeriodeChange('mois')}>
              Mois
            </Button>
            <Button size='sm' variant={periode === 'moisPrecedent' ? 'default' : 'outline'} onClick={() => handlePeriodeChange('moisPrecedent')}>
              Mois-1
            </Button>
            <Button size='sm' variant={periode === 'annee' ? 'default' : 'outline'} onClick={() => handlePeriodeChange('annee')}>
              Année
            </Button>
            <Button size='sm' variant={periode === 'anneePrecedente' ? 'default' : 'outline'} onClick={() => handlePeriodeChange('anneePrecedente')}>
              Année-1
            </Button>
            <Button size='sm' variant={periode === 'custom' ? 'default' : 'outline'} onClick={() => handlePeriodeChange('custom')}>
              Personnalisé
            </Button>
          </div>

          {showCustomPicker && (
            <DatePickerWithRange
              value={dateRange}
              onChange={(newRange) => {
                if (newRange?.from && newRange?.to) {
                  setDateRange(newRange)
                }
              }}
            />
          )}
        </div>

        {dateRange.from && dateRange.to && (
          <p className='mb-4 text-sm text-muted-foreground'>
            Période du {format(dateRange.from, 'd MMMM yyyy', { locale: fr })} au{' '}
            {format(dateRange.to, 'd MMMM yyyy', { locale: fr })}
          </p>
        )}

        {loading || !data ? (
          <div className='space-y-4'>
            <Skeleton className='h-32 w-full rounded-md' />
            <Skeleton className='h-64 w-full rounded-md' />
          </div>
        ) : (
          <div className='space-y-6'>
            <section>
              <h2 className='text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2'>
                Demandes & Visites
              </h2>
              <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                <StatCard value={data.demRecues} label='Demandes reçues' />
                <StatCard value={data.demAcceptees} label='Demandes acceptées' />
                <StatCard value={data.demRefusees} label='Demandes refusées' />
                <StatCard value={data.demBacklog} label='Backlog' />
              </div>
              <p className='mt-2 text-xs text-muted-foreground'>
                Acceptées : premier passage en statut « En cours ». Refusées : premier passage en statut « Refusée » (Acceptées + Refusées = Demandes Traités du tableau rectificatif mensuel). Backlog : stock total des demandes au statut « reçue », indépendant de la période.
              </p>
            </section>

            <section>
              <h2 className='text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2'>
                Délais ({data.delais.periodeLabel})
              </h2>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <DelaiCard titre='Délai de prise en charge moyen' stats={data.delais.priseEnCharge} />
                <DelaiCard titre='Délai de traitement moyen' stats={data.delais.traitement} />
              </div>
              <p className='mt-2 text-xs text-muted-foreground'>
                Délai de prise en charge : entre la réception et la première prise de contact avec le bénéficiaire. Délai de traitement : entre la réception et le premier passage en statut « En cours » ou « Refusée ». Calculés sur une fenêtre glissante de 3 mois pour rester statistiquement significatifs.
              </p>
            </section>

            <section>
              <h2 className='text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2'>
                Visites bénévoles
              </h2>
              <StatCard value={data.visitesProg} label='Visites programmées' className='max-w-xs' />
            </section>

            <section>
              <h2 className='text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2'>
                Répartition par département
              </h2>
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Département</TableHead>
                      <TableHead className='text-right'>Reçues</TableHead>
                      <TableHead className='text-right'>Acceptées</TableHead>
                      <TableHead className='text-right'>Refusées</TableHead>
                      <TableHead className='text-right'>Backlog</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.departements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className='text-center text-muted-foreground'>
                          Aucune donnée disponible.
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.departements.map((row) => (
                        <TableRow key={row.departement}>
                          <TableCell className='font-medium'>{row.departement}</TableCell>
                          <TableCell className='text-right'>{row.recues}</TableCell>
                          <TableCell className='text-right'>{row.acceptees}</TableCell>
                          <TableCell className='text-right'>{row.refusees}</TableCell>
                          <TableCell className='text-right'>{row.backlog}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell>Total</TableCell>
                      <TableCell className='text-right'>{data.demRecues}</TableCell>
                      <TableCell className='text-right'>{data.demAcceptees}</TableCell>
                      <TableCell className='text-right'>{data.demRefusees}</TableCell>
                      <TableCell className='text-right'>{data.demBacklog}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </section>

            <section>
              <h2 className='text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2'>
                Aides & Versements
              </h2>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                <StatCard value={data.aidesCount} label='Aides accordées' />
                <StatCard value={formatEuro(data.aidesMontant)} label='Montant total des aides' />
                <StatCard value={data.versementsCount} label='Versements effectués' />
                <StatCard value={formatEuro(data.versementsMontant)} label='Montant total versé' />
              </div>
            </section>
          </div>
        )}
      </Main>
    </>
  )
}
