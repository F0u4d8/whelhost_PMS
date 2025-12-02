"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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
import { LogIn, LogOut, X, Key, Pencil } from "lucide-react"
import Link from "next/link"

interface BookingActionsProps {
  bookingId: string
  status: string
  hasSmartLock: boolean
}

export function BookingActions({ bookingId, status, hasSmartLock }: BookingActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showCheckInDialog, setShowCheckInDialog] = useState(false)
  const [showCheckOutDialog, setShowCheckOutDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const handleCheckIn = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/v1/bookings/${bookingId}/check-in`, {
        method: "POST",
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to check in")
      }
      router.refresh()
    } catch (error) {
      console.error("Check-in error:", error)
      alert((error as Error).message)
    } finally {
      setIsLoading(false)
      setShowCheckInDialog(false)
    }
  }

  const handleCheckOut = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/v1/bookings/${bookingId}/check-out`, {
        method: "POST",
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to check out")
      }
      router.refresh()
    } catch (error) {
      console.error("Check-out error:", error)
      alert((error as Error).message)
    } finally {
      setIsLoading(false)
      setShowCheckOutDialog(false)
    }
  }

  const handleCancel = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/v1/bookings/${bookingId}/cancel`, {
        method: "POST",
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to cancel booking")
      }
      router.refresh()
    } catch (error) {
      console.error("Cancel error:", error)
      alert((error as Error).message)
    } finally {
      setIsLoading(false)
      setShowCancelDialog(false)
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {status === "confirmed" && (
          <Button onClick={() => setShowCheckInDialog(true)} disabled={isLoading}>
            <LogIn className="mr-2 h-4 w-4" />
            Check In
          </Button>
        )}

        {status === "checked_in" && (
          <Button onClick={() => setShowCheckOutDialog(true)} disabled={isLoading}>
            <LogOut className="mr-2 h-4 w-4" />
            Check Out
          </Button>
        )}

        {hasSmartLock && (status === "confirmed" || status === "checked_in") && (
          <Button variant="outline">
            <Key className="mr-2 h-4 w-4" />
            Generate Access
          </Button>
        )}

        <Button variant="outline" asChild>
          <Link href={`/dashboard/bookings/${bookingId}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>

        {status !== "cancelled" && status !== "checked_out" && (
          <Button variant="destructive" onClick={() => setShowCancelDialog(true)} disabled={isLoading}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        )}
      </div>

      {/* Check-in Dialog */}
      <AlertDialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Check-in</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the guest as checked in and update the room status to occupied. A cleaning task will be
              created for checkout.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCheckIn} disabled={isLoading}>
              {isLoading ? "Processing..." : "Confirm Check-in"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Check-out Dialog */}
      <AlertDialog open={showCheckOutDialog} onOpenChange={setShowCheckOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Check-out</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the guest as checked out, free up the room, and revoke any active access codes. A cleaning
              task will be created automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCheckOut} disabled={isLoading}>
              {isLoading ? "Processing..." : "Confirm Check-out"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone. If the guest has already
              checked in, the room will be freed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Cancelling..." : "Cancel Booking"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
