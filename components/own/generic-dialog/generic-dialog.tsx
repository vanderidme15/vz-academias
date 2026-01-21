import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ReactNode } from "react";

interface GenericDialogProps {
  openDialog: boolean
  setOpenDialog: (open: boolean) => void
  title?: string
  description?: string
  children?: ReactNode
}

export default function GenericDialog({
  openDialog,
  setOpenDialog,
  title,
  description,
  children
}: GenericDialogProps) {
  return (
    <Dialog modal={false} open={openDialog} onOpenChange={(open) => setOpenDialog(open)}>
      {openDialog && <div className="fixed inset-0 bg-black/50 z-40" aria-hidden="true" />}
      <DialogContent
        className="shadow-lg max-h-[80vh] h-fit w-full min-w-[400px] sm:w-fit flex flex-col z-50 overflow-hidden "
        onInteractOutside={(e) => {
          const target = e.target as Element
          if (
            target.closest("[data-radix-popper-content-wrapper]") ||
            target.closest('[data-state="open"]') ||
            target.closest(".popover-content")
          ) {
            e.preventDefault()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}