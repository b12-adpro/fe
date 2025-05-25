'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import Link from 'next/link';

interface StatsProps {
  totalFundraisers: number;
  totalDonaturs: number;
}

export default function UserRoleChart({ stats }: { stats: StatsProps }) {
  const data = [
    { name: 'Fundraiser', value: stats.totalFundraisers, color: '#10B981' },
    { name: 'Donatur', value: stats.totalDonaturs, color: '#6366F1' },
  ];

  const totalUsers = stats.totalFundraisers + stats.totalDonaturs;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Peran Pengguna</h3>
          <p className="text-sm text-gray-500 mt-1">Total {totalUsers} pengguna terdaftar</p>
        </div>
        <Link
          href="/users"
          className="text-sm px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center"
        >
          Lihat Semua
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {data.map((item, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
              <span className="text-sm text-gray-600">{item.name}</span>
            </div>
            <p className="text-xl font-bold text-gray-800">{item.value}</p>
            <p className="text-xs text-gray-500 mt-1">
              {((item.value / totalUsers) * 100).toFixed(1)}% dari total
            </p>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart 
          data={data}
          layout="vertical"
          barSize={40}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
          <XAxis 
            type="number" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value: number) => [value, 'Jumlah']}
            contentStyle={{ borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', border: 'none' }}
          />
          <Bar 
            dataKey="value" 
            radius={[0, 4, 4, 0]}
            animationDuration={1000}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}