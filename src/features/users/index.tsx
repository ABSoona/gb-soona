import { columns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersTable } from './components/users-table'
import UsersProvider from './context/users-context'


import { getUsers } from '@/api/user/userService'
import AppLayout from '@/components/layout/app-layout'
import { User } from '@/model/user/User'
import { IconUsers } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'

export default function Users() {


  // Parse user list
  const { data: users } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: getUsers,
  })

  return (
    <UsersProvider>

      <AppLayout>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <IconUsers className="h-6 w-6 text-primary" />
              Utilisateurs</h2>
            <p className='text-muted-foreground'>
              Vous pouvez gérer ici les accès à GBSoona
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <UsersTable data={users ?? []} columns={columns} />
        </div>
      </AppLayout>

      <UsersDialogs />
    </UsersProvider>
  )
}
