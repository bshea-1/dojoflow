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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreVertical } from "lucide-react";

interface DashboardStatsProps {
  userName?: string;
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

function SemiCircleGauge({ value, color, label, subLabel }: { value: number; color: string; label: string; subLabel?: string }) {
  // If value is 0, we want a visible "empty" track (background) and a very small colored segment (red dot).
  
  const isZero = value === 0;
  // If 0, we display a small value (2) to make a visible 'dot'
  const displayValue = isZero ? 2 : value; 
  const displayColor = isZero ? "#ef4444" : color; // Red if 0%, else the passed color

  const data = [{ name: "value", value: displayValue, fill: displayColor }];
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative w-full h-[150px] flex items-end justify-center overflow-hidden">
        <ResponsiveContainer width="100%" height="200%">
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="80%" 
            outerRadius="100%" 
            barSize={24} 
            data={data} 
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
              background={{ fill: '#e2e8f0' }} // Darker gray for better visibility
              dataKey="value"
              cornerRadius={12} // Rounded ends
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute bottom-0 mb-4 text-center">
           <div className={`text-3xl font-bold ${isZero ? 'text-destructive' : ''}`}>{value}%</div>
        </div>
      </div>
      <div className="text-center mt-2 space-y-1">
        <p className="text-xs font-medium px-4">{label}</p>
        {subLabel && <p className="text-[10px] text-muted-foreground">{subLabel}</p>}
      </div>
    </div>
  );
}

export function DashboardStats({ stats, userName }: DashboardStatsProps) {
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <div className="space-y-6 bg-slate-50/50 p-2 rounded-xl">
      
      {/* Total Estimated Lifetime Value */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border">
        <div>
          <h2 className="text-lg font-medium text-slate-900">Total Estimated Lifetime Value</h2>
          <p className="text-sm text-muted-foreground">of Families not yet Enrolled/Waitlisted</p>
          <p className="text-xs text-muted-foreground mt-1 italic">Since 2026</p>
        </div>
        <div className="text-3xl font-bold text-green-500">
          {currencyFormatter.format(stats.totalLifetimeValue)}
        </div>
      </div>

      {/* Quick Stats Row */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-medium">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SemiCircleGauge 
              value={stats.quickStats.fastToursPercent} 
              color="#e5e7eb" 
              label="Families Completing Tours Within 24 Hours"
              subLabel="Down 50% from previous period"
            />
             <SemiCircleGauge 
              value={stats.quickStats.overdueTasksPercent} 
              color="#f97316" 
              label="Tasks That Are Past Due"
              subLabel="Up 10% from previous period"
            />
             <SemiCircleGauge 
              value={stats.quickStats.waitlistPercent} 
              color="#eab308" 
              label="New Families Getting To Wait List or Registered"
              subLabel="Down 53% from previous period"
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
                  color="#84cc16" 
                  label="New Families Getting to Tour Scheduled"
                  subLabel="Up 7% from previous"
                />
                <SemiCircleGauge 
                  value={stats.conversionStats.newToTourCompletedPercent} 
                  color="#e5e7eb" 
                  label="New Families Getting To Tour Completed"
                  subLabel="Down 9% from previous"
                />
                <SemiCircleGauge 
                  value={stats.conversionStats.scheduledToCompletedPercent} 
                  color="#f97316" 
                  label="Scheduled Tours Getting Completed"
                  subLabel="Down 24% from previous"
                />
                <SemiCircleGauge 
                  value={stats.conversionStats.registeredAfterTourPercent} 
                  color="#f97316" 
                  label="Children Registered After Tour Completion"
                  subLabel="Down 52% from previous"
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

    </div>
  );
}
