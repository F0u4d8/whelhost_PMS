'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/main-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Printer,
  User,
  Calendar,
  CreditCard,
  Eye,
  Plus,
  Package,
  Users,
  FileText,
  CreditCard as CreditCardIcon
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

import { Reservation } from '@/lib/reservations-server-actions';

interface Booking extends Reservation {
  created_at: string;
  adults: number;
  children: number;
  source: string;
  special_requests: string;
  notes: string;
  unit: {
    id: string;
    name: string;
    floor: number;
    room_type: {
      name: string;
      base_price: number;
    };
  };
  guest: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  hotel: {
    id: string;
    name: string;
    currency: string;
  };
  payments: Payment[];
}

interface Payment {
  id: string;
  amount: number;
  method: string;
  created_at: string;
  description: string;
}

const BookingDetailPage = ({ params }: { params: { id: string } }) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handlePrint = () => {
    if (!booking) return;

    // Format dates as Hijri and Gregorian
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      // For simplicity, we'll just show the Gregorian date in the format YYYY-MM-DD
      // In a real application, you might want to convert to Hijri as well
      return date.toISOString().split('T')[0];
    };

    // Calculate nights between check-in and check-out
    const nights = Math.ceil((new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / (1000 * 60 * 60 * 24));

    const totalPaid = (booking.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0);
    const remaining = booking.total_amount - totalPaid;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title> تقرير الحجز - ${booking.id} </title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 20px;
              background: #ffffff;
              font-size: 14px;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .reservation-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .reservation-table th,
            .reservation-table td {
              border: 1px solid #d1d5db;
              padding: 10px;
              text-align: right;
            }
            .reservation-table th {
              background-color: #f3f4f6;
              font-weight: bold;
            }
            .financial-summary-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .financial-summary-table th,
            .financial-summary-table td {
              border: 1px solid #d1d5db;
              padding: 10px;
              text-align: right;
            }
            .financial-summary-table th {
              background-color: #f3f4f6;
              font-weight: bold;
            }
            .info-item {
              margin-bottom: 10px;
            }
            .label {
              font-weight: bold;
              color: #374151;
            }
            .value {
              margin-top: 4px;
              color: #1f2937;
            }
            .financial-summary {
              background-color: #f9fafb;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .financial-item {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .financial-item:last-child {
              border-bottom: none;
            }
            .financial-item.total {
              font-weight: bold;
              border-top: 2px solid #e5e7eb;
              margin-top: 8px;
              padding-top: 12px;
            }
            .reservation-header {
              text-align: center;
              font-size: 18px;
              font-weight: bold;
              margin: 15px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #d1d5db;
              padding: 10px;
              text-align: right;
            }
            th {
              background-color: #f9fafb;
              font-weight: 600;
            }
            .reservation-title {
              text-align: center;
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .unit-info {
              font-weight: bold;
              font-size: 16px;
              text-align: center;
              margin: 15px 0;
            }
            @media print {
              body { margin: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1> تقرير الحجز </h1>
            <p> رقم الحجز: ${booking.id} </p>
          </div>

          <div class="reservation-title"> تفاصيل الحجز </div>

          <div class="unit-info"> ${booking.unit.name} ${booking.unit.room_type.name} </div>

          <table class="reservation-table">
            <thead>
              <tr>
                <th>رقم الوحدة</th>
                <th>من</th>
                <th>إلى</th>
                <th>نوع الإيجار</th>
                <th>الليالي</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${booking.unit.name}</td>
                <td>${formatDate(booking.check_in)} / ${formatDate(booking.check_in)}</td>
                <td>${formatDate(booking.check_out)} / ${formatDate(booking.check_out)}</td>
                <td>يومي</td>
                <td>${nights}</td>
                <td>${booking.status === 'confirmed' ? 'مؤكد' :
                  booking.status === 'paid' ? 'مدفوع' :
                  booking.status === 'cancelled' ? 'ملغي' :
                  booking.status === 'checked_in' ? 'تم التسجيل' :
                  booking.status === 'checked_out' ? 'تم المغادرة' :
                  booking.status}
                </td>
              </tr>
            </tbody>
          </table>

          <div class="financial-summary">
            <h3>الملخص المالي</h3>
            <div class="financial-item">
              <span>الإجمالي</span>
              <span>${formatCurrency(booking.total_amount, booking.hotel.currency)}</span>
            </div>
            <div class="financial-item">
              <span>المدفوع</span>
              <span>${formatCurrency(totalPaid, booking.hotel.currency)}</span>
            </div>
            <div class="financial-item">
              <span>التأمين</span>
              <span>0.00 ${booking.hotel.currency}</span>
            </div>
            <div class="financial-item total">
              <span>المتبقي</span>
              <span>${formatCurrency(remaining, booking.hotel.currency)}</span>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  }

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        try {
          // Try the new detailed booking API first
          const response = await fetch(`/api/bookings/${params.id}`);
          if (response.ok) {
            const data = await response.json();
            const bookingData = data.data;

            // Calculate nights from check-in and check-out dates
            const checkInDate = new Date(bookingData.check_in);
            const checkOutDate = new Date(bookingData.check_out);
            const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

            // Create a booking object that matches our Reservation interface
            const formattedBooking: Booking = {
              id: bookingData.id,
              date: bookingData.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
              checkIn: bookingData.check_in,
              checkOut: bookingData.check_out,
              nights: nights,
              unit: bookingData.unit?.name || 'Unit',
              guest: `${bookingData.guest?.first_name || ''} ${bookingData.guest?.last_name || ''}`.trim() || 'Guest',
              pricePerNight: bookingData.unit?.room_type?.base_price || 0,
              total: bookingData.total_amount || 0,
              paid: bookingData.paid_amount || 0,
              balance: (bookingData.total_amount || 0) - (bookingData.paid_amount || 0),
              status: bookingData.status as any,
              channel: bookingData.source || 'direct',
              created_at: bookingData.created_at,
              adults: bookingData.adults || 1,
              children: bookingData.children || 0,
              source: bookingData.source,
              special_requests: bookingData.special_requests,
              notes: bookingData.notes,
              unit: bookingData.unit,
              guest: bookingData.guest,
              hotel: bookingData.hotel,
              payments: bookingData.payments
            };

            setBooking(formattedBooking);
            return; // early return if first API succeeds
          }
        } catch (err) {
          console.error('Error with first API call:', err);
          // Continue to try the second API if the first one fails
        }

        // If first API fails or doesn't return valid response, try the original detailed booking API
        try {
          const v1Response = await fetch(`/api/v1/bookings/${params.id}`);
          if (v1Response.ok) {
            const v1Data = await v1Response.json();
            const v1Booking = v1Data.data;

            // Calculate nights from check-in and check-out dates
            const checkInDate = new Date(v1Booking.check_in);
            const checkOutDate = new Date(v1Booking.check_out);
            const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

            // Create a booking object that matches our Reservation interface
            const formattedBooking: Booking = {
              id: v1Booking.id,
              date: v1Booking.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
              checkIn: v1Booking.check_in,
              checkOut: v1Booking.check_out,
              nights: nights,
              unit: v1Booking.unit?.name || 'Unit',
              guest: `${v1Booking.guest?.first_name || ''} ${v1Booking.guest?.last_name || ''}`.trim() || 'Guest',
              pricePerNight: v1Booking.unit?.room_type?.base_price || 0,
              total: v1Booking.total_amount || 0,
              paid: v1Booking.paid_amount || 0,
              balance: (v1Booking.total_amount || 0) - (v1Booking.paid_amount || 0),
              status: v1Booking.status as any,
              channel: v1Booking.source || 'direct',
              created_at: v1Booking.created_at,
              adults: v1Booking.adults || 1,
              children: v1Booking.children || 0,
              source: v1Booking.source,
              special_requests: v1Booking.special_requests,
              notes: v1Booking.notes,
              unit: v1Booking.unit,
              guest: v1Booking.guest,
              hotel: v1Booking.hotel,
              payments: v1Booking.payments || []
            };

            setBooking(formattedBooking);
            return; // early return if second API succeeds
          }
        } catch (err) {
          console.error('Error with second API call:', err);
        }

        // If both APIs fail, show error
        setError('Failed to fetch booking data from all sources');
        console.error('Error fetching booking: Both API calls failed');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchBooking();
    }
  }, [params.id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p>جاري تحميل تفاصيل الحجز...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !booking) {
    return (
      <MainLayout>
        <div className="p-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">خطأ! </strong>
            <span className="block sm:inline"> {error || 'لا توجد بيانات للحجز'}</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Calculate number of nights
  const checkInDate = new Date(booking.check_in);
  const checkOutDate = new Date(booking.check_out);
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate total paid and remaining
  const totalPaid = booking.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  const remainingBalance = booking.total_amount - totalPaid;

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contract/Booking Information</h1>
            <p className="text-muted-foreground">رقم الحجز: {booking.id}</p>
          </div>
          <Button className="flex items-center gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            طباعة/تحميل
          </Button>
        </div>

        {/* Property/Unit Details */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">تفاصيل العقار/الوحدة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div>
                <h3 className="font-medium text-lg mb-2">{booking.unit.name} - {booking.unit.room_type.name}</h3>
                <p className="text-muted-foreground mb-1">
                  السعر/الليلة: {formatCurrency(booking.unit.room_type.base_price, booking.hotel.currency)} / لليلة
                </p>
              </div>
              <div className="text-left">
                <Button className="flex items-center gap-2" onClick={handlePrint}>
                  <Printer className="h-4 w-4" />
                  طباعة أو تحميل
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking/Stay Period Details */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">تفاصيل فترة الحجز/الإقامة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">فترة الإقامة</p>
                <p className="font-medium">{booking.check_in} إلى {booking.check_out}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تاريخ المغادرة</p>
                <p className="font-medium">{booking.check_out}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تاريخ الوصول</p>
                <p className="font-medium">{booking.check_in}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">عدد الضيوف</p>
                <p className="font-medium">{booking.adults + (booking.children || 0)} بالغ</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">عدد الليالي</p>
                <p className="font-medium">{nights} ليلة</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الحالة</p>
                <Badge variant={booking.status === 'confirmed' ? 'default' : booking.status === 'paid' ? 'success' : booking.status === 'cancelled' ? 'destructive' : 'secondary'}>
                  {booking.status === 'confirmed' ? 'مؤكد' :
                   booking.status === 'paid' ? 'مدفوع' :
                   booking.status === 'cancelled' ? 'ملغي' :
                   booking.status === 'checked_in' ? 'تم التسجيل' :
                   booking.status === 'checked_out' ? 'تم المغادرة' :
                   booking.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial/Summary Details */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">التفاصيل المالية/الملخص</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">المبلغ الإجمالي المستحق</p>
                <p className="text-2xl font-bold">{formatCurrency(booking.total_amount, booking.hotel.currency)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">متوسط السعر الليلي</p>
                <p className="text-xl font-bold">{formatCurrency(booking.unit.room_type.base_price, booking.hotel.currency)}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button className="flex-1">
                تسجيل الوصول للضيف
              </Button>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">موعد تسجيل الوصول المجدول</p>
                <p className="font-medium">03:03 PM {booking.check_in}</p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">مغادرة مجدولة</p>
                <p className="font-medium">مغادرة مجدولة في {booking.check_out}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="invoices" className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="invoices">الفواتير</TabsTrigger>
            <TabsTrigger value="services">الخدمات</TabsTrigger>
            <TabsTrigger value="guests">الضيوف</TabsTrigger>
            <TabsTrigger value="ledger">السجل المالي</TabsTrigger>
            <TabsTrigger value="payment-links">روابط الدفع</TabsTrigger>
          </TabsList>
          <TabsContent value="invoices" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>الفواتير</CardTitle>
              </CardHeader>
              <CardContent>
                <p>لا توجد فواتير في الوقت الحالي.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="services" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>الخدمات</CardTitle>
              </CardHeader>
              <CardContent>
                <p>لا توجد خدمات في الوقت الحالي.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="guests" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>الضيوف</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-8 w-8 rounded-full bg-primary/10 p-2" />
                    <div>
                      <p className="font-medium">{booking.guest.first_name} {booking.guest.last_name}</p>
                      <p className="text-sm text-muted-foreground">{booking.guest.email}</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">الهاتف:</p>
                <p>{booking.guest.phone}</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="ledger" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>السجل المالي</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>إجراء</TableHead>
                      <TableHead>تاريخ السداد</TableHead>
                      <TableHead>البند</TableHead>
                      <TableHead>المبلغ</TableHead>
                      <TableHead>طريقة الدفع</TableHead>
                      <TableHead>من أجل</TableHead>
                      <TableHead>الرقم</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {booking.payments && booking.payments.length > 0 ? (
                      booking.payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                          <TableCell>{payment.created_at.split('T')[0]}</TableCell>
                          <TableCell>حجز</TableCell>
                          <TableCell>{formatCurrency(payment.amount, booking.hotel.currency)}</TableCell>
                          <TableCell>{payment.method}</TableCell>
                          <TableCell>إيجار وحدة {booking.unit.name}</TableCell>
                          <TableCell>{payment.id}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          لا توجد معاملات مالية
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="payment-links" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>روابط الدفع</CardTitle>
              </CardHeader>
              <CardContent>
                <p>لا توجد روابط دفع في الوقت الحالي.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button className="bg-green-600 hover:bg-green-700">
            دفع المبلغ
          </Button>
          <Button variant="outline">
            استرداد المبلغ
          </Button>
          <Button variant="outline">
            تنفيذ
          </Button>
        </div>

        {/* Left Sidebar: Booking Source and Financial Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>مصدر الحجز</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 p-2 flex items-center justify-center">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{booking.source}</p>
                    <p className="text-sm text-muted-foreground">Booking / {booking.source}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">رقم الحجز: {booking.id}</p>
                <Button variant="outline" className="mt-4">
                  إظهار جميع التفاصيل
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الملخص المالي</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">إجمالي سعر الحجز</span>
                    <span className="font-medium">{formatCurrency(booking.total_amount, booking.hotel.currency)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الخصومات/العروض</span>
                    <span className="font-medium">0.00 {booking.hotel.currency}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المجموع/الوحدات</span>
                    <span className="font-medium">{formatCurrency(booking.total_amount, booking.hotel.currency)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">إجمالي/المجموع النهائي</span>
                    <span className="font-bold">{formatCurrency(booking.total_amount, booking.hotel.currency)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المبلغ المدفوع/الوديعة</span>
                    <span className="font-medium">{formatCurrency(totalPaid, booking.hotel.currency)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الرصيد المتبقي المستحق</span>
                    <span className="font-medium text-destructive">{formatCurrency(remainingBalance, booking.hotel.currency)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الوديعة الأمنية</span>
                    <span className="font-medium">0.00 {booking.hotel.currency}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الخدمات/الإضافات</span>
                    <span className="font-medium">0.00 {booking.hotel.currency}</span>
                  </div>

                  <Button variant="outline" className="w-full mt-4">
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة خدمة/خصم
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>ملاحظات الضيف وطلبات خاصة</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{booking.special_requests || 'لا توجد طلبات خاصة'}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BookingDetailPage;