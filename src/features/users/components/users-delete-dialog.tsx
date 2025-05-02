import { deleteUser } from '@/api/user/userService'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { User } from '@/model/user/User'
import { IconAlertTriangle } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User

}

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,

}: Props) {
  const queryClient = useQueryClient()
  const [value, setValue] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (value.trim() !== currentRow.username) {
      toast({ title: 'Username mismatch!', variant: 'destructive' })
      return
    }

    setIsDeleting(true)
    try {
      await deleteUser(currentRow.id) // Appel API
      toast({ title: 'Utilisateur supprimé!' })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onOpenChange(false)
    } catch (error) {
      toast({ title: 'Failed to delete user', variant: 'destructive' })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.username || isDeleting}
      title={
        <span className='text-destructive'>
          <IconAlertTriangle className='mr-1 inline-block' size={18} />
          Delete User
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{currentRow.username}</span>? This action
            is irreversible.
          </p>

          <Label>
            Confirm by typing the username:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter username to confirm deletion'
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Once deleted, this user cannot be recovered.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={isDeleting ? 'Deleting...' : 'Delete'}
      destructive
    />
  )
}
