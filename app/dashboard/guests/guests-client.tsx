"use client"

import { useState, useMemo } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Mail, Phone, Trash2, Eye } from "lucide-react"
import { Guest } from "@/lib/guests-server-actions"
import { addGuest as addGuestAction, updateGuest as updateGuestAction, deleteGuest as deleteGuestAction } from "@/lib/guests-server-actions"
import { AddGuestModal } from "@/components/modals/add-guest-modal"
import { ViewGuestModal } from "@/components/modals/view-guest-modal"
import { Toaster, toast } from "sonner"

interface GuestsClientProps {
  initialGuests: Guest[];
}

export default function GuestsClient({ initialGuests }: GuestsClientProps) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredGuests = useMemo(() => {
    return guests.filter(
      (guest) =>
        guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.idNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [guests, searchQuery])

  const handleView = (guest: Guest) => {
    setSelectedGuest(guest)
    setViewModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteGuestAction(id)
      setGuests(guests.filter(guest => guest.id !== id))
      toast.success("تم حذف الضيف بنجاح")
    } catch (error) {
      console.error("Error deleting guest:", error)
      toast.error("حدث خطأ أثناء حذف الضيف")
    }
  }

  const handleAddGuest = async (guestData: Omit<Guest, 'id' | 'reservations' | 'createdAt'>) => {
    try {
      const newGuest = await addGuestAction(guestData)
      setGuests([...guests, newGuest])
      setAddModalOpen(false)
      toast.success("تم إضافة الضيف بنجاح")
    } catch (error) {
      console.error("Error adding guest:", error)
      toast.error("حدث خطأ أثناء إضافة الضيف")
    }
  }

  const handleUpdateGuest = async (id: string, guestData: Omit<Guest, 'id' | 'reservations' | 'createdAt'>) => {
    try {
      const updatedGuest = await updateGuestAction(id, guestData)
      setGuests(guests.map(guest => guest.id === id ? updatedGuest : guest))
      setAddModalOpen(false)
      setEditingGuest(null)
      toast.success("تم تحديث بيانات الضيف بنجاح")
    } catch (error) {
      console.error("Error updating guest:", error)
      toast.error("حدث خطأ أثناء تحديث بيانات الضيف")
    }
  }

  const handleEditGuest = (guest: Guest) => {
    setEditingGuest(guest)
    setAddModalOpen(true)
  }

  return (
    <MainLayout>
      <Toaster position="top-center" richColors />

      <main className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">الضيوف</h1>
            <p className="text-muted-foreground mt-1">إدارة بيانات الضيوف</p>
          </div>
          <Button className="rounded-xl gap-2" onClick={() => setAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            إضافة ضيف
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث عن ضيف..."
              className="pr-10 rounded-xl bg-card border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-right text-muted-foreground">الاسم</TableHead>
                <TableHead className="text-right text-muted-foreground">الجنسية</TableHead>
                <TableHead className="text-right text-muted-foreground">نوع الهوية</TableHead>
                <TableHead className="text-right text-muted-foreground">رقم الهوية</TableHead>
                <TableHead className="text-right text-muted-foreground">الهاتف</TableHead>
                <TableHead className="text-right text-muted-foreground">البريد الإلكتروني</TableHead>
                <TableHead className="text-right text-muted-foreground">عدد الحجوزات</TableHead>
                <TableHead className="text-right text-muted-foreground">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGuests.map((guest) => (
                <TableRow key={guest.id} className="border-border hover:bg-muted/50">
                  <TableCell className="font-medium">{guest.name}</TableCell>
                  <TableCell className="text-muted-foreground">{guest.nationality}</TableCell>
                  <TableCell className="text-muted-foreground">{guest.idType}</TableCell>
                  <TableCell className="font-mono text-sm">{guest.idNumber}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm" dir="ltr">
                        {guest.phone}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{guest.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-medium">
                      {guest.reservations}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => handleView(guest)}>
                        عرض
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => handleEditGuest(guest)}
                      >
                        تعديل
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                        onClick={() => handleDelete(guest.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>

      <AddGuestModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onAddGuest={handleAddGuest}
        onUpdateGuest={handleUpdateGuest}
        editingGuest={editingGuest}
      />
      <ViewGuestModal open={viewModalOpen} onOpenChange={setViewModalOpen} guest={selectedGuest} />
    </MainLayout>
  )
}