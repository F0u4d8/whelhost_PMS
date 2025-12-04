// app/guest/bill/page.tsx
import { Suspense } from 'react';
import GuestBillContent from './guest-bill-content';

export default function GuestBillPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2">Loading bill details...</p>
        </div>
      </div>
    }>
      <GuestBillContent />
    </Suspense>
  );
}