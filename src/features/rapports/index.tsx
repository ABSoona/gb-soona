import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileBarChart } from 'lucide-react'

type RapportDefinition = {
  title: string
  description: string
  url: string
  enabled: boolean
}

const rapports: RapportDefinition[] = [
  {
    title: 'Tableau rectificatif mensuel',
    description:
      "Demandes reçues, visites, changements de statut et délais moyens de traitement, mois par mois.",
    url: '/rapports/tableau-mensuel',
    enabled: true,
  },
  {
    title: 'Répartition des demandes par département',
    description: 'Demandes reçues, acceptées, refusées et backlog par département, sur une période sélectionnable.',
    url: '/rapports/repartition-departements',
    enabled: true,
  },
  {
    title: 'Récapitulatif des versements',
    description: 'Nombre et montant total des versements effectués (statut « Versé »), mois par mois, sur une période sélectionnable.',
    url: '/rapports/versements-recapitulatif',
    enabled: true,
  },
  {
    title: 'Prévisionnel de versements',
    description: 'Versements à venir (statuts « À verser » et « Planifié »), mois par mois, sur une période sélectionnable.',
    url: '/rapports/versements-previsionnel',
    enabled: true,
  },
]

export default function Rapports() {
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
          <h1 className='text-xl font-bold tracking-tight'>Rapports</h1>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {rapports.map((rapport) =>
            rapport.enabled ? (
              <Link key={rapport.url} to={rapport.url}>
                <Card className='h-full transition-colors hover:bg-muted/50'>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-md font-medium'>{rapport.title}</CardTitle>
                    <FileBarChart className='h-6 w-6 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{rapport.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <Card key={rapport.url} className='h-full opacity-50'>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-md font-medium'>{rapport.title}</CardTitle>
                  <FileBarChart className='h-6 w-6 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <CardDescription>{rapport.description}</CardDescription>
                  <p className='mt-2 text-xs text-muted-foreground'>Bientôt disponible</p>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </Main>
    </>
  )
}
