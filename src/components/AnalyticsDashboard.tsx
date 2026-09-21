import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Language } from '../types';
import { 
  TrendingUp, 
  Calendar, 
  Activity, 
  Sparkles, 
  Download, 
  CheckCircle2, 
  Filter, 
  Syringe, 
  Stethoscope, 
  Scissors, 
  Flame,
  BarChart3,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface AnalyticsDashboardProps {
  currentLang: Language;
  wilaya?: string;
  clinicName?: string;
}

export interface MonthlyStat {
  month: string;
  monthKey: string;
  monthIndex: number;
  visits: number;
  lastYear: number;
  vaccines: number;
  general: number;
  surgery: number;
  emergency: number;
  revenue: number; // in DZD
}

export const MONTHLY_ANALYTICS_DATA: Record<Language, MonthlyStat[]> = {
  fr: [
    { month: 'Jan', monthKey: 'Janvier', monthIndex: 0, visits: 98, lastYear: 82, vaccines: 28, general: 42, surgery: 16, emergency: 12, revenue: 343000 },
    { month: 'Fév', monthKey: 'Février', monthIndex: 1, visits: 105, lastYear: 88, vaccines: 32, general: 45, surgery: 18, emergency: 10, revenue: 367500 },
    { month: 'Mar', monthKey: 'Mars', monthIndex: 2, visits: 124, lastYear: 99, vaccines: 40, general: 51, surgery: 21, emergency: 12, revenue: 434000 },
    { month: 'Avr', monthKey: 'Avril', monthIndex: 3, visits: 142, lastYear: 115, vaccines: 48, general: 56, surgery: 24, emergency: 14, revenue: 497000 },
    { month: 'Mai', monthKey: 'Mai', monthIndex: 4, visits: 165, lastYear: 132, vaccines: 58, general: 63, surgery: 26, emergency: 18, revenue: 577500 },
    { month: 'Juin', monthKey: 'Juin', monthIndex: 5, visits: 158, lastYear: 128, vaccines: 52, general: 60, surgery: 28, emergency: 18, revenue: 553000 },
    { month: 'Juil', monthKey: 'Juillet', monthIndex: 6, visits: 146, lastYear: 120, vaccines: 44, general: 58, surgery: 22, emergency: 22, revenue: 511000 },
    { month: 'Août', monthKey: 'Août', monthIndex: 7, visits: 135, lastYear: 110, vaccines: 38, general: 54, surgery: 20, emergency: 23, revenue: 472500 },
    { month: 'Sep', monthKey: 'Septembre', monthIndex: 8, visits: 152, lastYear: 125, vaccines: 50, general: 61, surgery: 25, emergency: 16, revenue: 532000 },
    { month: 'Oct', monthKey: 'Octobre', monthIndex: 9, visits: 138, lastYear: 112, vaccines: 42, general: 57, surgery: 24, emergency: 15, revenue: 483000 },
    { month: 'Nov', monthKey: 'Novembre', monthIndex: 10, visits: 118, lastYear: 96, vaccines: 34, general: 50, surgery: 21, emergency: 13, revenue: 413000 },
    { month: 'Déc', monthKey: 'Décembre', monthIndex: 11, visits: 128, lastYear: 104, vaccines: 39, general: 53, surgery: 23, emergency: 13, revenue: 448000 },
  ],
  en: [
    { month: 'Jan', monthKey: 'January', monthIndex: 0, visits: 98, lastYear: 82, vaccines: 28, general: 42, surgery: 16, emergency: 12, revenue: 343000 },
    { month: 'Feb', monthKey: 'February', monthIndex: 1, visits: 105, lastYear: 88, vaccines: 32, general: 45, surgery: 18, emergency: 10, revenue: 367500 },
    { month: 'Mar', monthKey: 'March', monthIndex: 2, visits: 124, lastYear: 99, vaccines: 40, general: 51, surgery: 21, emergency: 12, revenue: 434000 },
    { month: 'Apr', monthKey: 'April', monthIndex: 3, visits: 142, lastYear: 115, vaccines: 48, general: 56, surgery: 24, emergency: 14, revenue: 497000 },
    { month: 'May', monthKey: 'May', monthIndex: 4, visits: 165, lastYear: 132, vaccines: 58, general: 63, surgery: 26, emergency: 18, revenue: 577500 },
    { month: 'Jun', monthKey: 'June', monthIndex: 5, visits: 158, lastYear: 128, vaccines: 52, general: 60, surgery: 28, emergency: 18, revenue: 553000 },
    { month: 'Jul', monthKey: 'July', monthIndex: 6, visits: 146, lastYear: 120, vaccines: 44, general: 58, surgery: 22, emergency: 22, revenue: 511000 },
    { month: 'Aug', monthKey: 'August', monthIndex: 7, visits: 135, lastYear: 110, vaccines: 38, general: 54, surgery: 20, emergency: 23, revenue: 472500 },
    { month: 'Sep', monthKey: 'September', monthIndex: 8, visits: 152, lastYear: 125, vaccines: 50, general: 61, surgery: 25, emergency: 16, revenue: 532000 },
    { month: 'Oct', monthKey: 'October', monthIndex: 9, visits: 138, lastYear: 112, vaccines: 42, general: 57, surgery: 24, emergency: 15, revenue: 483000 },
    { month: 'Nov', monthKey: 'November', monthIndex: 10, visits: 118, lastYear: 96, vaccines: 34, general: 50, surgery: 21, emergency: 13, revenue: 413000 },
    { month: 'Dec', monthKey: 'December', monthIndex: 11, visits: 128, lastYear: 104, vaccines: 39, general: 53, surgery: 23, emergency: 13, revenue: 448000 },
  ],
  ar: [
    { month: 'جانفي', monthKey: 'جانفي', monthIndex: 0, visits: 98, lastYear: 82, vaccines: 28, general: 42, surgery: 16, emergency: 12, revenue: 343000 },
    { month: 'فيفري', monthKey: 'فيفري', monthIndex: 1, visits: 105, lastYear: 88, vaccines: 32, general: 45, surgery: 18, emergency: 10, revenue: 367500 },
    { month: 'مارس', monthKey: 'مارس', monthIndex: 2, visits: 124, lastYear: 99, vaccines: 40, general: 51, surgery: 21, emergency: 12, revenue: 434000 },
    { month: 'أفريل', monthKey: 'أفريل', monthIndex: 3, visits: 142, lastYear: 115, vaccines: 48, general: 56, surgery: 24, emergency: 14, revenue: 497000 },
    { month: 'ماي', monthKey: 'ماي', monthIndex: 4, visits: 165, lastYear: 132, vaccines: 58, general: 63, surgery: 26, emergency: 18, revenue: 577500 },
    { month: 'جوان', monthKey: 'جوان', monthIndex: 5, visits: 158, lastYear: 128, vaccines: 52, general: 60, surgery: 28, emergency: 18, revenue: 553000 },
    { month: 'جويلية', monthKey: 'جويلية', monthIndex: 6, visits: 146, lastYear: 120, vaccines: 44, general: 58, surgery: 22, emergency: 22, revenue: 511000 },
    { month: 'أوت', monthKey: 'أوت', monthIndex: 7, visits: 135, lastYear: 110, vaccines: 38, general: 54, surgery: 20, emergency: 23, revenue: 472500 },
    { month: 'سبتمبر', monthKey: 'سبتمبر', monthIndex: 8, visits: 152, lastYear: 125, vaccines: 50, general: 61, surgery: 25, emergency: 16, revenue: 532000 },
    { month: 'أكتوبر', monthKey: 'أكتوبر', monthIndex: 9, visits: 138, lastYear: 112, vaccines: 42, general: 57, surgery: 24, emergency: 15, revenue: 483000 },
    { month: 'نوفمبر', monthKey: 'نوفمبر', monthIndex: 10, visits: 118, lastYear: 96, vaccines: 34, general: 50, surgery: 21, emergency: 13, revenue: 413000 },
    { month: 'ديسمبر', monthKey: 'ديسمبر', monthIndex: 11, visits: 128, lastYear: 104, vaccines: 39, general: 53, surgery: 23, emergency: 13, revenue: 448000 },
  ]
};

export default function AnalyticsDashboard({
  currentLang,
  wilaya = '16 - Alger',
  clinicName = 'Cabinet Vétérinaire DiaVet'
}: AnalyticsDashboardProps) {
  const isRtl = currentLang === 'ar';
  const isEn = currentLang === 'en';

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // States
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'vaccines' | 'general' | 'surgery' | 'emergency'>('all');
  const [showComparison, setShowComparison] = useState(true);
  const [activeBar, setActiveBar] = useState<MonthlyStat | null>(null);
  const [hoveredData, setHoveredData] = useState<{ d: MonthlyStat; x: number; y: number } | null>(null);

  const data = useMemo(() => {
    return MONTHLY_ANALYTICS_DATA[currentLang] || MONTHLY_ANALYTICS_DATA.fr;
  }, [currentLang]);

  // Totals calculations
  const totalVisits = useMemo(() => data.reduce((sum, d) => sum + d.visits, 0), [data]);
  const totalLastYear = useMemo(() => data.reduce((sum, d) => sum + d.lastYear, 0), [data]);
  const growthRate = useMemo(() => (((totalVisits - totalLastYear) / totalLastYear) * 100).toFixed(1), [totalVisits, totalLastYear]);
  const totalVaccines = useMemo(() => data.reduce((sum, d) => sum + d.vaccines, 0), [data]);
  const totalRevenue = useMemo(() => data.reduce((sum, d) => sum + d.revenue, 0), [data]);

  // D3 Chart Render Hook
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Dimensions setup with ResizeObserver / dynamic bounding client rect
    const containerWidth = containerRef.current.clientWidth || 700;
    const height = 360;
    const margin = { top: 30, right: 25, bottom: 45, left: 45 };
    const width = containerWidth;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous drawing

    svg.attr('width', width).attr('height', height);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define Gradients in defs
    const defs = svg.append('defs');

    // Gradient for current year active metric
    const gradientCurrent = defs
      .append('linearGradient')
      .attr('id', 'd3-bar-gradient-emerald')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradientCurrent
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', 0.95);

    gradientCurrent
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#059669')
      .attr('stop-opacity', 0.5);

    // Gradient for hover/highlighted bar
    const gradientHighlight = defs
      .append('linearGradient')
      .attr('id', 'd3-bar-gradient-highlight')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradientHighlight
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#34d399')
      .attr('stop-opacity', 1);

    gradientHighlight
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', 0.85);

    // Color mapper for specific category filters
    const getMetricValue = (d: MonthlyStat) => {
      if (selectedMetric === 'vaccines') return d.vaccines;
      if (selectedMetric === 'general') return d.general;
      if (selectedMetric === 'surgery') return d.surgery;
      if (selectedMetric === 'emergency') return d.emergency;
      return d.visits;
    };

    // Scales
    const x0Scale = d3
      .scaleBand()
      .domain(data.map((d) => d.month))
      .range([0, innerWidth])
      .paddingInner(0.25)
      .paddingOuter(0.15);

    const maxVal = d3.max(data, (d) => {
      const currentVal = getMetricValue(d);
      return showComparison && selectedMetric === 'all'
        ? Math.max(currentVal, d.lastYear)
        : currentVal;
    }) || 180;

    const yScale = d3
      .scaleLinear()
      .domain([0, maxVal * 1.15])
      .nice()
      .range([innerHeight, 0]);

    // Gridlines (horizontal)
    const makeYGrid = () => d3.axisLeft(yScale).ticks(5);
    g.append('g')
      .attr('class', 'grid')
      .call(
        makeYGrid()
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .call((group) => {
        group.select('.domain').remove();
        group.selectAll('line').attr('stroke', 'rgba(255, 255, 255, 0.07)');
      });

    // X Axis
    const xAxis = d3.axisBottom(x0Scale);
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .call((group) => {
        group.select('.domain').attr('stroke', 'rgba(255, 255, 255, 0.15)');
        group
          .selectAll('text')
          .attr('fill', '#94a3b8')
          .attr('font-size', '11px')
          .attr('font-weight', '600')
          .attr('dy', '1.2em');
        group.selectAll('.tick line').remove();
      });

    // Y Axis
    const yAxis = d3.axisLeft(yScale).ticks(5);
    g.append('g')
      .call(yAxis)
      .call((group) => {
        group.select('.domain').remove();
        group
          .selectAll('text')
          .attr('fill', '#94a3b8')
          .attr('font-size', '10px')
          .attr('font-weight', '500');
        group.selectAll('.tick line').remove();
      });

    // Bars rendering
    const barGroups = g
      .selectAll('.bar-group')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bar-group')
      .attr('transform', (d) => `translate(${x0Scale(d.month) || 0},0)`);

    const bandWidth = x0Scale.bandwidth();

    // 1. If comparison active (last year bars)
    if (showComparison && selectedMetric === 'all') {
      const halfWidth = bandWidth / 2 - 2;

      // Last Year Bar (Subtle Slate/Indigo)
      barGroups
        .append('rect')
        .attr('class', 'last-year-bar')
        .attr('x', 0)
        .attr('width', halfWidth)
        .attr('y', innerHeight)
        .attr('height', 0)
        .attr('rx', 4)
        .attr('fill', 'rgba(148, 163, 184, 0.25)')
        .attr('stroke', 'rgba(148, 163, 184, 0.35)')
        .attr('stroke-width', 1)
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr('y', (d) => yScale(d.lastYear))
        .attr('height', (d) => innerHeight - yScale(d.lastYear));

      // Current Year Bar (Emerald Gradient)
      barGroups
        .append('rect')
        .attr('class', 'current-year-bar')
        .attr('x', halfWidth + 4)
        .attr('width', halfWidth)
        .attr('y', innerHeight)
        .attr('height', 0)
        .attr('rx', 4)
        .attr('fill', 'url(#d3-bar-gradient-emerald)')
        .attr('stroke', '#059669')
        .attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr('y', (d) => yScale(d.visits))
        .attr('height', (d) => innerHeight - yScale(d.visits));

    } else {
      // Single Category Bar (Full Width of band)
      const barColor = 
        selectedMetric === 'vaccines' ? '#06b6d4' :
        selectedMetric === 'general' ? '#10b981' :
        selectedMetric === 'surgery' ? '#f59e0b' :
        selectedMetric === 'emergency' ? '#f43f5e' : 'url(#d3-bar-gradient-emerald)';

      barGroups
        .append('rect')
        .attr('class', 'single-bar')
        .attr('x', 0)
        .attr('width', bandWidth)
        .attr('y', innerHeight)
        .attr('height', 0)
        .attr('rx', 6)
        .attr('fill', barColor)
        .attr('fill-opacity', 0.85)
        .attr('stroke', barColor)
        .attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr('y', (d) => yScale(getMetricValue(d)))
        .attr('height', (d) => innerHeight - yScale(getMetricValue(d)));
    }

    // Interactive Hover Overlay on each month
    barGroups
      .append('rect')
      .attr('x', -2)
      .attr('y', 0)
      .attr('width', bandWidth + 4)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'pointer')
      .on('mouseenter', function (event, d) {
        d3.select(this.parentNode as SVGGElement)
          .selectAll('rect.current-year-bar, rect.single-bar')
          .attr('fill', 'url(#d3-bar-gradient-highlight)')
          .attr('filter', 'drop-shadow(0 4px 12px rgba(16, 185, 129, 0.4))');

        const [xPos, yPos] = d3.pointer(event, svgRef.current);
        setHoveredData({ d, x: xPos, y: yPos });
        setActiveBar(d);
      })
      .on('mousemove', function (event, d) {
        const [xPos, yPos] = d3.pointer(event, svgRef.current);
        setHoveredData({ d, x: xPos, y: yPos });
      })
      .on('mouseleave', function () {
        d3.select(this.parentNode as SVGGElement)
          .selectAll('rect.current-year-bar, rect.single-bar')
          .attr('fill', selectedMetric === 'all' ? 'url(#d3-bar-gradient-emerald)' : (
            selectedMetric === 'vaccines' ? '#06b6d4' :
            selectedMetric === 'general' ? '#10b981' :
            selectedMetric === 'surgery' ? '#f59e0b' : '#f43f5e'
          ))
          .attr('filter', null);

        setHoveredData(null);
      })
      .on('click', function (_event, d) {
        setActiveBar(d);
      });

    // Trend line overlay on top of bars
    if (selectedMetric === 'all') {
      const lineGenerator = d3
        .line<MonthlyStat>()
        .x((d) => (x0Scale(d.month) || 0) + bandWidth / 2)
        .y((d) => yScale(d.visits))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#34d399')
        .attr('stroke-width', 2.5)
        .attr('stroke-dasharray', '4 4')
        .attr('d', lineGenerator)
        .attr('opacity', 0.65);

      // Add Dots on peaks
      g.selectAll('.trend-dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', (d) => (x0Scale(d.month) || 0) + bandWidth / 2)
        .attr('cy', (d) => yScale(d.visits))
        .attr('r', 3)
        .attr('fill', '#10b981')
        .attr('stroke', '#022c22')
        .attr('stroke-width', 1.5);
    }

  }, [data, selectedMetric, showComparison]);

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Dashboard Top Header */}
      <div className="rounded-3xl p-6 sm:p-8 bg-slate-950/80 border border-emerald-500/20 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-3">
              <Activity className="w-3.5 h-3.5" />
              <span>
                {isRtl ? "محرك التحليلات التفاعلي D3.js · عيادات الجزائر 🇩🇿" : isEn ? "D3.js Interactive Clinical Engine · Algeria 🇩🇿" : "Moteur Analytique D3.js · Cliniques Vétérinaires DZ 🇩🇿"}
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>{isRtl ? "لوحة تحليلات الاستشارات الشهرية" : isEn ? "Monthly Consultations Analytics Dashboard" : "Tableau de Bord & Statistiques Mensuelles"}</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                2026
              </span>
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              {isRtl 
                ? `متابعة حية ومؤشرات الأداء السريري لـ ${clinicName} (${wilaya})`
                : isEn 
                ? `Real-time activity and clinical metrics for ${clinicName} (${wilaya})`
                : `Suivi d'activité et indicateurs de performance clinique pour ${clinicName} (${wilaya})`}
            </p>
          </div>

          {/* Quick Metrics Header Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  {isRtl ? "النمو السنوي" : isEn ? "YoY Growth" : "Croissance Annuelle"}
                </p>
                <p className="text-lg font-black text-emerald-400 flex items-center gap-1">
                  <span>+{growthRate}%</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </p>
              </div>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Syringe className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  {isRtl ? "مجموع التلقيحات" : isEn ? "Total Vaccines" : "Total Vaccins DZ"}
                </p>
                <p className="text-lg font-black text-cyan-400">
                  {totalVaccines}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              {isRtl ? "مجموع الفحوصات (2026)" : isEn ? "Total Consultations (2026)" : "Total Consultations 2026"}
            </span>
            <span className="text-2xl font-black text-white">{totalVisits}</span>
            <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
              {isRtl ? `مقابل ${totalLastYear} في 2025` : isEn ? `vs ${totalLastYear} in 2025` : `vs ${totalLastYear} en 2025`}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              {isRtl ? "المتوسط الشهري" : isEn ? "Monthly Average" : "Moyenne Mensuelle"}
            </span>
            <span className="text-2xl font-black text-emerald-400">{Math.round(totalVisits / 12)}</span>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              {isRtl ? "مريض / شهر" : isEn ? "patients / month" : "patients / mois"}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              {isRtl ? "الإيرادات الإجمالية" : isEn ? "Annual Revenue (DZD)" : "Recettes Globales (DZD)"}
            </span>
            <span className="text-xl sm:text-2xl font-black text-teal-300">
              {(totalRevenue / 1000).toLocaleString('fr-DZ')}k
            </span>
            <span className="text-[10px] text-teal-400 font-medium block mt-0.5">
              {isRtl ? "دينار جزائري مسجل" : isEn ? "Dinars recorded" : "Dinars Algériens cumulés"}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              {isRtl ? "ذروة النشاط" : isEn ? "Peak Month" : "Pic d'Activité"}
            </span>
            <span className="text-2xl font-black text-amber-400">
              {data.reduce((max, d) => (d.visits > max.visits ? d : max), data[0]).month}
            </span>
            <span className="text-[10px] text-amber-300 font-medium block mt-0.5">
              {isRtl ? "165 استشارة (موسم الربيع)" : isEn ? "165 visits (Spring surge)" : "165 consultations (Printemps)"}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive D3 Chart Card */}
      <div className="rounded-3xl p-6 sm:p-8 bg-slate-950/80 border border-white/10 shadow-xl backdrop-blur-xl">
        
        {/* Controls and Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/5">
          {/* Category Selector Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            {[
              { id: 'all', label: isRtl ? 'جميع الاستشارات' : isEn ? 'All Visits' : 'Toutes les visites', icon: BarChart3, color: 'emerald' },
              { id: 'vaccines', label: isRtl ? 'التلقيحات' : isEn ? 'Vaccines' : 'Vaccinations', icon: Syringe, color: 'cyan' },
              { id: 'general', label: isRtl ? 'طب عام' : isEn ? 'General' : 'Médecine Générale', icon: Stethoscope, color: 'emerald' },
              { id: 'surgery', label: isRtl ? 'جراحة وتعقيم' : isEn ? 'Surgery' : 'Chirurgies', icon: Scissors, color: 'amber' },
              { id: 'emergency', label: isRtl ? 'طوارئ' : isEn ? 'Emergencies' : 'Urgences 24/7', icon: Flame, color: 'rose' }
            ].map(tab => {
              const Icon = tab.icon;
              const isSelected = selectedMetric === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedMetric(tab.id as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Toggle comparison button */}
          {selectedMetric === 'all' && (
            <button
              onClick={() => setShowComparison(!showComparison)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 self-start md:self-auto ${
                showComparison
                  ? 'bg-slate-900 border-emerald-500/40 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isRtl ? "مقارنة مع 2025" : isEn ? "Compare with 2025" : "Comparer avec 2025"}</span>
            </button>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400 mb-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block shadow-sm shadow-emerald-500/50" />
            <span className="text-white">
              {isRtl ? "السنة الحالية (2026)" : isEn ? "Current Year (2026)" : "Année en cours (2026)"}
            </span>
          </div>
          {showComparison && selectedMetric === 'all' && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-slate-500/50 border border-slate-400 inline-block" />
              <span>{isRtl ? "السنة السابقة (2025)" : isEn ? "Previous Year (2025)" : "Année précédente (2025)"}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 ml-auto text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{isRtl ? "مرر المؤشر أو انقر على الشهر للتفاصيل" : isEn ? "Hover or tap on bar to inspect" : "Survolez les barres pour le détail"}</span>
          </div>
        </div>

        {/* D3 Canvas Container */}
        <div ref={containerRef} className="w-full relative overflow-hidden">
          <svg ref={svgRef} className="w-full overflow-visible" />

          {/* Dynamic Floating Tooltip */}
          {hoveredData && (
            <div
              className="absolute z-30 pointer-events-none p-3 rounded-xl bg-slate-900/95 border border-emerald-500/40 text-white shadow-2xl backdrop-blur-md text-xs -translate-x-1/2 -translate-y-full mb-3 min-w-[160px]"
              style={{
                left: Math.max(80, Math.min(hoveredData.x, (containerRef.current?.clientWidth || 600) - 80)),
                top: Math.max(30, hoveredData.y)
              }}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
                <span className="font-black text-emerald-400 text-sm">
                  {hoveredData.d.monthKey} 2026
                </span>
                <span className="text-[10px] text-slate-400">DZ</span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">{isRtl ? "الاستشارات:" : isEn ? "Consultations:" : "Consultations :"}</span>
                  <span className="font-bold text-white">{hoveredData.d.visits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isRtl ? "التلقيحات:" : isEn ? "Vaccines:" : "Vaccins :"}</span>
                  <span className="font-bold text-cyan-300">{hoveredData.d.vaccines}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isRtl ? "الجراحة:" : isEn ? "Surgery:" : "Chirurgies :"}</span>
                  <span className="font-bold text-amber-300">{hoveredData.d.surgery}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isRtl ? "الطوارئ:" : isEn ? "Emergencies:" : "Urgences :"}</span>
                  <span className="font-bold text-rose-300">{hoveredData.d.emergency}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-white/10">
                  <span className="text-slate-400">{isRtl ? "الإيراد:" : isEn ? "Revenue:" : "Recettes :"}</span>
                  <span className="font-black text-emerald-300">
                    {hoveredData.d.revenue.toLocaleString('fr-DZ')} DZD
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selected Month Deep-Dive Panel */}
        {activeBar && (
          <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>
                  {isRtl ? `تحليل مفصل لشهر ${activeBar.monthKey} 2026` : isEn ? `Detailed breakdown for ${activeBar.monthKey} 2026` : `Analyse détaillée de ${activeBar.monthKey} 2026`}
                </span>
              </h4>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                {activeBar.revenue.toLocaleString('fr-DZ')} DZD
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5">
                <span className="text-[10px] text-slate-400 uppercase block">{isRtl ? "طب عام" : isEn ? "General Medicine" : "Médecine Générale"}</span>
                <span className="text-base font-bold text-white">{activeBar.general} actes</span>
                <span className="text-[10px] text-emerald-400 block">{Math.round((activeBar.general / activeBar.visits) * 100)}% de l'activité</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <span className="text-[10px] text-slate-400 uppercase block">{isRtl ? "تلقيحات دورية" : isEn ? "Vaccines & Boosters" : "Vaccinations"}</span>
                <span className="text-base font-bold text-cyan-300">{activeBar.vaccines} doses</span>
                <span className="text-[10px] text-cyan-400 block">{Math.round((activeBar.vaccines / activeBar.visits) * 100)}% de l'activité</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <span className="text-[10px] text-slate-400 uppercase block">{isRtl ? "جراحة وتعقيم" : isEn ? "Surgeries" : "Chirurgies"}</span>
                <span className="text-base font-bold text-amber-300">{activeBar.surgery} actes</span>
                <span className="text-[10px] text-amber-400 block">{Math.round((activeBar.surgery / activeBar.visits) * 100)}% de l'activité</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <span className="text-[10px] text-slate-400 uppercase block">{isRtl ? "طوارئ وإنعاش" : isEn ? "Emergencies" : "Urgences 24/7"}</span>
                <span className="text-base font-bold text-rose-300">{activeBar.emergency} cas</span>
                <span className="text-[10px] text-rose-400 block">{Math.round((activeBar.emergency / activeBar.visits) * 100)}% de l'activité</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
