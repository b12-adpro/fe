'use client';

import Link from 'next/link';

interface StatsProps {
  totalUsers: number;
}

export default function UserChart({ stats }: { stats: StatsProps }) {
  const totalUsers = stats.totalUsers || 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Total Pengguna</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{totalUsers}</p>
          <p className="text-sm text-gray-500 mt-1">pengguna terdaftar</p>
        </div>       
        <Link
          href="/users"
          className="text-sm px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center"
        >
          Lihat Semua
        </Link>
      </div>
    </div>
  );
}