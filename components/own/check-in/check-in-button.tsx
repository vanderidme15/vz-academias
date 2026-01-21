"use client"

import { Button } from "@/components/ui/button"
import { QrCode } from "lucide-react"

interface CheckInButtonProps {
  onClick: () => void
  label?: string
}

export function CheckInButton({ onClick, label = "Hacer check-in" }: CheckInButtonProps) {
  return (
    <Button onClick={onClick}>
      <QrCode className="mr-2" />{label}
    </Button>
  )
}