import AppLayout from '@/components/layout/app-layout'
import { Separator } from '@/components/ui/separator'
import {
  IconBell,
  IconPalette,
  IconTool
} from '@tabler/icons-react'
import { Outlet } from '@tanstack/react-router'
import SidebarNav from './components/sidebar-nav'

export default function Settings() {
  return (
    <>
      {/* ===== Top Heading ===== */}


      <AppLayout>
        <div className='space-y-0.5'>
          <h1 className='text-xl font-bold tracking-tight md:text-3xl'>
            Mon compte
          </h1>
          <p className='text-muted-foreground'>
            Gérez les paramètres de votre compte et définissez vos préférences e-mail.
          </p>
        </div>
        <Separator className='my-4 lg:my-6' />
        <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <aside className='top-0 lg:sticky lg:w-1/5'>
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className='flex w-full overflow-y-hidden p-1 pr-4'>
            <Outlet />
          </div>
        </div>
      </AppLayout>
    </>
  )
}

const sidebarNavItems = [

  {
    title: 'Mon compte',
    icon: <IconTool size={18} />,
    href: '/settings/account',
  },
  {
    title: 'Apparence',
    icon: <IconPalette size={18} />,
    href: '/settings/appearance',
  },
  {
    title: 'Notifications',
    icon: <IconBell size={18} />,
    href: '/settings/notifications',
  },
  /*  {
      title: 'Display',
      icon: <IconBrowserCheck size={18} />,
      href: '/settings/display',
    },*/
]
