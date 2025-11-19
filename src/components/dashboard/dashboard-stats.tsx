"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreVertical } from "lucide-react";

type GaugeDirection = "good-high" | "good-low";

const blendColor = (
  value: number,
  direction: GaugeDirection = "good-high",
  stops: { offset: number; color: string }[]
) => {
  const clamped = Math.max(0, Math.min(100, value));
  const normalized = direction === "good-high" ? clamped : 100 - clamped;

  for (let i = 0; i < stops.length - 1; i++) {
    const start = stops[i];
    const end = stops[i + 1];
    if (normalized >= start.offset && normalized <= end.offset) {
      const range = end.offset - start.offset;
      const progress = range === 0 ? 0 : (normalized - start.offset) / range;
      const interpolate = (a: number, b: number) => Math.round(a + (b - a) * progress);
      const parseHex = (hex: string) => hex.match(/[a-f0-9]{2}/gi)?.map((h) => parseInt(h, 16)) ?? [0, 0, 0];

      const startRgb = parseHex(start.color.replace("#", ""));
      const endRgb = parseHex(end.color.replace("#", ""));

      const r = interpolate(startRgb[0], endRgb[0]);
      const g = interpolate(startRgb[1], endRgb[1]);
      const b = interpolate(startRgb[2], endRgb[2]);

      return `rgb(${r}, ${g}, ${b})`;
    }
  }

  return stops[stops.length - 1].color;
};

const GAUGE_STOPS: { offset: number; color: string }[] = [
  { offset: 0, color: "#dc2626" },
  { offset: 33, color: "#f97316" },
  { offset: 66, color: "#facc15" },
  { offset: 100, color: "#16a34a" },
];
const getGaugeColor = (value: number, direction: GaugeDirection = "good-high") =>
  blendColor(value, direction, GAUGE_STOPS);

interface DashboardStatsProps {
  userName?: string;
  showLtv?: boolean;
  transitionKey?: string;
  stats: {
    totalLifetimeValue: number;
    quickStats: {
      fastToursPercent: number;
      overdueTasksPercent: number;
      waitlistPercent: number;
    };
    childrenByStatus: { name: string; value: number }[];
    conversionStats: {
      newToTourScheduledPercent: number;
      newToTourCompletedPercent: number;
      scheduledToCompletedPercent: number;
      registeredAfterTourPercent: number;
    };
    pastDueChartData: { name: string; value: number }[];
    completedChartData: { name: string; value: number }[];
  };
}

function SemiCircleGauge({
  value,
  label,
  subLabel,
  direction = "good-high",
}: {
  value: number;
  label: string;
  subLabel?: string;
  direction?: GaugeDirection;
}) {
  const isZero = value === 0;
  const displayValue = isZero ? 2 : value; 
  const displayColor = getGaugeColor(value, direction);

  const trackData = [{ name: "track", value: 100 }];
  const valueData = [{ name: "metric", value: displayValue }];

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative w-full h-[150px] flex items-end justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ResponsiveContainer width="100%" height="200%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="82%"
              outerRadius="98%"
              barSize={18}
              data={trackData}
              startAngle={180}
              endAngle={0}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                dataKey="value"
                fill="#e5e7eb"
                isAnimationActive={false}
                cornerRadius={10}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        <div className="relative z-10 w-full h-full">
          <ResponsiveContainer width="100%" height="200%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="82%"
            outerRadius="98%"
            barSize={18}
            data={valueData}
            startAngle={180}
            endAngle={0}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              dataKey="value"
              fill={displayColor}
              isAnimationActive
              cornerRadius={10}
            />
          </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="absolute bottom-0 mb-4 text-center">
          <div className="text-3xl font-bold" style={{ color: displayColor }}>
            {value}%
          </div>
        </div>
      </div>
      <div className="text-center mt-2 space-y-1">
        <p className="text-xs font-medium px-4">{label}</p>
        {subLabel && (
          <p className="text-[10px]" style={{ color: displayColor }}>
            {subLabel}
          </p>
        )}
      </div>
    </div>
  );
}

