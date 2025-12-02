'use client'

import { SmartLockDialog as ClientSmartLockDialog } from '@/components/dashboard/smart-lock-dialog';
import type { SmartLock, Unit } from '@/lib/types';

interface SmartLockDialogWrapperProps {
  hotelId: string;
  units: Pick<Unit, 'id' | 'name'>[];
  smartLock?: SmartLock;
}

export function SmartLockDialogWrapper({ hotelId, units, smartLock }: SmartLockDialogWrapperProps) {
  return <ClientSmartLockDialog hotelId={hotelId} units={units} smartLock={smartLock} />;
}

// This is just a trigger button wrapper if needed
export function SmartLockDialogTrigger({ children, hotelId, units }: { 
  children: React.ReactNode; 
  hotelId: string;
  units: Pick<Unit, 'id' | 'name'>[];
}) {
  return <ClientSmartLockDialog trigger={children} hotelId={hotelId} units={units} />;
}