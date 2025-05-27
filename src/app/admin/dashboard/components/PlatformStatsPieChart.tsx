'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PlatformStats {
  totalCampaigns: number;
  totalUsers: number;
}

const COLORS = ['#4F46E5', '#10B981'];
const RADIAN = Math.PI / 180;

import { PieLabelRenderProps } from 'recharts';

const renderCustomizedLabel = ({
  cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0
}: PieLabelRenderProps) => {
  const radius = (+innerRadius + (+outerRadius - +innerRadius) * 0.5);
  const x = (cx as number) + radius * Math.cos(-midAngle * RADIAN);
  const y = (cy as number) + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > (cx as number) ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={14}
      fontWeight="medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function PlatformStatsPieChart({ stats }: { stats: PlatformStats }) {
  const data = [
    { name: 'Total Kampanye', value: stats.totalCampaigns },
    { name: 'Total Pengguna', value: stats.totalUsers },
  ];
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md h-full">
      <div className="flex flex-col h-full">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Statistik Platform</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          {data.map((item, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-sm  text-gray-800">{item.name}</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{item.value.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">
                {((item.value / totalValue) * 100).toFixed(1)}% dari total
              </p>
            </div>
          ))}
        </div>
        
        <div className="flex-grow">
          <ResponsiveContainer width="100%" height="100%" minHeight={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                innerRadius={60}
                fill="#8884d8"
                labelLine={false}
                label={renderCustomizedLabel}
                >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [value.toLocaleString(), 'Jumlah']}
                contentStyle={{ borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', border: 'none' }}
                />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}