export function DashboardStats({ stats, userName, showLtv = false, transitionKey }: DashboardStatsProps) {
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  const statsKey = transitionKey ?? "default";

  return (
    <AnimatePresence mode="wait">
    <motion.div
      key={statsKey}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6 bg-slate-50/50 p-2 rounded-xl"
    >
      <div className="bg-white border rounded-2xl shadow-sm p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">
              Insight Dashboard
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              Good morning, {userName || "Sensei"}
            </h1>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p className="font-medium text-slate-600">Last 7 Days</p>
            <p className="text-xs">Updated {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      
      {showLtv && (
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg text-slate-900">Total Estimated Lifetime Value</CardTitle>
              <CardDescription>Families not yet enrolled or waitlisted • Since 2026</CardDescription>
            </div>
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-bold text-green-500">
                {currencyFormatter.format(stats.totalLifetimeValue)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Grows $249 every month per pending family until enrollment.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats Row */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium">Quick Stats</CardTitle>
            <CardDescription>Pulse overview of tours and task follow-ups</CardDescription>
          </div>
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SemiCircleGauge 
              value={stats.quickStats.fastToursPercent} 
              label="Families Completing Tours Within 72 Hours"
              direction="good-high"
            />
             <SemiCircleGauge 
              value={stats.quickStats.overdueTasksPercent} 
              label="Tasks That Are Past Due"
              direction="good-low"
            />
             <SemiCircleGauge 
              value={stats.quickStats.waitlistPercent} 
              label="New Families Getting To Wait List or Registered"
              direction="good-high"
            />
          </div>
        </CardContent>
      </Card>

      {/* Middle Row: Children by Status & Conversion Success */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Children by Status */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Children by Status</CardTitle>
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.childrenByStatus}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    interval={0}
                    dy={10}
                  />
                  <YAxis 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f4f4f5' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#a855f7" radius={[4, 4, 0, 0]}>
                     {stats.childrenByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#a855f7" />
                      ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center mt-4 items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#a855f7]" />
                <span className="text-xs font-medium">{userName || "Franchise"}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Note: Families without any children in the system are assumed to have one child.
            </p>
          </CardContent>
        </Card>

        {/* Conversion Success */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Conversion Success</CardTitle>
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="grid grid-cols-2 gap-6">
                <SemiCircleGauge 
                  value={stats.conversionStats.newToTourScheduledPercent} 
                  label="New Families Getting to Tour Scheduled"
                  direction="good-high"
                />
                <SemiCircleGauge 
                  value={stats.conversionStats.newToTourCompletedPercent} 
                  label="New Families Getting To Tour Completed"
                  direction="good-high"
                />
                <SemiCircleGauge 
                  value={stats.conversionStats.scheduledToCompletedPercent} 
                  label="Scheduled Tours Getting Completed"
                  direction="good-high"
                />
                <SemiCircleGauge 
                  value={stats.conversionStats.registeredAfterTourPercent} 
                  label="Children Registered After Tour Completion"
                  direction="good-high"
                />
             </div>
          </CardContent>
        </Card>

      </div>

      {/* Bottom Row: Past Due & Completed Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Past Due */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Past Due</CardTitle>
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.pastDueChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f4f4f5' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                  <Bar dataKey="value" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center mt-4 items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#a855f7]" />
                <span className="text-xs font-medium">{userName || "Franchise"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="border-none shadow-sm">
           <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Completed</CardTitle>
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.completedChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f4f4f5' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                  <Bar dataKey="value" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center mt-4 items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#a855f7]" />
                <span className="text-xs font-medium">{userName || "Franchise"}</span>
            </div>
          </CardContent>
        </Card>

      </div>

    </motion.div>
    </AnimatePresence>
  );
}
