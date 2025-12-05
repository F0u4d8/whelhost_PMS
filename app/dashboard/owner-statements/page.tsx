"use client"

import { useState } from "react"
import { usePMSStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Plus, Search, Wallet, FileText, Send, Download, Eye, DollarSign } from "lucide-react"
import { MainLayout } from "@/components/main-layout"

export default function OwnerStatementsPage() {
  const { ownerStatements, addOwnerStatement, updateOwnerStatement } = usePMSStore()
  const [search, setSearch] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [viewingStatement, setViewingStatement] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    ownerName: "",
    period: "",
    totalRevenue: 0,
    expenses: 0,
    commission: 0,
  })

  const filteredStatements = ownerStatements.filter((s) => s.ownerName.includes(search) || s.period.includes(search))

  const handleAddStatement = () => {
    const netPayout = formData.totalRevenue - formData.expenses - formData.commission
    addOwnerStatement({
      ownerId: `owner-${Date.now()}`,
      ownerName: formData.ownerName,
      period: formData.period,
      totalRevenue: formData.totalRevenue,
      expenses: formData.expenses,
      commission: formData.commission,
      netPayout,
      status: "draft",
      createdAt: new Date().toISOString().split("T")[0],
    })
    setIsAddModalOpen(false)
    setFormData({ ownerName: "", period: "", totalRevenue: 0, expenses: 0, commission: 0 })
  }

  const sendStatement = (id: string) => {
    updateOwnerStatement(id, { status: "sent" })
  }

  const markAsPaid = (id: string) => {
    updateOwnerStatement(id, { status: "paid" })
  }

  const selectedStatement = ownerStatements.find((s) => s.id === viewingStatement)

  // Calculate totals
  const totalPending = ownerStatements.filter((s) => s.status !== "paid").reduce((sum, s) => sum + s.netPayout, 0)
  const totalPaid = ownerStatements.filter((s) => s.status === "paid").reduce((sum, s) => sum + s.netPayout, 0)

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">كشوفات الملاك</h1>
          <p className="text-muted-foreground">إدارة كشوفات حسابات الملاك</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          إنشاء كشف
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalPending.toLocaleString()} ر.س</p>
                <p className="text-sm text-muted-foreground">مستحقات معلقة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalPaid.toLocaleString()} ر.س</p>
                <p className="text-sm text-muted-foreground">تم الدفع</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{ownerStatements.length}</p>
                <p className="text-sm text-muted-foreground">إجمالي الكشوفات</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="بحث بالمالك أو الفترة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Statements Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المالك</TableHead>
              <TableHead>الفترة</TableHead>
              <TableHead>الإيرادات</TableHead>
              <TableHead>المصروفات</TableHead>
              <TableHead>العمولة</TableHead>
              <TableHead>صافي المستحق</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStatements.map((statement) => (
              <TableRow key={statement.id}>
                <TableCell className="font-medium">{statement.ownerName}</TableCell>
                <TableCell>{statement.period}</TableCell>
                <TableCell>{statement.totalRevenue.toLocaleString()} ر.س</TableCell>
                <TableCell className="text-destructive">-{statement.expenses.toLocaleString()} ر.س</TableCell>
                <TableCell className="text-muted-foreground">-{statement.commission.toLocaleString()} ر.س</TableCell>
                <TableCell className="font-semibold text-success">{statement.netPayout.toLocaleString()} ر.س</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      statement.status === "paid" ? "default" : statement.status === "sent" ? "secondary" : "outline"
                    }
                  >
                    {statement.status === "paid" ? "مدفوع" : statement.status === "sent" ? "مرسل" : "مسودة"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setViewingStatement(statement.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {statement.status === "draft" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => sendStatement(statement.id)}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    )}
                    {statement.status === "sent" && (
                      <Button variant="ghost" size="sm" onClick={() => markAsPaid(statement.id)}>
                        تم الدفع
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Add Statement Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إنشاء كشف حساب</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>اسم المالك</Label>
              <Input
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                placeholder="عبدالله المالكي"
              />
            </div>
            <div className="space-y-2">
              <Label>الفترة</Label>
              <Input
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                placeholder="يناير 2024"
              />
            </div>
            <div className="space-y-2">
              <Label>إجمالي الإيرادات</Label>
              <Input
                type="number"
                value={formData.totalRevenue}
                onChange={(e) => setFormData({ ...formData, totalRevenue: Number.parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>المصروفات</Label>
                <Input
                  type="number"
                  value={formData.expenses}
                  onChange={(e) => setFormData({ ...formData, expenses: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>العمولة</Label>
                <Input
                  type="number"
                  value={formData.commission}
                  onChange={(e) => setFormData({ ...formData, commission: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="p-3 bg-secondary rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">صافي المستحق</span>
                <span className="text-lg font-bold text-success">
                  {(formData.totalRevenue - formData.expenses - formData.commission).toLocaleString()} ر.س
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddStatement}>إنشاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Statement Modal */}
      <Dialog open={!!viewingStatement} onOpenChange={() => setViewingStatement(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تفاصيل كشف الحساب</DialogTitle>
          </DialogHeader>
          {selectedStatement && (
            <div className="space-y-4 py-4">
              <div className="text-center pb-4 border-b border-border">
                <h3 className="text-xl font-bold">Alula Sky</h3>
                <p className="text-muted-foreground">كشف حساب المالك</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">المالك:</span>
                  <p className="font-medium">{selectedStatement.ownerName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">الفترة:</span>
                  <p className="font-medium">{selectedStatement.period}</p>
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex justify-between">
                  <span>إجمالي الإيرادات</span>
                  <span className="font-medium">{selectedStatement.totalRevenue.toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between text-destructive">
                  <span>المصروفات</span>
                  <span>-{selectedStatement.expenses.toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>العمولة (10%)</span>
                  <span>-{selectedStatement.commission.toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border text-lg font-bold">
                  <span>صافي المستحق</span>
                  <span className="text-success">{selectedStatement.netPayout.toLocaleString()} ر.س</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingStatement(null)}>
              إغلاق
            </Button>
            <Button>
              <Download className="w-4 h-4 ml-2" />
              تحميل PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
