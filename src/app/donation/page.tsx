'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DonationHistoryTable, { DonationHistoryDTO } from './component/DonationHistoryTable';

export default function AllDonationsPage() {
  const router = useRouter();
  const [donations, setDonations] = useState<DonationHistoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDonations = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('https://yielding-kendra-tk-adpro-12-72b281e5.koyeb.app/admin/donation-history');
      
      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      setDonations(data);
      setError(null);
      console.log('Donation history:', data);
    } catch (error) {
      console.error('Failed to fetch donation data:', error);
      setError('Gagal memuat data donasi. Silakan coba lagi nanti.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const totalAmount = donations.reduce((sum, donation) => sum + donation.amount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Riwayat Donasi</h1>
          
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/campaign')}
              className="px-4 py-2 flex items-center gap-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke Kampanye
            </button> 
          </div>
        </div>
        
        {/* Dashboard cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Donasi</div>
            <div className="text-2xl font-bold text-green-600">
              Rp {totalAmount.toLocaleString('id-ID')}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="text-sm font-medium text-gray-500 mb-1">Rata-rata Donasi</div>
            <div className="text-2xl font-bold text-blue-600">
              Rp {donations.length > 0 
                ? Math.round(totalAmount / donations.length).toLocaleString('id-ID') 
                : 0}
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-start">
          <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>{error}</div>
        </div>
      )}
      
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-16 text-center">
          <div className="flex justify-center mb-4">
            <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-600">Memuat data donasi...</p>
        </div>
      ) : (
        <DonationHistoryTable donations={donations} />
      )}
    </div>
  );
}