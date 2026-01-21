import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DeleteDialogProps {
  openDeleteDialog: boolean
  setOpenDeleteDialog: (open: boolean) => void
  selectedItem?: any
  action: (id: string) => Promise<void>;
  customAction?: string;
}

export default function DeleteDialog({ openDeleteDialog, setOpenDeleteDialog, selectedItem, action, customAction }: DeleteDialogProps) {

  const handleDelete = async () => {
    if (selectedItem && selectedItem.id) {
      setOpenDeleteDialog(false);
      await action(selectedItem.id);
    }
  }

  return (
    <AlertDialog open={openDeleteDialog} onOpenChange={(open) => setOpenDeleteDialog(open)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{customAction || "Eliminar"}</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Esta seguro de realizar la acción para {selectedItem?.name || selectedItem?.payment_amount || selectedItem?.title || selectedItem?.description}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Regresar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} >{customAction || "Eliminar"}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
