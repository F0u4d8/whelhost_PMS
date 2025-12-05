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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lock, Plus, Search, Key, Battery, Wifi, WifiOff, AlertTriangle, RefreshCw, Copy, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { MainLayout } from "@/components/main-layout"

export default function SmartLocksPage() {
  const { smartLocks, accessKeys, units, reservations, addSmartLock, addAccessKey, revokeAccessKey, deleteSmartLock } =
    usePMSStore()
  const [search, setSearch] = useState("")
  const [isAddLockModalOpen, setIsAddLockModalOpen] = useState(false)
  const [isGenerateKeyModalOpen, setIsGenerateKeyModalOpen] = useState(false)
  const [selectedLock, setSelectedLock] = useState<string | null>(null)
  const [lockFormData, setLockFormData] = useState({
    unitId: "",
    provider: "ttlock" as const,
    deviceId: "",
  })
  const [keyFormData, setKeyFormData] = useState({
    reservationId: "",
    validFrom: "",
    validTo: "",
  })

  const filteredLocks = smartLocks.filter(
    (lock) => lock.unitNumber.includes(search) || lock.deviceId.toLowerCase().includes(search.toLowerCase()),
  )

  const handleAddLock = () => {
    const unit = units.find((u) => u.id === lockFormData.unitId)
    if (!unit) return

    addSmartLock({
      unitId: lockFormData.unitId,
      unitNumber: unit.number,
      provider: lockFormData.provider,
      deviceId: lockFormData.deviceId,
      status: "online",
      batteryLevel: 100,
      lastSync: new Date().toISOString().replace("T", " ").substring(0, 16),
    })
    setIsAddLockModalOpen(false)
    setLockFormData({ unitId: "", provider: "ttlock", deviceId: "" })
  }

  const handleGenerateKey = () => {
    const lock = smartLocks.find((l) => l.id === selectedLock)
    const reservation = reservations.find((r) => r.id === keyFormData.reservationId)
    if (!lock || !reservation) return

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    addAccessKey({
      lockId: lock.id,
      reservationId: reservation.id,
      guestName: reservation.guest,
      code,
      validFrom: keyFormData.validFrom || reservation.checkIn + " 15:00",
      validTo: keyFormData.validTo || reservation.checkOut + " 12:00",
      status: "active",
      usageCount: 0,
    })
    setIsGenerateKeyModalOpen(false)
    setKeyFormData({ reservationId: "", validFrom: "", validTo: "" })
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  const statusConfig = {
    online: { label: "متصل", color: "text-success", icon: Wifi },
    offline: { label: "غير متصل", color: "text-destructive", icon: WifiOff },
    "low-battery": { label: "بطارية منخفضة", color: "text-warning", icon: AlertTriangle },
  }

  const providerLabels = {
    ttlock: "TTLock",
    yale: "Yale",
    august: "August",
    schlage: "Schlage",
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الأقفال الذكية</h1>
          <p className="text-muted-foreground">إدارة الأقفال ورموز الدخول</p>
        </div>
        <Button onClick={() => setIsAddLockModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة قفل
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{smartLocks.length}</p>
                <p className="text-sm text-muted-foreground">إجمالي الأقفال</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                <Wifi className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{smartLocks.filter((l) => l.status === "online").length}</p>
                <p className="text-sm text-muted-foreground">متصل</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{smartLocks.filter((l) => l.status === "low-battery").length}</p>
                <p className="text-sm text-muted-foreground">بطارية منخفضة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Key className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{accessKeys.filter((k) => k.status === "active").length}</p>
                <p className="text-sm text-muted-foreground">رموز نشطة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="locks">
        <TabsList>
          <TabsTrigger value="locks">الأقفال</TabsTrigger>
          <TabsTrigger value="keys">رموز الدخول</TabsTrigger>
        </TabsList>

        <TabsContent value="locks" className="mt-4">
          {/* Search */}
          <div className="relative max-w-md mb-4">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالوحدة أو معرف الجهاز..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>

          {/* Locks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLocks.map((lock) => {
              const status = statusConfig[lock.status]
              const StatusIcon = status.icon
              return (
                <Card key={lock.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                          <Lock className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold">وحدة {lock.unitNumber}</h3>
                          <p className="text-sm text-muted-foreground">{providerLabels[lock.provider]}</p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          lock.status === "online"
                            ? "default"
                            : lock.status === "low-battery"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        <StatusIcon className="w-3 h-3 ml-1" />
                        {status.label}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">معرف الجهاز</span>
                        <span className="font-mono">{lock.deviceId}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">البطارية</span>
                        <div className="flex items-center gap-2">
                          <Battery
                            className={cn(
                              "w-4 h-4",
                              lock.batteryLevel > 50
                                ? "text-success"
                                : lock.batteryLevel > 20
                                  ? "text-warning"
                                  : "text-destructive",
                            )}
                          />
                          <span>{lock.batteryLevel}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">آخر مزامنة</span>
                        <span>{lock.lastSync}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => {
                          setSelectedLock(lock.id)
                          setIsGenerateKeyModalOpen(true)
                        }}
                      >
                        <Key className="w-4 h-4 ml-1" />
                        إنشاء رمز
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-destructive bg-transparent"
                        onClick={() => deleteSmartLock(lock.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="keys" className="mt-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الضيف</TableHead>
                  <TableHead>الحجز</TableHead>
                  <TableHead>الرمز</TableHead>
                  <TableHead>صالح من</TableHead>
                  <TableHead>صالح حتى</TableHead>
                  <TableHead>الاستخدام</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accessKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.guestName}</TableCell>
                    <TableCell>{key.reservationId}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono bg-secondary px-2 py-1 rounded">{key.code}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCode(key.code)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{key.validFrom}</TableCell>
                    <TableCell>{key.validTo}</TableCell>
                    <TableCell>{key.usageCount} مرة</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          key.status === "active" ? "default" : key.status === "expired" ? "secondary" : "destructive"
                        }
                      >
                        {key.status === "active" ? "نشط" : key.status === "expired" ? "منتهي" : "ملغى"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {key.status === "active" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => revokeAccessKey(key.id)}
                        >
                          إلغاء
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Lock Modal */}
      <Dialog open={isAddLockModalOpen} onOpenChange={setIsAddLockModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة قفل جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>الوحدة</Label>
              <Select
                value={lockFormData.unitId}
                onValueChange={(value) => setLockFormData({ ...lockFormData, unitId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الوحدة" />
                </SelectTrigger>
                <SelectContent>
                  {units
                    .filter((u) => !smartLocks.some((l) => l.unitId === u.id))
                    .map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.number} - {unit.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>المزود</Label>
              <Select
                value={lockFormData.provider}
                onValueChange={(value: typeof lockFormData.provider) =>
                  setLockFormData({ ...lockFormData, provider: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ttlock">TTLock</SelectItem>
                  <SelectItem value="yale">Yale</SelectItem>
                  <SelectItem value="august">August</SelectItem>
                  <SelectItem value="schlage">Schlage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>معرف الجهاز</Label>
              <Input
                value={lockFormData.deviceId}
                onChange={(e) => setLockFormData({ ...lockFormData, deviceId: e.target.value })}
                placeholder="TT-001234"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddLock}>إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Key Modal */}
      <Dialog open={isGenerateKeyModalOpen} onOpenChange={setIsGenerateKeyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إنشاء رمز دخول</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>الحجز</Label>
              <Select
                value={keyFormData.reservationId}
                onValueChange={(value) => setKeyFormData({ ...keyFormData, reservationId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحجز" />
                </SelectTrigger>
                <SelectContent>
                  {reservations
                    .filter((r) => r.status === "active" || r.status === "upcoming")
                    .map((res) => (
                      <SelectItem key={res.id} value={res.id}>
                        {res.id} - {res.guest} ({res.unit})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>صالح من</Label>
                <Input
                  type="datetime-local"
                  value={keyFormData.validFrom}
                  onChange={(e) => setKeyFormData({ ...keyFormData, validFrom: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>صالح حتى</Label>
                <Input
                  type="datetime-local"
                  value={keyFormData.validTo}
                  onChange={(e) => setKeyFormData({ ...keyFormData, validTo: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateKeyModalOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleGenerateKey}>إنشاء الرمز</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
