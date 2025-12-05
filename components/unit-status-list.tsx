import { cn } from "@/lib/utils"

interface UnitStatus {
  id: string
  number: string
  status: "occupied" | "vacant" | "reserved" | "maintenance"
  guest?: string
}

const statusStyles = {
  occupied: {
    bg: "bg-primary/20",
    text: "text-primary",
    label: "مشغول",
  },
  vacant: {
    bg: "bg-success/20",
    text: "text-success",
    label: "شاغر",
  },
  reserved: {
    bg: "bg-warning/20",
    text: "text-warning",
    label: "محجوز",
  },
  maintenance: {
    bg: "bg-destructive/20",
    text: "text-destructive",
    label: "صيانة",
  },
}

interface UnitStatusListProps {
  units: UnitStatus[]
}

export function UnitStatusList({ units }: UnitStatusListProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
      {units.map((unit) => {
        const style = statusStyles[unit.status] || statusStyles.vacant; // Default to vacant style if status not found
        return (
          <div
            key={unit.id}
            className={cn(
              "rounded-xl p-3 text-center transition-all duration-200 hover:scale-105 cursor-pointer",
              style.bg,
            )}
          >
            <p className={cn("text-lg font-bold", style.text)}>{unit.number}</p>
            <p className="text-xs text-muted-foreground mt-1">{style.label}</p>
          </div>
        )
      })}
    </div>
  )
}
