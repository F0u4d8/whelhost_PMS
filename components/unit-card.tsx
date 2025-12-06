"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, User, Calendar, Banknote, Trash2, Edit, Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { UnitStatusModal } from "@/components/modals/unit-status-modal"
import { UnitDetailsModal } from "@/components/unit-details-modal"
import { usePMSStore, type Unit } from "@/lib/store"
import { toast } from "sonner"

interface UnitCardProps {
  unit: Unit
  onEdit?: (unit: Unit) => void
  onDelete?: (id: string) => void
}

const statusConfig = {
  occupied: {
    bg: "bg-primary/10 border-primary/30",
    badge: "bg-primary/20 text-primary",
    label: "مشغول",
  },
  vacant: {
    bg: "bg-success/10 border-success/30",
    badge: "bg-success/20 text-success",
    label: "شاغر",
  },
  "out-of-service": {
    bg: "bg-destructive/10 border-destructive/30",
    badge: "bg-destructive/20 text-destructive",
    label: "خارج الخدمة",
  },
  "departure-today": {
    bg: "bg-warning/10 border-warning/30",
    badge: "bg-warning/20 text-warning",
    label: "مغادرة اليوم",
  },
  "arrival-today": {
    bg: "bg-chart-2/10 border-chart-2/30",
    badge: "bg-chart-2/20 text-chart-2",
    label: "وصول اليوم",
  },
}

export function UnitCard({ unit, onEdit, onDelete }: UnitCardProps) {
  const config = statusConfig[unit.status] || statusConfig.vacant // fallback to vacant config if status is invalid
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  const handleDelete = () => {
    if (onDelete) {
      onDelete(unit.id);
    }
  }

  return (
    <>
      <div className={cn("rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg", config.bg)}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-foreground">{unit.number}</h3>
            <p className="text-sm text-muted-foreground">{unit.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("px-3 py-1 rounded-full text-xs font-medium", config.badge)}>{config.label}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit && onEdit(unit)}>
                  <Edit className="h-4 w-4 ml-2" />
                  تعديل
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDetailsModalOpen(true)}>
                  <Eye className="h-4 w-4 ml-2" />
                  عرض التفاصيل
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusModalOpen(true)}>
                  <Calendar className="h-4 w-4 ml-2" />
                  تغيير الحالة
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 ml-2" />
                  حذف الوحدة
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Guest Info */}
        {unit.guest && (
          <div className="flex items-center gap-2 mb-3 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">{unit.guest}</span>
          </div>
        )}

        {/* Dates */}
        {(unit.checkIn || unit.checkOut) && (
          <div className="flex items-center gap-2 mb-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {unit.checkIn} - {unit.checkOut}
            </span>
          </div>
        )}

        {/* Balance */}
        {unit.balance !== undefined && (
          <div className="flex items-center gap-2 mb-4 text-sm">
            <Banknote className="h-4 w-4 text-muted-foreground" />
            <span className={cn("font-medium", unit.balance > 0 ? "text-destructive" : "text-success")}>
              {unit.balance > 0 ? `متبقي: ${unit.balance} ر.س` : "مدفوع بالكامل"}
            </span>
          </div>
        )}

        {/* Action Button */}
        <Button
          variant="outline"
          className="w-full rounded-xl bg-transparent"
          size="sm"
          onClick={() => setDetailsModalOpen(true)}
        >
          عرض التفاصيل
        </Button>
      </div>

      <UnitStatusModal open={statusModalOpen} onOpenChange={setStatusModalOpen} unit={unit} />
      <UnitDetailsModal unit={unit} open={detailsModalOpen} onOpenChange={setDetailsModalOpen} />
    </>
  )
}
