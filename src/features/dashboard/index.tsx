import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { Skeleton } from '@/components/ui/skeleton'
import { formatMontant } from '@/utils/misc'
import { IconAlertSquare, IconPercentage20 } from '@tabler/icons-react'
import { endOfMonth, endOfYear, startOfMonth, startOfYear, subMonths, subYears } from 'date-fns'
import { ClockArrowUp, HandshakeIcon, Mailbox, MapPinHouse, ScanEye, ScanSearch } from 'lucide-react'
import { useState } from 'react'
import { DateRange } from 'react-day-picker'
import { DernieresDemandes } from './components/derniere-demande'
import { Overview } from './components/overview'
import { StatusDemandes } from './components/status-demandes'
import { useDashboardStats } from '@/api/demande/demandeStatsService'
import Aides from '../aides'
import { AidesTable } from '../aides/components/aides-table'
import { columns } from '../aides/components/aides-columns'
import AidesProvider from '../aides/context/aides-context'
import { useAideService } from '@/api/aide/aideService'

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });

  const [activePeriod, setActivePeriod] = useState<'mois' | 'moisPrecedent' | 'annee' | 'anneePrecedente' | 'custom'>('mois');
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const {aides} = useAideService({where:{status:'EnCours', frequence :"Mensuelle"/* , dateAide : {lt:dateRange.to,gt:dateRange.from} */}})
  const handlePeriodChange = (period: typeof activePeriod) => {
    setActivePeriod(period);

    switch (period) {
      case 'mois':
        setShowCustomPicker(false);
        setDateRange({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) });
        break;
      case 'moisPrecedent':
        setShowCustomPicker(false);
        const prevMonth = subMonths(new Date(), 1);
        setDateRange({ from: startOfMonth(prevMonth), to: endOfMonth(prevMonth) });
        break;
      case 'annee':
        setShowCustomPicker(false);
        setDateRange({ from: startOfYear(new Date()), to: endOfYear(new Date()) });
        break;
      case 'anneePrecedente':
        setShowCustomPicker(false);
        const prevYear = subYears(new Date(), 1);
        setDateRange({ from: startOfYear(prevYear), to: endOfYear(prevYear) });
        break;
      case 'custom':
        setShowCustomPicker(true);
        break;
    }
  };

  const data = dateRange.from && dateRange.to
    ? useDashboardStats({ from: dateRange.from, to: dateRange.to })
    : null;

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
          <h1 className='text-2xl font-bold tracking-tight'>Tableau de bord</h1>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant={activePeriod === 'mois' ? 'default' : 'outline'} onClick={() => handlePeriodChange('mois')}>Mois</Button>
            <Button size="sm" variant={activePeriod === 'moisPrecedent' ? 'default' : 'outline'} onClick={() => handlePeriodChange('moisPrecedent')}>Mois-1</Button>
            <Button size="sm" variant={activePeriod === 'annee' ? 'default' : 'outline'} onClick={() => handlePeriodChange('annee')}>Année</Button>
            <Button size="sm" variant={activePeriod === 'anneePrecedente' ? 'default' : 'outline'} onClick={() => handlePeriodChange('anneePrecedente')}>Année-1</Button>
            <Button size="sm" variant={activePeriod === 'custom' ? 'default' : 'outline'} onClick={() => handlePeriodChange('custom')}>Personnalisé</Button>
          </div>

          {showCustomPicker && (
            <DatePickerWithRange
              value={dateRange}
              onChange={(newRange) => {
                if (newRange?.from && newRange?.to) {
                  setDateRange(newRange);
                }
              }}
            />
          )}
        </div>

        <div className='space-y-4'>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-5'>
            {[{
              title: 'Nouvelles demandes',
              icon: <Mailbox className='h-7 w-7 text-muted-foreground' />,
              value: data ? data.dashBoardStats.nouvelles : null
            },
            {
              title: 'Demandes suivies',
              icon: <ScanSearch  className='h-7 w-7 text-muted-foreground' />,
              value: data ? data.dashBoardStats.suivies : null
            },
            {
              title: 'Demandes en visite',
              icon: <MapPinHouse  className='h-7 w-7 text-muted-foreground' />,
              value: data ? data.dashBoardStats.enVisite : null
            },
            {
              title: 'Demandes en comité',
              icon: <ScanEye className='h-7 w-7 text-muted-foreground' />,
              value: data?data.dashBoardStats.enCommite : null
            },
            
            {
              title: 'Demandes en attente',
              icon: <ClockArrowUp className='h-7 w-7 text-muted-foreground' />,
              value: data ? data.dashBoardStats.enAttente : null
            },
           

             /*  {
              title: 'Aides versés',
              icon: <IconHeartHandshake className='h-7 w-7 text-muted-foreground' />,
              value: stats ? formatMontant(stats.totalVerse) : null
            }, */ 
           /*  {
              title: 'Personnes aidées',
              icon: <IconUsers className='h-7 w-7 text-muted-foreground' />,
              value: stats ? stats.totalContacts : null
            } */].map(({ title, icon, value }, index) => (
              <Card key={index}>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>{title}</CardTitle>
                  {icon}
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {!data?.loading ? value : <div className="space-y-2 w-full">

                      {/* Simule 6 lignes */}
                      {[...Array(1)].map((_, index) => (
                        <Skeleton key={index} className="h-6 w-[100px] rounded-md" />
                      ))}
                    </div>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div>

            <Overview startDate={dateRange.from!} endDate={dateRange.to!} />

          </div>
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
            <Card className='col-span-1 lg:col-span-4'>
              <CardHeader>
                <CardTitle>Aides mensuelles en cours</CardTitle>
              </CardHeader>
              <CardContent className='pl-2'>

               {/*  <StatusDemandes dateRange={{ from: dateRange.from!, to: dateRange.to! }} /> */}
               <AidesProvider><AidesTable hideTools={true} columns={columns.filter((e)=> ["dateAide","montant","progressionVersements","nombreVersements"].includes(e?.id?e?.id:''))} data={aides}/></AidesProvider>

              </CardContent>
            </Card>
            <Card className='col-span-1 lg:col-span-3'>

              <CardHeader>
                <CardTitle>Nouvelles demandes</CardTitle>
              </CardHeader>
              <CardContent>

                <DernieresDemandes />

              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    </>
  )
}
