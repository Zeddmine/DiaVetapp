import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Activity,
  TrendingUp,
  Calendar,
  Filter,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Download,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Stethoscope,
  Syringe,
  Scissors,
  Flame
} from 'lucide-react';
import { Language } from '../types';

interface VetVisitsChartProps {
  currentLang: Language;
  wilaya?: string;
  clinicName?: string;
}

// Monthly visits data for Algerian veterinary practice (2025 vs 2026)
const MONTHLY_VISITS_DATA = {
  fr: [
    { month: 'Jan', visits: 98, lastYear: 82, vaccines: 28, general: 42, surgery: 16, emergency: 12, revenue: 343000 },
    { month: 'Fév', visits: 105, lastYear: 88, vaccines: 32, general: 45, surgery: 18, emergency: 10, revenue: 367500 },
    { month: 'Mar', visits: 124, lastYear: 99, vaccines: 40, general: 51, surgery: 21, emergency: 12, revenue: 434000 },
    { month: 'Avr', visits: 142, lastYear: 115, vaccines: 48, general: 56, surgery: 24, emergency: 14, revenue: 497000 },
    { month: 'Mai', visits: 165, lastYear: 132, vaccines: 58, general: 63, surgery: 26, emergency: 18, revenue: 577500 },
    { month: 'Juin', visits: 158, lastYear: 128, vaccines: 52, general: 60, surgery: 28, emergency: 18, revenue: 553000 },
    { month: 'Juil', visits: 146, lastYear: 120, vaccines: 44, general: 58, surgery: 22, emergency: 22, revenue: 511000 },
    { month: 'Août', visits: 135, lastYear: 110, vaccines: 38, general: 54, surgery: 20, emergency: 23, revenue: 472500 },
    { month: 'Sep', visits: 152, lastYear: 125, vaccines: 50, general: 61, surgery: 25, emergency: 16, revenue: 532000 },
    { month: 'Oct', visits: 138, lastYear: 112, vaccines: 42, general: 57, surgery: 24, emergency: 15, revenue: 483000 },
    { month: 'Nov', visits: 118, lastYear: 96, vaccines: 34, general: 50, surgery: 21, emergency: 13, revenue: 413000 },
    { month: 'Déc', visits: 128, lastYear: 104, vaccines: 39, general: 53, surgery: 23, emergency: 13, revenue: 448000 },
  ],
  en: [
    { month: 'Jan', visits: 98, lastYear: 82, vaccines: 28, general: 42, surgery: 16, emergency: 12, revenue: 343000 },
    { month: 'Feb', visits: 105, lastYear: 88, vaccines: 32, general: 45, surgery: 18, emergency: 10, revenue: 367500 },
    { month: 'Mar', visits: 124, lastYear: 99, vaccines: 40, general: 51, surgery: 21, emergency: 12, revenue: 434000 },
    { month: 'Apr', visits: 142, lastYear: 115, vaccines: 48, general: 56, surgery: 24, emergency: 14, revenue: 497000 },
    { month: 'May', visits: 165, lastYear: 132, vaccines: 58, general: 63, surgery: 26, emergency: 18, revenue: 577500 },
    { month: 'Jun', visits: 158, lastYear: 128, vaccines: 52, general: 60, surgery: 28, emergency: 18, revenue: 553000 },
    { month: 'Jul', visits: 146, lastYear: 120, vaccines: 44, general: 58, surgery: 22, emergency: 22, revenue: 511000 },
    { month: 'Aug', visits: 135, lastYear: 110, vaccines: 38, general: 54, surgery: 20, emergency: 23, revenue: 472500 },
    { month: 'Sep', visits: 152, lastYear: 125, vaccines: 50, general: 61, surgery: 25, emergency: 16, revenue: 532000 },
    { month: 'Oct', visits: 138, lastYear: 112, vaccines: 42, general: 57, surgery: 24, emergency: 15, revenue: 483000 },
    { month: 'Nov', visits: 118, lastYear: 96, vaccines: 34, general: 50, surgery: 21, emergency: 13, revenue: 413000 },
    { month: 'Dec', visits: 128, lastYear: 104, vaccines: 39, general: 53, surgery: 23, emergency: 13, revenue: 448000 },
  ],
  ar: [
    { month: 'جانفي', visits: 98, lastYear: 82, vaccines: 28, general: 42, surgery: 16, emergency: 12, revenue: 343000 },
    { month: 'فيفري', visits: 105, lastYear: 88, vaccines: 32, general: 45, surgery: 18, emergency: 10, revenue: 367500 },
    { month: 'مارس', visits: 124, lastYear: 99, vaccines: 40, general: 51, surgery: 21, emergency: 12, revenue: 434000 },
    { month: 'أفريل', visits: 142, lastYear: 115, vaccines: 48, general: 56, surgery: 24, emergency: 14, revenue: 497000 },
    { month: 'ماي', visits: 165, lastYear: 132, vaccines: 58, general: 63, surgery: 26, emergency: 18, revenue: 577500 },
    { month: 'جوان', visits: 158, lastYear: 128, vaccines: 52, general: 60, surgery: 28, emergency: 18, revenue: 553000 },
    { month: 'جويلية', visits: 146, lastYear: 120, vaccines: 44, general: 58, surgery: 22, emergency: 22, revenue: 511000 },
    { month: 'أوت', visits: 135, lastYear: 110, vaccines: 38, general: 54, surgery: 20, emergency: 23, revenue: 472500 },
    { month: 'سبتمبر', visits: 152, lastYear: 125, vaccines: 50, general: 61, surgery: 25, emergency: 16, revenue: 532000 },
    { month: 'أكتوبر', visits: 138, lastYear: 112, vaccines: 42, general: 57, surgery: 24, emergency: 15, revenue: 483000 },
    { month: 'نوفمبر', visits: 118, lastYear: 96, vaccines: 34, general: 50, surgery: 21, emergency: 13, revenue: 413000 },
    { month: 'ديسمبر', visits: 128, lastYear: 104, vaccines: 39, general: 53, surgery: 23, emergency: 13, revenue: 448000 },
  ]
};

