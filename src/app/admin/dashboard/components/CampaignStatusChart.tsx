'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import Link from 'next/link';

interface CampaignStats {
  upcomingCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
}

export default function CampaignStatusChart({ stats }: { stats: CampaignStats }) {
  const data = [
    { name: 'Upcoming', value: stats.upcomingCampaigns, color: '#F59E0B' },
    { name: 'Active', value: stats.activeCampaigns, color: '#10B981' },
    { name: 'Completed', value: stats.completedCampaigns, color: '#4F46E5' },
  ];

  const totalCampaigns = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Status Kampanye</h3>
          <p className="text-sm text-gray-500 mt-1">Total {totalCampaigns} kampanye terverifikasi</p>
        </div>
        <Link
          href="/admin/campaign"
          className="text-sm px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center"
        >
          Lihat Semua
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {data.map((item, index) => (
          <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
              <span className="text-sm text-gray-600">{item.name}</span>
            </div>
            <p className="text-xl font-bold text-gray-800">{item.value}</p>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barSize={40}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          <YAxis 
            allowDecimals={false} 
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
            radius={[4, 4, 0, 0]}
            fill="#8884d8"
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