import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getCurrentUser } from '@/api/user/userService'

export function ProfileDropdown() {
  const navigate = useNavigate()
  const [user, setUser] = useState<null | Awaited<ReturnType<typeof getCurrentUser>>>(null)

  useEffect(() => {
    getCurrentUser().then(setUser).catch((err) => {
      console.error('Erreur lors du chargement de l’utilisateur :', err)
    })
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    navigate({ to: '/sign-in' })
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src='/avatars/01.png' alt='@user' />
            <AvatarFallback>
              {user?.firstName?.[0].toUpperCase() ?? 'U'}
              {user?.lastName?.[0].toUpperCase() ?? ''}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>
              {user ? `${user.firstName} ${user.lastName}` : 'Chargement...'}
            </p>
            <p className='text-xs leading-none text-muted-foreground'>
              {user?.email ?? ''}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to='/settings'>
              Mon compte
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Se déconnecter
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