// Distribution by clinical category
const CATEGORY_DISTRIBUTION = [
  { nameFr: 'Consultations Générales', nameEn: 'General Checkups', nameAr: 'فحوصات عامة', value: 650, color: '#06b6d4', icon: Stethoscope },
  { nameFr: 'Vaccinations & Rappels', nameEn: 'Vaccinations & Boosters', nameAr: 'تلقيحات وتطعيمات', value: 490, color: '#10b981', icon: Syringe },
  { nameFr: 'Chirurgies & Stérilisations', nameEn: 'Surgeries & Spaying', nameAr: 'جراحة وتعقيم', value: 270, color: '#8b5cf6', icon: Scissors },
  { nameFr: 'Urgences & Soins Intensifs', nameEn: 'Emergencies & ICU', nameAr: 'طوارئ وعناية مركزة', value: 180, color: '#f43f5e', icon: Flame },
];

// Distribution by Species
const SPECIES_DISTRIBUTION = [
  { nameFr: 'Chats & Félins', nameEn: 'Cats & Felines', nameAr: 'قطط', value: 685, percentage: '43%', color: '#06b6d4' },
  { nameFr: 'Chiens & Canidés', nameEn: 'Dogs & Canines', nameAr: 'كلاب', value: 720, percentage: '45%', color: '#10b981' },
  { nameFr: 'NAC, Oiseaux & Autres', nameEn: 'Exotics, Birds & Others', nameAr: 'طيور وحيوانات خاصة', value: 185, percentage: '12%', color: '#f59e0b' },
];

