import { Download } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RapportMensuelRow, useRapportMensuelService } from '@/api/rapport/rapportMensuelService'

const formatDelai = (jours: number | null) => (jours === null ? '—' : `${jours} j`)

const CSV_HEADERS = [
  'Mois',
  'Demandes reçues',
  'Demande Traités',
  'Visites',
  "Délai moyen jusqu'à visite (j)",
  'Délai moyen de traitement (j)',
  'Abandonnée',
]

const csvField = (value: string | number) => JSON.stringify(value ?? '')

const buildCsv = (rows: RapportMensuelRow[]) => {
  return [
    CSV_HEADERS.map(csvField).join(','),
    ...rows.map((row) =>
      [
        csvField(row.moisLabel),
        csvField(row.demandesRecues),
        csvField(row.passeesEnCoursRefusee),
        csvField(row.visitesNonAnnulees),
        csvField(row.delaiMoyenVisiteJours ?? ''),
        csvField(row.delaiMoyenEnCoursRefuseeJours ?? ''),
        csvField(row.dossiersAbandonnes),
      ].join(',')
    ),
  ].join('\n')
}

const exportToCsv = (rows: RapportMensuelRow[]) => {
  const blob = new Blob([buildCsv(rows)], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'rapport_tableau_mensuel.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function TableauMensuel() {
  const { rows, loading } = useRapportMensuelService()

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
          <h1 className='text-xl font-bold tracking-tight'>Tableau rectificatif mensuel</h1>
          <Button
            variant='outline'
            size='sm'
            onClick={() => exportToCsv(rows)}
            disabled={loading || rows.length === 0}
          >
            <Download className='mr-2 h-4 w-4' />
            Exporter CSV
          </Button>
        </div>

        {loading ? (
          <Skeleton className='h-[400px] w-full rounded-md' />
        ) : (
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mois</TableHead>
                  <TableHead className='text-right'>Demandes reçues</TableHead>
                  <TableHead className='text-right'>Demande Traités</TableHead>
                  <TableHead className='text-right'>Visites</TableHead>
                  <TableHead className='text-right'>Délai moyen jusqu'à visite</TableHead>
                  <TableHead className='text-right'>Délai moyen de traitement</TableHead>
                  <TableHead className='text-right'>Abandonnée</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className='text-center text-muted-foreground'>
                      Aucune donnée disponible.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.mois}>
                      <TableCell className='font-medium capitalize'>{row.moisLabel}</TableCell>
                      <TableCell className='text-right'>{row.demandesRecues}</TableCell>
                      <TableCell className='text-right'>{row.passeesEnCoursRefusee}</TableCell>
                      <TableCell className='text-right'>{row.visitesNonAnnulees}</TableCell>
                      <TableCell className='text-right'>{formatDelai(row.delaiMoyenVisiteJours)}</TableCell>
                      <TableCell className='text-right'>{formatDelai(row.delaiMoyenEnCoursRefuseeJours)}</TableCell>
                      <TableCell className='text-right'>{row.dossiersAbandonnes}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Main>
    </>
  )
}
