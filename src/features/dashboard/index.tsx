import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Skeleton } from '@/components/ui/skeleton'
import { ClockArrowUp, HandshakeIcon, Mailbox, MapPinHouse, ScanEye, ScanSearch } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDashboardStats } from '@/api/demande/demandeStatsService'
import { Overview } from './components/overview'
import { DernieresDemandes } from './components/derniere-demande'
import AidesProvider from '../aides/context/aides-context'
import { AidesTable } from '../aides/components/aides-table'
import { columns } from '../aides/components/aides-columns'
import { useAideService } from '@/api/aide/aideService'

export default function Dashboard() {
  const { aides } = useAideService({
    where: {
      status: 'EnCours',
      frequence: 'Mensuelle'
    }
  })

  const data = useDashboardStats()

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

        <div className='space-y-4'>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-5'>
            {[
              {
                title: 'Nouvelles demandes',
                icon: <Mailbox className='h-7 w-7 text-muted-foreground' />,
                value: data?.dashBoardStats.nouvelles
              },
              {
                title: 'Demandes suivies',
                icon: <ScanSearch className='h-7 w-7 text-muted-foreground' />,
                value: data?.dashBoardStats.suivies
              },
              {
                title: 'Demandes en visite',
                icon: <MapPinHouse className='h-7 w-7 text-muted-foreground' />,
                value: data?.dashBoardStats.enVisite
              },
              {
                title: 'Demandes en comité',
                icon: <ScanEye className='h-7 w-7 text-muted-foreground' />,
                value: data?.dashBoardStats.enCommite
              },
              {
                title: 'Demandes en attente',
                icon: <ClockArrowUp className='h-7 w-7 text-muted-foreground' />,
                value: data?.dashBoardStats.enAttente
              }
            ].map(({ title, icon, value }, index) => (
              <Card key={index}>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-md font-medium'>{title}</CardTitle>
                  {icon}
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {!data?.loading ? (
                      value
                    ) : (
                      <Skeleton className="h-6 w-[100px] rounded-md" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Overview />

          <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
            <Card className='col-span-1 lg:col-span-4'>
              <CardHeader>
                <CardTitle>Aides mensuelles en cours</CardTitle>
              </CardHeader>
              <CardContent className='pl-2'>
                <AidesProvider>
                  <AidesTable
                    hideTools={true}
                    columns={columns.filter((e) => ['dateAide', 'montant', 'progressionVersements', 'nombreVersements'].includes(e?.id ?? ''))}
                    data={aides}
                  />
                </AidesProvider>
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
