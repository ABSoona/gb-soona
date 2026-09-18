import { useState } from 'react'
import { endOfMonth, endOfYear, startOfMonth, startOfYear, subMonths, subYears } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { Download } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
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
import { RapportDepartementRow, useRapportDepartementsService } from '@/api/rapport/rapportDepartementsService'

type Periode = 'mois' | 'moisPrecedent' | 'annee' | 'anneePrecedente' | 'custom'

const CSV_HEADERS = ['Département', 'Reçues', 'Acceptées', 'Refusées', 'Backlog']

const csvField = (value: string | number) => JSON.stringify(value ?? '')

const buildCsv = (rows: RapportDepartementRow[]) => {
  return [
    CSV_HEADERS.map(csvField).join(','),
    ...rows.map((row) =>
      [csvField(row.departement), csvField(row.recues), csvField(row.acceptees), csvField(row.refusees), csvField(row.backlog)].join(',')
    ),
  ].join('\n')
}

const exportToCsv = (rows: RapportDepartementRow[]) => {
  const blob = new Blob([buildCsv(rows)], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'rapport_repartition_departements.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function RepartitionDepartements() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })
  const [periode, setPeriode] = useState<Periode>('mois')
  const [showCustomPicker, setShowCustomPicker] = useState(false)

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

  const { rows, totals, loading } = useRapportDepartementsService(dateRange.from, dateRange.to)

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
          <h1 className='text-xl font-bold tracking-tight'>Répartition des demandes par département</h1>
          <Button variant='outline' size='sm' onClick={() => exportToCsv(rows)} disabled={loading || rows.length === 0}>
            <Download className='mr-2 h-4 w-4' />
            Exporter CSV
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

        <p className='mb-4 text-xs text-muted-foreground'>
          Reçues et Acceptées/Refusées sont comptées sur la période sélectionnée (respectivement via la date de création et la date de décision). Le Backlog est le stock total actuel des demandes au statut « reçue », indépendant de la période.
        </p>

        {loading ? (
          <Skeleton className='h-[400px] w-full rounded-md' />
        ) : (
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
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className='text-center text-muted-foreground'>
                      Aucune donnée disponible.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
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
              {totals && (
                <TableFooter>
                  <TableRow>
                    <TableCell>Total</TableCell>
                    <TableCell className='text-right'>{totals.recues}</TableCell>
                    <TableCell className='text-right'>{totals.acceptees}</TableCell>
                    <TableCell className='text-right'>{totals.refusees}</TableCell>
                    <TableCell className='text-right'>{totals.backlog}</TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
        )}
      </Main>
    </>
  )
}
