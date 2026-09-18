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
import { RapportVersementRow, useRapportVersementsMensuelsService } from '@/api/rapport/rapportVersementsService'

type Periode = 'mois' | 'moisPrecedent' | 'annee' | 'anneePrecedente' | 'custom'

const formatEuro = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)

const CSV_HEADERS = ['Mois', 'Nombre de versements', 'Montant total']

const csvField = (value: string | number) => JSON.stringify(value ?? '')

const buildCsv = (rows: RapportVersementRow[]) => {
  return [
    CSV_HEADERS.map(csvField).join(','),
    ...rows.map((row) => [csvField(row.moisLabel), csvField(row.nombreVersements), csvField(row.montantTotal)].join(',')),
  ].join('\n')
}

const exportToCsv = (rows: RapportVersementRow[]) => {
  const blob = new Blob([buildCsv(rows)], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'rapport_versements_mensuels.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function VersementsMensuels() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfYear(new Date()),
    to: endOfYear(new Date()),
  })
  const [periode, setPeriode] = useState<Periode>('annee')
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

  const { rows, montantTotalPeriode, loading } = useRapportVersementsMensuelsService(dateRange.from, dateRange.to)
  const nombreTotalPeriode = rows.reduce((acc, row) => acc + row.nombreVersements, 0)

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
          <h1 className='text-xl font-bold tracking-tight'>Versements par mois</h1>
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
          Versements au statut Versé ou Planifié, regroupés par mois selon leur date de versement, sur la période sélectionnée.
        </p>

        {loading ? (
          <Skeleton className='h-[400px] w-full rounded-md' />
        ) : (
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mois</TableHead>
                  <TableHead className='text-right'>Nombre de versements</TableHead>
                  <TableHead className='text-right'>Montant total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className='text-center text-muted-foreground'>
                      Aucune donnée disponible.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.mois}>
                      <TableCell className='font-medium capitalize'>{row.moisLabel}</TableCell>
                      <TableCell className='text-right'>{row.nombreVersements}</TableCell>
                      <TableCell className='text-right'>{formatEuro(row.montantTotal)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              {rows.length > 0 && (
                <TableFooter>
                  <TableRow>
                    <TableCell>Total</TableCell>
                    <TableCell className='text-right'>{nombreTotalPeriode}</TableCell>
                    <TableCell className='text-right'>{formatEuro(montantTotalPeriode)}</TableCell>
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
