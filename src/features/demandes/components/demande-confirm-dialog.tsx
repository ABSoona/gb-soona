import { JSX, useState } from 'react'
import { ConfirmDialog } from '@/components/confirm-dialog' // adapte le chemin

export function useConfirmDialog() {
  const [dialogProps, setDialogProps] = useState<{
    open: boolean
    title: React.ReactNode
    desc: string | JSX.Element
    handleConfirm: () => void
    confirmText?: React.ReactNode
    cancelBtnText?: string
    destructive?: boolean
    isLoading?: boolean
    className?: string
  }>({
    open: false,
    title: '',
    desc: '',
    handleConfirm: () => {},
  })

  const openConfirmDialog = (
    title: React.ReactNode,
    desc: string | JSX.Element,
    handleConfirm: () => void,
    options?: {
      confirmText?: React.ReactNode
      cancelBtnText?: string
      destructive?: boolean
      isLoading?: boolean
      className?: string
    }
  ) => {
    setDialogProps({
      open: true,
      title,
      desc,
      handleConfirm,
      ...options,
    })
  }

  const ConfirmDialogComponent = (
    <ConfirmDialog
      {...dialogProps}
      onOpenChange={(open) => setDialogProps((prev) => ({ ...prev, open }))}
      handleConfirm={async () => {
        await dialogProps.handleConfirm();
        setDialogProps((prev) => ({ ...prev, open: false }));
      }}
    />
  )

  return { openConfirmDialog, ConfirmDialogComponent }
}