export default function VetVisitsChart({
  currentLang = 'fr',
  wilaya = '16 - Alger',
  clinicName = 'Cabinet Vétérinaire El Biar'
}: VetVisitsChartProps) {
  const isRtl = currentLang === 'ar';
  const isEn = currentLang === 'en';

  const [chartType, setChartType] = useState<'bar' | 'area' | 'breakdown'>('bar');
  const [timeRange, setTimeRange] = useState<'12m' | '6m'>('12m');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const rawData = MONTHLY_VISITS_DATA[currentLang] || MONTHLY_VISITS_DATA.fr;
  const filteredData = timeRange === '6m' ? rawData.slice(6) : rawData;

  // Aggregate Metrics
  const totalVisitsYear = filteredData.reduce((acc, d) => acc + d.visits, 0);
  const totalLastYear = filteredData.reduce((acc, d) => acc + d.lastYear, 0);
  const averageMonthlyVisits = Math.round(totalVisitsYear / filteredData.length);
  const growthRate = Math.round(((totalVisitsYear - totalLastYear) / totalLastYear) * 100);
  const peakMonth = [...filteredData].sort((a, b) => b.visits - a.visits)[0];
  const totalRevenueDzd = filteredData.reduce((acc, d) => acc + d.revenue, 0);

  const handleExportReport = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-2xl bg-slate-950/95 border border-cyan-500/40 p-3.5 shadow-2xl backdrop-blur-xl text-xs space-y-1.5 min-w-[190px]">
          <div className="font-black text-sm text-cyan-300 border-b border-white/10 pb-1 flex items-center justify-between">
            <span>{label} 2026</span>
            <span className="text-[10px] text-slate-400 font-mono">
              {isRtl ? 'إحصائيات العيادة' : isEn ? 'Clinic Stats' : 'Stats Cabinet'}
            </span>
          </div>

          <div className="space-y-1 pt-1">
            {payload.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between gap-3 text-slate-200">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300">{item.name} :</span>
                </span>
                <span className="font-mono font-black text-white">
                  {item.value} {isRtl ? 'زيارة' : isEn ? 'visits' : 'visites'}
                </span>
              </div>
            ))}
          </div>

          {payload[0] && payload[0].payload && payload[0].payload.revenue && (
            <div className="pt-2 mt-1 border-t border-white/10 flex items-center justify-between text-[11px]">
              <span className="text-emerald-400 font-bold">{isRtl ? 'الإيرادات :' : isEn ? 'Estimated Revenue:' : 'Honoraires estimés :'}</span>
              <span className="font-mono font-black text-emerald-300">
                {payload[0].payload.revenue.toLocaleString()} DZD
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-6 ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Header with Title and Control Toggles */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-950/80 border border-white/10 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>
                {isRtl
                  ? 'لوحة تحليل الزيارات السريرية الشهرية'
                  : isEn
                  ? 'Monthly Clinical Visits Analytics Dashboard'
                  : 'Tableau de Bord des Visites Cliniques Mensuelles'}
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono font-black uppercase">
                Recharts Live
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            {isRtl
              ? `متابعة دقيقة لنشاط ${clinicName} (${wilaya}) وتوزيع الحالات السريرية على مدار العام.`
              : isEn
              ? `Real-time activity tracking for ${clinicName} (${wilaya}) with seasonal clinical trends.`
              : `Suivi détaillé de l'activité du ${clinicName} (${wilaya}) avec tendances saisonnières et répartition des soins.`}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 bg-slate-900 border border-white/10 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setTimeRange('12m')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === '12m'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isRtl ? '12 شهراً' : isEn ? '12 Months' : '12 Mois'}
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('6m')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === '6m'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isRtl ? '6 أشهر الأخيرة' : isEn ? 'Last 6 Months' : '6 Derniers Mois'}
            </button>
          </div>

          {/* Chart View Selector */}
          <div className="flex items-center gap-1 bg-slate-900 border border-white/10 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setChartType('bar')}
              title={isRtl ? 'مخطط الأعمدة المقارن' : isEn ? 'Bar Chart Comparison' : 'Histogramme comparatif'}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                chartType === 'bar'
                  ? 'bg-cyan-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">{isRtl ? 'أعمدة' : isEn ? 'Bars' : 'Barres'}</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('area')}
              title={isRtl ? 'مخطط المنحنى التراكمي' : isEn ? 'Area Trend' : 'Courbe de tendance'}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                chartType === 'area'
                  ? 'bg-cyan-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LineChartIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{isRtl ? 'منحنى' : isEn ? 'Trend' : 'Courbe'}</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('breakdown')}
              title={isRtl ? 'توزيع الفئات الطبية' : isEn ? 'Category Breakdown' : 'Répartition'}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                chartType === 'breakdown'
                  ? 'bg-cyan-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PieChartIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{isRtl ? 'الفئات' : isEn ? 'Categories' : 'Pôles'}</span>
            </button>
          </div>

          {/* Export Report Button */}
          <button
            type="button"
            onClick={handleExportReport}
            className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">{isRtl ? 'تم التصدير' : isEn ? 'Exported' : 'Exporté'}</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>{isRtl ? 'تصدير PDF / Excel' : isEn ? 'Export Report' : 'Rapport Cabinet'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Visits */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/80 border border-white/10 backdrop-blur-xl relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>{isRtl ? 'إجمالي الزيارات' : isEn ? 'Total Consultations' : 'Total Consultations'}</span>
            <span className="p-1 rounded-lg bg-cyan-500/15 text-cyan-400">
              <Stethoscope className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {totalVisitsYear.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{growthRate}% {isRtl ? 'مقارنة بالسنة الماضية' : isEn ? 'vs last year' : 'vs N-1'}</span>
          </div>
        </div>

        {/* Card 2: Monthly Average */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/80 border border-white/10 backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>{isRtl ? 'المعدل الشهري' : isEn ? 'Monthly Average' : 'Moyenne Mensuelle'}</span>
            <span className="p-1 rounded-lg bg-emerald-500/15 text-emerald-400">
              <Calendar className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {averageMonthlyVisits}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {isRtl ? `~ ${(averageMonthlyVisits / 26).toFixed(1)} زيارة / يوم عمل` : isEn ? `~ ${(averageMonthlyVisits / 26).toFixed(1)} visits / working day` : `~ ${(averageMonthlyVisits / 26).toFixed(1)} consultations / jour`}
          </p>
        </div>

        {/* Card 3: Peak Month */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/80 border border-white/10 backdrop-blur-xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>{isRtl ? 'ذروة النشاط' : isEn ? 'Peak Month' : 'Mois le Plus Actif'}</span>
            <span className="p-1 rounded-lg bg-amber-500/15 text-amber-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
            {peakMonth?.month} ({peakMonth?.visits})
          </div>
          <p className="text-[11px] text-amber-400/90 mt-2">
            {isRtl ? 'حملة التلقيح ومضادات الطفيليات' : isEn ? 'Spring Rabies & Parasite Surge' : 'Campagne vaccins & antiparasitaires'}
          </p>
        </div>

        {/* Card 4: Estimated Gross Revenue */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/80 border border-white/10 backdrop-blur-xl relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>{isRtl ? 'الإيرادات الإجمالية (DZD)' : isEn ? 'Total Gross Billing' : 'Recettes Estimées'}</span>
            <span className="p-1 rounded-lg bg-purple-500/15 text-purple-400">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-300 font-mono">
            {(totalRevenueDzd / 1000).toFixed(0)}k DZD
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {isRtl ? 'متوسط 3,500 دج / استشارة' : isEn ? 'Avg 3,500 DZD / exam' : 'Moyenne 3,500 DZD / acte'}
          </p>
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="p-5 sm:p-7 rounded-3xl bg-slate-950/80 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h4 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>
                {chartType === 'bar'
                  ? (isRtl ? 'مقارنة الزيارات الشهرية (2026 مقابل 2025)' : isEn ? 'Monthly Visits Comparison (2026 vs 2025)' : 'Comparatif des Visites Mensuelles (2026 vs 2025)')
                  : chartType === 'area'
                  ? (isRtl ? 'منحنى تطور وتدفق الاستشارات السريرية' : isEn ? 'Clinical Consultations Inflow & Trend' : 'Évolution et Flux des Consultations Cliniques')
                  : (isRtl ? 'التوزيع التراكمي حسب نوع التدخل الطبي' : isEn ? 'Breakdown by Medical Intervention Type' : 'Répartition Détaillée par Pôle de Soins')}
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRtl
                ? 'بيانات دقيقة ومحدثة تمكن من التنبؤ باحتياجات المخزون وجدولة المواعيد.'
                : isEn
                ? 'Accurate practice management metrics to optimize drug stock and staff scheduling.'
                : 'Données exploitables pour anticiper les stocks de vaccins et le dimensionnement de la clinique.'}
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeCategory === 'all'
                  ? 'bg-slate-800 text-cyan-300 border border-cyan-400/40'
                  : 'text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              {isRtl ? 'الكل' : isEn ? 'All Visits' : 'Toutes'}
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('vaccines')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeCategory === 'vaccines'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                  : 'text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              {isRtl ? 'تلقيحات' : isEn ? 'Vaccines' : 'Vaccins'}
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('general')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeCategory === 'general'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                  : 'text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              {isRtl ? 'فحوصات' : isEn ? 'General' : 'Général'}
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('surgery')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeCategory === 'surgery'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40'
                  : 'text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              {isRtl ? 'جراحة' : isEn ? 'Surgery' : 'Chirurgie'}
            </button>
          </div>
        </div>

        {/* Recharts Chart Area */}
        <div className="w-full h-[320px] sm:h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient2026" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity={0.7} />
                  </linearGradient>
                  <linearGradient id="barGradient2025" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#64748b" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="#334155" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="barGradientVaccines" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#047857" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }}
                />
                {activeCategory === 'all' && (
                  <>
                    <Bar
                      dataKey="visits"
                      name={isRtl ? 'زيارات 2026 (الحالية)' : isEn ? 'Visits 2026 (Current)' : 'Visites 2026 (En cours)'}
                      fill="url(#barGradient2026)"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="lastYear"
                      name={isRtl ? 'زيارات 2025 (السابقة)' : isEn ? 'Visits 2025 (Previous)' : 'Visites 2025 (N-1)'}
                      fill="url(#barGradient2025)"
                      radius={[6, 6, 0, 0]}
                    />
                  </>
                )}
                {activeCategory === 'vaccines' && (
                  <Bar
                    dataKey="vaccines"
                    name={isRtl ? 'تلقيحات وتطعيمات' : isEn ? 'Vaccinations & Boosters' : 'Vaccinations & Rappels'}
                    fill="url(#barGradientVaccines)"
                    radius={[6, 6, 0, 0]}
                  />
                )}
                {activeCategory === 'general' && (
                  <Bar
                    dataKey="general"
                    name={isRtl ? 'فحوصات طبية عامة' : isEn ? 'General Checkups' : 'Consultations Générales'}
                    fill="#06b6d4"
                    radius={[6, 6, 0, 0]}
                  />
                )}
                {activeCategory === 'surgery' && (
                  <Bar
                    dataKey="surgery"
                    name={isRtl ? 'عمليات جراحية وتعقيم' : isEn ? 'Surgeries & Spaying' : 'Chirurgies & Stérilisations'}
                    fill="#8b5cf6"
                    radius={[6, 6, 0, 0]}
                  />
                )}
              </BarChart>
            ) : chartType === 'area' ? (
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradientVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="areaGradientVaccines" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                <Area
                  type="monotone"
                  dataKey="visits"
                  name={isRtl ? 'إجمالي الاستشارات' : isEn ? 'Total Consultations' : 'Total Consultations'}
                  stroke="#06b6d4"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#areaGradientVisits)"
                />
                <Area
                  type="monotone"
                  dataKey="vaccines"
                  name={isRtl ? 'تلقيحات وقائية' : isEn ? 'Preventive Vaccines' : 'Vaccinations'}
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#areaGradientVaccines)"
                />
              </AreaChart>
            ) : (
              <BarChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="general" stackId="a" name={isRtl ? 'فحوصات عامة' : isEn ? 'General' : 'Général'} fill="#06b6d4" />
                <Bar dataKey="vaccines" stackId="a" name={isRtl ? 'تلقيحات' : isEn ? 'Vaccines' : 'Vaccins'} fill="#10b981" />
                <Bar dataKey="surgery" stackId="a" name={isRtl ? 'جراحة' : isEn ? 'Surgery' : 'Chirurgie'} fill="#8b5cf6" />
                <Bar dataKey="emergency" stackId="a" name={isRtl ? 'طوارئ' : isEn ? 'Emergencies' : 'Urgences'} fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdown Details & Algerian Practice Insights (2 Columns) */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Left Column: Breakdown by Clinical Domain & Species */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-950/80 border border-white/10 backdrop-blur-xl space-y-4">
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>{isRtl ? 'توزيع الاستشارات حسب التخصص السريري' : isEn ? 'Breakdown by Clinical Specialty' : 'Répartition par Pôle de Soins'}</span>
              <span className="text-cyan-400 font-mono text-xs">{totalVisitsYear} {isRtl ? 'حالة' : isEn ? 'cases' : 'actes'}</span>
            </h4>

            <div className="space-y-3">
              {CATEGORY_DISTRIBUTION.map((cat, idx) => {
                const IconComponent = cat.icon;
                const percentage = Math.round((cat.value / 1590) * 100);
                const title = isRtl ? cat.nameAr : isEn ? cat.nameEn : cat.nameFr;

                return (
                  <div key={idx} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-white">{title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400">{cat.value} {isRtl ? 'زيارة' : isEn ? 'visits' : 'visites'}</span>
                        <span className="font-mono font-black text-white px-2 py-0.5 rounded-md text-[11px]" style={{ backgroundColor: `${cat.color}30`, color: cat.color }}>
                          {percentage}%
                        </span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Species Distribution */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-950/80 border border-white/10 backdrop-blur-xl">
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-300 mb-4">
              {isRtl ? 'توزيع المرضى حسب نوع الحيوان' : isEn ? 'Patient Distribution by Animal Species' : 'Répartition des Patients par Espèce'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SPECIES_DISTRIBUTION.map((sp, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-1">
                  <div className="text-xs font-bold text-slate-300">
                    {isRtl ? sp.nameAr : isEn ? sp.nameEn : sp.nameFr}
                  </div>
                  <div className="text-xl font-black font-mono" style={{ color: sp.color }}>
                    {sp.percentage}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {sp.value} {isRtl ? 'مريض' : isEn ? 'patients' : 'patients'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI & Clinical Management Recommendations */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 border border-cyan-500/30 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-wider text-cyan-300">
                {isRtl ? 'توصيات ذكية لإدارة العيادة' : isEn ? 'Practice Management Recommendations' : 'Recommandations de Gestion du Cabinet'}
              </h4>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-slate-300 space-y-1">
                <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'استباق مخزون لقاحات الربيع' : isEn ? 'Spring Vaccine Stock Planning' : 'Anticipation des stocks de vaccins'}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {isRtl
                    ? 'ذروة التلقيح ضد داء الكلب وCHPPiL تحدث بين أفريل وجوان (+38%). يُنصح بتأمين 120 جرعة إضافية مسبقاً.'
                    : isEn
                    ? 'Rabies & CHPPiL demand surges by +38% between April and June. Recommend pre-ordering 120 booster vials.'
                    : 'Le pic de vaccination antirabique et CHPPiL a lieu entre avril et juin (+38%). Il est recommandé de commander 120 doses d’avance.'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-slate-300 space-y-1">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'تحسين مواعيد السبت والثلاثاء' : isEn ? 'Peak Days Optimization' : 'Optimisation des créneaux de pointe'}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {isRtl
                    ? 'يمثل يوما السبت والثلاثاء 44% من حجم الفحوصات الإجمالي. تفعيل الحجز الإلكتروني يقلل وقت الانتظار بـ 25 دقيقة.'
                    : isEn
                    ? 'Saturdays and Tuesdays account for 44% of weekly visits. Enabling DiaVet online scheduling cuts in-clinic wait times by 25 mins.'
                    : 'Le samedi et mardi concentrent 44% de l’affluence. La prise de rendez-vous en ligne DiaVet réduit l’attente moyenne de 25 minutes.'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-slate-300 space-y-1">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'حملة التذكير التلقائي SMS' : isEn ? 'Automated SMS Booster Recall' : 'Rappels automatiques de rappel'}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {isRtl
                    ? 'معدل عودة المربين للمتابعة ارتفع إلى 86% بفضل التنبيهات المباشرة عبر المنصة.'
                    : isEn
                    ? 'Patient retention rate reaches 86% with automated DiaVet SMS & WhatsApp reminders in Algeria.'
                    : 'Le taux de retour des propriétaires pour les rappels atteint 86% grâce aux SMS automatiques DiaVet.'}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
