"use client";

import { Card } from "@/components/ui";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, BarChart, Bar, XAxis, YAxis } from "recharts";

export default function Charts({ byCategory, byObject }: any) {
  return (
    <div className="grid lg:grid-cols-2 gap-3">
      <Card className="h-80">
        <div className="font-semibold mb-2">Harajat turlari bo'yicha</div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={byCategory}>
            <XAxis dataKey="name" stroke="currentColor" fontSize={12} />
            <YAxis stroke="currentColor" fontSize={12} />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card className="h-80">
        <div className="font-semibold mb-2">Obyektlar bo'yicha</div>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={byObject} dataKey="value" nameKey="name" outerRadius={100} label />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
