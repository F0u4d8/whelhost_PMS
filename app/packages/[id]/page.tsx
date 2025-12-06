import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

export default function PackageDetailPage({ params }: { params: { id: string } }) {
  const packageId = parseInt(params.id);
  
  // Package data
  const packages = {
    1: {
      id: 1,
      name: 'ال gói الأساسي',
      price: 99,
      period: 'شهر',
      features: [
        'وصول إلى لوحة التحكم الأساسية',
        'إدارة حتى 10 وحدات',
        'تقارير شهرية محدودة',
        'دعم عبر البريد الإلكتروني',
        'تحديثات منتظمة',
        'نظام مراقبة الحجوزات',
        'نظام المدفوعات الأساسي'
      ],
      description: 'الخطة المثالية للمبتدئين في إدارة الفنادق'
    },
    2: {
      id: 2,
      name: 'ال gói الاحترافي',
      price: 199,
      period: 'شهر',
      features: [
        'وصول كامل إلى جميع الميزات',
        'إدارة حتى 50 وحدة',
        'تقارير متقدمة وتحليلات',
        'دعم عبر البريد الإلكتروني والهاتف',
        'تحديثات منتظمة',
        'تخصيص واجهة المستخدم',
        'نظام متكامل لإدارة الضيوف',
        'نظام المدفوعات المتقدمة',
        'تقرير الأداء اليومي'
      ],
      description: 'الخطة المثالية للمشاريع المتوسطة والكبرى'
    },
    3: {
      id: 3,
      name: 'ال gói الممتاز',
      price: 299,
      period: 'شهر',
      features: [
        'كل ميزات gói الاحترافي',
        'إدارة وحدات غير محدودة',
        'تقارير مخصصة',
        'دعم مخصص 24/7',
        'تكامل مع أنظمة طرف ثالث',
        'تقرير مخصص وتحليلات عميقة',
        'نظام تحليلات متقدم',
        'نظام تكامل API',
        'تخصيص كامل للنظام',
        'استشارات متخصصة'
      ],
      description: 'الخطة المثالية للمشاريع الكبيرة وال corporates'
    }
  };

  const pkg = packages[packageId as keyof typeof packages];

  if (!pkg) {
    return (
      <div className="min-h-screen bg-[#1E2228] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#EBEAE6] mb-4">الحزمة غير موجودة</h1>
          <Link href="/packages">
            <Button variant="outline" className="text-[#EBEAE6] border-[#494C4F] hover:bg-[#494C4F]">
              العودة إلى الحزم
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E2228] py-16">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl font-medium tracking-tight text-[#EBEAE6] mb-4">
            {pkg.name}
          </h1>
          <p className="text-xl text-[#494C4F] mb-2">
            <span className="text-4xl font-bold text-[#EBEAE6]">{pkg.price}</span>
            <span className="text-[#494C4F]"> ر.س</span>
            <span className="text-base"> / {pkg.period}</span>
          </p>
          <p className="text-[#494C4F] max-w-2xl mx-auto">
            {pkg.description}
          </p>
        </div>

        <div className="bg-[#1E2228]/70 rounded-2xl border border-[#494C4F] p-8 mb-12">
          <h2 className="text-2xl font-bold text-[#EBEAE6] mb-6 text-center">المميزات</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pkg.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <Check className="text-green-500 h-5 w-5 ml-3 flex-shrink-0" />
                <span className="text-[#EBEAE6]">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center">
          <Link href={`/checkout?package=${pkg.id}`}>
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-[#1E2228] px-8 py-6 text-lg">
              <span>الإشتراك الآن</span>
              <ArrowRight className="w-5 h-5 mr-2" />
            </Button>
          </Link>
          <p className="text-[#494C4F] mt-4">
            ابدأ تجربتك المجانية لمدة 14 يومًا بدون الحاجة إلى بطاقة ائتمان
          </p>
        </div>
      </div>
    </div>
  );
}