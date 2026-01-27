"use client"

import GenericDialog from "../generic-dialog/generic-dialog";
import { DynamicForm } from "../dynamic-form/dynamic-form";
import { z } from "zod";
import { useUsuarioStore } from "@/lib/store/auth.store";
import { FieldConfig } from "@/shared/types/ui.types";

interface PasswordChangeProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function PasswordChange({ open, setOpen }: PasswordChangeProps) {
  const { updatePassword } = useUsuarioStore();

  const passwordChangeSchema = z.object({
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(32, "La contraseña debe tener menos de 32 caracteres"),
  });

  const handlePasswordChange = async (values: Record<string, string>) => {
    try {
      await updatePassword(values.password);
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const fields: FieldConfig[] = [
    {
      name: 'password',
      label: 'Contraseña',
      type: 'password',
      required: true,
    }
  ];

  return (
    <GenericDialog
      openDialog={open}
      setOpenDialog={setOpen}
      title="Cambiar Contraseña"
      description="Cambia tu contraseña para mantener tu cuenta segura."
    >
      <DynamicForm
        schema={passwordChangeSchema}
        fields={fields}
        onSubmit={handlePasswordChange}
      />
    </GenericDialog>
  )
}