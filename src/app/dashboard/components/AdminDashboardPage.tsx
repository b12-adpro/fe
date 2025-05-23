'use client';

import { useEffect, useState } from 'react';
import CampaignStatusChart from './CampaignStatusChart';
import UserRoleChart from './UserRoleChart';
import PlatformStatsPieChart from './PlatformStatsPieChart';
import Link from 'next/link';

interface DashboardStats {
  totalCampaigns: number;
  totalDonations: number;
  totalUsers: number;

  upcomingCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  
  totalFundraisers: number;
  totalDonaturs: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://yielding-kendra-tk-adpro-12-72b281e5.koyeb.app/admin/dashboard/stats');
        
        if (!response.ok) {
          throw new Error('Gagal memuat data dashboard');
        }
        
        const result = await response.json();
        console.log('Dashboard stats:', result);
        setStats(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-800">Gagal Memuat Data</h2>
            <p className="text-gray-600 mb-6">{error || 'Terjadi kesalahan saat memuat data dashboard'}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors w-full"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Admin</h1>
            <p className="text-gray-500">Pantau statistik dan performa platform</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/notifications"
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
              </svg>
              Notifikasi
            </Link>

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 lg:row-span-2">
            <PlatformStatsPieChart stats={stats} />
          </div>
          <div className="lg:col-span-1">
            <CampaignStatusChart stats={stats} />
          </div>
          <div className="lg:col-span-1">
            <UserRoleChart stats={stats} />
          </div>
        </div>

      </div>
    </div>
  );
}