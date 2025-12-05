"use client"

import { useState, useMemo } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, ArrowUpCircle, ArrowDownCircle, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePMSStore } from "@/lib/store"
import { AddReceiptModal } from "@/components/modals/add-receipt-modal"
import { Toaster, toast } from "sonner"

export default function ReceiptsPage() {
  const { receipts, deleteReceipt } = usePMSStore()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  const filteredReceipts = useMemo(() => {
    return receipts.filter((receipt) => {
      const matchesSearch =
        receipt.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.reservationNumber.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = typeFilter === "all" || receipt.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [receipts, searchQuery, typeFilter])

  const totalIncome = receipts.filter((r) => r.type === "income").reduce((sum, r) => sum + r.amount, 0)
  const totalExpense = receipts.filter((r) => r.type === "expense").reduce((sum, r) => sum + r.amount, 0)
  const netIncome = totalIncome - totalExpense

  const handleDelete = (id: string) => {
    deleteReceipt(id)
    toast.success("تم حذف السند بنجاح")
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Toaster position="top-center" richColors />

      <main className="mr-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">السندات</h1>
            <p className="text-muted-foreground mt-1">إدارة سندات القبض والصرف</p>
          </div>
          <Button className="rounded-xl gap-2" onClick={() => setAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            إضافة سند
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px] rounded-xl bg-card border-border">
              <SelectValue placeholder="النوع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="income">إيرادات</SelectItem>
              <SelectItem value="expense">مصروفات</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث برقم السند أو الحجز..."
              className="pr-10 rounded-xl bg-card border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-success/10 border border-success/30 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                <ArrowDownCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-success">{totalIncome.toLocaleString()} ر.س</p>
              </div>
            </div>
          </div>
          <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                <ArrowUpCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المصروفات</p>
                <p className="text-2xl font-bold text-destructive">{totalExpense.toLocaleString()} ر.س</p>
              </div>
            </div>
          </div>
          <div className="bg-primary/10 border border-primary/30 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <ArrowDownCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">صافي الدخل</p>
                <p className="text-2xl font-bold text-primary">{netIncome.toLocaleString()} ر.س</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-right text-muted-foreground">رقم السند</TableHead>
                <TableHead className="text-right text-muted-foreground">التاريخ والوقت</TableHead>
                <TableHead className="text-right text-muted-foreground">النوع</TableHead>
                <TableHead className="text-right text-muted-foreground">المبلغ</TableHead>
                <TableHead className="text-right text-muted-foreground">طريقة الدفع</TableHead>
                <TableHead className="text-right text-muted-foreground">رقم الحجز</TableHead>
                <TableHead className="text-right text-muted-foreground">ملاحظات</TableHead>
                <TableHead className="text-right text-muted-foreground">المستخدم</TableHead>
                <TableHead className="text-right text-muted-foreground">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReceipts.map((receipt) => (
                <TableRow key={receipt.id} className="border-border hover:bg-muted/50">
                  <TableCell className="font-medium text-primary">{receipt.id}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">{receipt.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full gap-1",
                        receipt.type === "income"
                          ? "bg-success/20 text-success border-success/30"
                          : "bg-destructive/20 text-destructive border-destructive/30",
                      )}
                    >
                      {receipt.type === "income" ? (
                        <ArrowDownCircle className="h-3 w-3" />
                      ) : (
                        <ArrowUpCircle className="h-3 w-3" />
                      )}
                      {receipt.type === "income" ? "إيرادات" : "مصروفات"}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={cn("font-medium", receipt.type === "income" ? "text-success" : "text-destructive")}
                  >
                    {receipt.type === "income" ? "+" : "-"}
                    {receipt.amount.toLocaleString()} ر.س
                  </TableCell>
                  <TableCell>{receipt.method}</TableCell>
                  <TableCell className="font-mono text-sm">{receipt.reservationNumber}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[150px] truncate">{receipt.notes}</TableCell>
                  <TableCell>{receipt.user}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                      onClick={() => handleDelete(receipt.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>

      <AddReceiptModal open={addModalOpen} onOpenChange={setAddModalOpen} />
    </div>
  )
}
