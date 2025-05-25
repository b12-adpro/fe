'use client';

import { useCallback, useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import DonationHistoryPerCampaign from '../../admin/campaign/donations/component/DonationHistoryPerCampaign'; // Pastikan path ini benar
import AddCampaignForm from './CampaignForm'; 
import EditCampaignForm from './UpdateCampaign'; // Import komponen untuk edit
import { EyeIcon, PencilSquareIcon, PlusCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';


interface CampaignDTO {
  campaignId: string;
  fundraiserId: string;
  fundraiserName: string | null;
  judul: string;
  target: number;
  currentAmount: number;
  datetime: string;
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE';
  deskripsi: string;
  buktiPenggalanganDana: string | null; 
}

interface FundUsageProofDTO {
  id: number;
  campaignId: number;
  title: string;
  description: string;
  amount: number;
  submittedAt: string;
}

export default function UserCampaignTable() {
  const [campaigns, setCampaigns] = useState<CampaignDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationFilter, setVerificationFilter] = useState<string>('ALL');
  const [progressFilter, setProgressFilter] = useState<string>('ALL');
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignDTO | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [fundProofs, setFundProofs] = useState<FundUsageProofDTO[]>([]);
  const [proofsLoading, setProofsLoading] = useState(false);
  const [isProofsModalOpen, setIsProofsModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  // State untuk modal Add Campaign (sudah ada di kode Anda)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://3.211.204.60/api/campaign/all`);
      if (!response.ok) {
        throw new Error(`Gagal mengambil data: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched campaigns:', data);
      if (Array.isArray(data)) {
        setCampaigns(data);
      } else {
        console.error("Data kampanye dari API (Admin) bukan array:", data);
        setCampaigns([]);
        setError("Format data kampanye tidak sesuai.");
      }
    } catch (error: any) {
      console.error('Error fetching campaigns (Admin):', error);
      setCampaigns([]);
      setError(error.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);



  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow max-w-xs text-sm">
          <p className="font-semibold mb-1">{label || data.name}</p>
          {data.description && <p className="text-gray-700 mb-1">{data.description}</p>}
          {typeof data.amount === 'number' && <p className="text-blue-600 font-medium">💸 Amount: Rp{data.amount.toLocaleString('id-ID')}</p>}
        </div>
      );
    }
    return null;
  };

  const openEditModal = (campaign: CampaignDTO) => {
    setSelectedCampaign({...campaign});
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedCampaign(null);
  };

  const handleCampaignUpdated = () => {
    fetchCampaigns();
    closeEditModal();
  };

  const openDonationModal = (campaign: CampaignDTO) => {
    setSelectedCampaign(campaign);
    setIsDonationModalOpen(true);
  };

  const closeDonationModal = () => {
    setIsDonationModalOpen(false);
    setSelectedCampaign(null);
  };

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  const handleCampaignCreated = () => {
      fetchCampaigns();
      closeAddModal();
  };


  const filteredCampaigns = Array.isArray(campaigns) ? campaigns.filter((campaign) => {
    const verificationMatch =
      verificationFilter === 'ALL' || campaign.status === verificationFilter;
    const progressMatch =
      progressFilter === 'ALL' ||
      (progressFilter === 'UPCOMING' && campaign.status === 'PENDING') ||
      (progressFilter === 'ACTIVE' && campaign.status === 'ACTIVE') ||
      (progressFilter === 'COMPLETED' && campaign.status === 'INACTIVE');
    return verificationMatch && progressMatch;
  }) : [];


  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch(e) {
        return dateString;
    }
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || typeof amount !== 'number') return 'N/A';
    return amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
  }


  if (loading) return <p className="text-center py-10">Memuat kampanye...</p>;
  if (error) return <p className="text-red-500 text-center py-10">Error: {error}</p>;


  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
            <div>
                <h1 className="text-2xl font-bold leading-tight text-gray-900">Kampanye</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Melihat, kelola, dan buat kampanye penggalangan dana.
                </p>
            </div>
            <div className="mt-4 sm:mt-0">
                <button
                    type="button"
                    onClick={openAddModal}
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    <PlusCircleIcon className="-ml-0.5 mr-2 h-5 w-5" aria-hidden="true" />
                    Buat Kampanye Baru
                </button>
            </div>
        </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label htmlFor="verificationFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter Status Verifikasi:</label>
          <select
            id="verificationFilter"
            value={verificationFilter}  
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-full sm:w-auto"
          >
            <option value="ALL">Semua</option>
            <option value="PENDING">Pending</option>
            <option value="ACTIVE">Terverifikasi</option>
            <option value="INACTIVE">Ditolak</option>
          </select>
        </div>

        <div>
          <label htmlFor="progressFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter Status Progres:</label>
          <select
            id="progressFilter"
            value={progressFilter}
            onChange={(e) => setProgressFilter(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-full sm:w-auto"
          >
            <option value="ALL">Semua</option>
            <option value="PENDING">Pending (Upcoming)</option>
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Selesai/Tidak Aktif</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-xs sm:text-sm leading-normal">
              <th className="py-3 px-4 text-left">Judul</th>
              <th className="py-3 px-4 text-left hidden md:table-cell">Fundraiser</th>
              <th className="py-3 px-4 text-left">Target</th>
              <th className="py-3 px-4 text-left hidden sm:table-cell">Terkumpul</th>
              <th className="py-3 px-4 text-left hidden lg:table-cell">Dibuat</th>
              <th className="py-3 px-4 text-left hidden lg:table-cell">Deskripsi</th>
              <th className="py-3 px-4 text-left">Status Verifikasi</th>
              <th className="py-3 px-4 text-left">Status Progres</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {filteredCampaigns.length > 0 ? (
              filteredCampaigns.map((campaign) => (
                <tr key={campaign.campaignId} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">{campaign.judul}</td>
                  <td className="py-3 px-4 hidden md:table-cell">{campaign.fundraiserId || '-'}</td>
                  <td className="py-3 px-4">{formatCurrency(campaign.target)}</td>
                  <td className="py-3 px-4 hidden sm:table-cell">{formatCurrency(campaign.currentAmount)}</td>
                  <td className="py-3 px-4 hidden lg:table-cell">{formatDate(campaign.datetime)}</td>
                  <td className="py-3 px-4 hidden lg:table-cell">{campaign.deskripsi}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        campaign.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : campaign.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {campaign.status === 'ACTIVE' ? 'Terverifikasi' : campaign.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                     <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        campaign.status === 'ACTIVE'
                            ? 'bg-blue-100 text-blue-700'
                            : campaign.status === 'PENDING'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                        {campaign.status === 'ACTIVE' ? 'Aktif' : campaign.status === 'PENDING' ? 'Akan Datang' : 'Selesai'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {/* CHANGED: Menggunakan button untuk modal, bukan Link */}
                      <button
                        onClick={() => openEditModal(campaign)}
                        className="text-blue-600 hover:text-blue-900" 
                        title="Update Kampanye"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openDonationModal(campaign)}
                        className="text-purple-600 hover:text-purple-900" title="Riwayat Donasi"
                      >
                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.523 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-500">
                  Tidak ada kampanye yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isDonationModalOpen && selectedCampaign && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-3 border-b">
              <h2 className="text-xl font-semibold">Riwayat Donasi - {selectedCampaign.judul}</h2>
              <button onClick={closeDonationModal} className="text-gray-400 hover:text-gray-600">
                 <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <DonationHistoryPerCampaign campaignId={selectedCampaign.campaignId} />
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeDonationModal}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
                   <div className="p-6">
                        <div className="flex justify-between items-center mb-6 pb-3 border-b">
                            <h2 className="text-2xl font-semibold text-gray-900">Buat Kampanye Baru</h2>
                            <button onClick={closeAddModal} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <AddCampaignForm onSuccess={handleCampaignCreated} />
                   </div>
              </div>
          </div>
      )}

      {isEditModalOpen && selectedCampaign && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
                   <div className="p-6">
                        <div className="flex justify-between items-center mb-6 pb-3 border-b">
                            <h2 className="text-2xl font-semibold text-gray-900">Update Kampanye</h2>
                            <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <EditCampaignForm 
                            campaignData={selectedCampaign} 
                            onSuccess={handleCampaignUpdated} 
                        />
                   </div>
              </div>
          </div>
      )}
    </div>
  );
}