"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

const ConfirmDialog = ({
                         open,
                         onClose,
                         onConfirm,
                         title = "Confirm Action",
                         message = "Are you sure you want to proceed?",
                         confirmText = "Confirm",
                         cancelText = "Cancel",
                         variant = "destructive",
                       }) => {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
    } catch (error) {
      console.error("Confirmation action failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {title}
            </DialogTitle>
            <DialogDescription className="text-gray-600">{message}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {cancelText}
            </Button>
            <Button
                type="button"
                variant={variant}
                onClick={handleConfirm}
                disabled={loading}
                className={variant === "destructive" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
              ) : (
                  confirmText
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  )
}

export default ConfirmDialog
