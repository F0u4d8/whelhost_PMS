"use client"

import { useState, useMemo } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Copy, ExternalLink, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePMSStore } from "@/lib/store"
import { AddPaymentLinkModal } from "@/components/modals/add-payment-link-modal"
import { Toaster, toast } from "sonner"

const statusConfig = {
  active: { label: "نشط", className: "bg-success/20 text-success border-success/30" },
  paid: { label: "مدفوع", className: "bg-primary/20 text-primary border-primary/30" },
  expired: { label: "منتهي", className: "bg-muted text-muted-foreground border-border" },
}

export default function PaymentLinksPage() {
  const { paymentLinks, deletePaymentLink } = usePMSStore()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredLinks = useMemo(() => {
    return paymentLinks.filter(
      (link) => link.id.toLowerCase().includes(searchQuery.toLowerCase()) || link.description.includes(searchQuery),
    )
  }, [paymentLinks, searchQuery])

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success("تم نسخ الرابط بنجاح")
  }

  const handleOpen = (url: string) => {
    window.open(url, "_blank")
  }

  const handleDelete = (id: string) => {
    deletePaymentLink(id)
    toast.success("تم حذف رابط الدفع بنجاح")
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Toaster position="top-center" richColors />

      <main className="mr-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">روابط الدفع</h1>
            <p className="text-muted-foreground mt-1">إنشاء وإدارة روابط الدفع الإلكتروني</p>
          </div>
          <Button className="rounded-xl gap-2" onClick={() => setAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            إنشاء رابط
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث برقم الرابط أو الوصف..."
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
                <TableHead className="text-right text-muted-foreground">رقم الرابط</TableHead>
                <TableHead className="text-right text-muted-foreground">تاريخ الإنشاء</TableHead>
                <TableHead className="text-right text-muted-foreground">المبلغ</TableHead>
                <TableHead className="text-right text-muted-foreground">الوصف</TableHead>
                <TableHead className="text-right text-muted-foreground">تاريخ الانتهاء</TableHead>
                <TableHead className="text-right text-muted-foreground">الحالة</TableHead>
                <TableHead className="text-right text-muted-foreground">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLinks.map((link) => {
                const status = statusConfig[link.status as keyof typeof statusConfig]
                return (
                  <TableRow key={link.id} className="border-border hover:bg-muted/50">
                    <TableCell className="font-medium text-primary">{link.id}</TableCell>
                    <TableCell className="text-muted-foreground">{link.createdAt}</TableCell>
                    <TableCell className="font-medium">{link.amount.toLocaleString()} ر.س</TableCell>
                    <TableCell className="max-w-[200px] truncate">{link.description}</TableCell>
                    <TableCell className="text-muted-foreground">{link.expiresAt}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("rounded-full", status.className)}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          title="نسخ الرابط"
                          onClick={() => handleCopy(link.url)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          title="فتح الرابط"
                          onClick={() => handleOpen(link.url)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                          onClick={() => handleDelete(link.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </main>

      <AddPaymentLinkModal open={addModalOpen} onOpenChange={setAddModalOpen} />
    </div>
  )
}
