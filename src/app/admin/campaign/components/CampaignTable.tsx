'use client';

import { useCallback, useEffect, useState } from 'react';
import DonationHistoryPerCampaign from '../donations/component/DonationHistoryPerCampaign';
import { PlusCircleIcon } from '@heroicons/react/16/solid';
import { XMarkIcon } from '@heroicons/react/16/solid';

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
  buktiPenggalanganDana: string;
}

export default function CampaignTable() {
  const [campaigns, setCampaigns] = useState<CampaignDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [verificationFilter, setVerificationFilter] = useState<string>('ALL');
  const [progressFilter, setProgressFilter] = useState<string>('ALL');
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignDTO | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ text: '', type: '' });
  const [isProofsModalOpen, setIsProofsModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/campaigns`);
      
      if (!response.ok) {
        let errorDetails = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorDetails = errorData.message || errorData.error || JSON.stringify(errorData) || errorDetails;
        } catch (jsonError) {
          const textError = await response.text(); 
          errorDetails = `${errorDetails} - ${response.statusText}. Response body: ${textError}`;
        }
        throw new Error(`Failed to fetch campaigns: ${errorDetails}`);
      }
      
      const data = await response.json();
      console.log('Fetched campaigns:', data);

      if (Array.isArray(data)) {
        setCampaigns(data);
      } else {
        console.error('Fetched campaigns data is not an array:', data);
        setCampaigns([]);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setCampaigns([]); 
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
        <div className="bg-white p-3 border rounded shadow max-w-xs">
          <p className="font-semibold">{label}</p>
          <p className="text-sm text-gray-700">{data.description}</p>
          <p className="mt-1 text-blue-600 font-medium">💸 Amount: ${data.amount.toLocaleString()}</p>
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
    setUpdateMessage({ text: '', type: '' });
  };

  const openProofsModal = async (campaign: CampaignDTO) => {
    setSelectedCampaign({...campaign});
    setIsProofsModalOpen(true);
  };

  const closeProofsModal = () => {
    setIsProofsModalOpen(false);
    setSelectedCampaign(null);
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

  const handleVerify = async (approve: boolean) => {
    if (!selectedCampaign) return;

    setUpdateLoading(true);
    setUpdateMessage({ text: '', type: '' });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/campaigns/${selectedCampaign.campaignId}/verify?approve=${approve}`, {
        method: 'PUT',
      });

      if (response.ok) {
        const updatedCampaign = await response.json();
        setCampaigns(campaigns.map(c => c.campaignId === updatedCampaign.campaignId ? updatedCampaign : c));
        setUpdateMessage({ 
          text: approve ? 'Campaign verified successfully!' : 'Campaign rejected successfully!', 
          type: 'success' 
        });

        setTimeout(() => {
          closeEditModal();
        }, 1500);
      } else {
        const errorData = await response.json();
        setUpdateMessage({ text: errorData.message || 'Failed to update campaign', type: 'error' });
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
      setUpdateMessage({ text: 'An error occurred while updating', type: 'error' });
    } finally {
      setUpdateLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
  const verificationMatch =
    verificationFilter === 'ALL' || campaign.status === verificationFilter;
  const progressMatch =
    progressFilter === 'ALL' || 
    (campaign.status === progressFilter && campaign.status === 'ACTIVE');
  return verificationMatch && progressMatch;
});

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const chartData = campaigns.map((campaign) => ({
    name: campaign.judul,
    target: campaign.target,
    currentAmount: campaign.currentAmount,
  }));

  if (loading) return <p className="text-center">Loading campaigns...</p>;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
            <div>
                <h1 className="text-2xl font-bold leading-tight text-gray-900">Manajemen Kampanye</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Lihat dan kelola semua kampanye penggalangan dana.
                </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <button
                    type="button"
                    onClick={openAddModal}
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                >
                    <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Buat Kampanye Baru
                </button>
            </div>
        </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block font-semibold mb-1">Filter Status Verifikasi:</label>
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="border rounded px-3 py-1"
          >
            <option value="ALL">Semua</option>
            <option value="PENDING">Pending</option>
            <option value="ACTIVE">Verified</option>
            <option value="INACTIVE">Rejected</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Filter Status Progres:</label>
          <select
            value={progressFilter}
            onChange={(e) => setProgressFilter(e.target.value)}
            className="border rounded px-3 py-1"
          >
            <option value="ALL">Semua</option>
            <option value="PENDING">Pending</option>
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Tidak Aktif</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-sm leading-normal">
              <th className="py-3 px-4 text-left">Judul</th>
              <th className="py-3 px-4 text-left">Fundraiser</th>
              <th className="py-3 px-4 text-left">Target</th>
              <th className="py-3 px-4 text-left">Current</th>
              <th className="py-3 px-4 text-left">Start</th>
              <th className="py-3 px-4 text-left">Verification</th>
              <th className="py-3 px-4 text-left">Progress</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {filteredCampaigns.length > 0 ? (
              filteredCampaigns.map((campaign) => (
                <tr key={campaign.campaignId} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">{campaign.judul}</td>
                  <td className="py-3 px-4">{campaign.fundraiserName}</td>
                  <td className="py-3 px-4">{campaign.target}</td>
                  <td className="py-3 px-4">{campaign.currentAmount}</td>
                  <td className="py-3 px-4">{formatDate(campaign.datetime)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        campaign.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : campaign.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {campaign.status === 'ACTIVE' ? 'Verified' : 
                      campaign.status === 'INACTIVE' ? 'Rejected' : 
                      'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {campaign.status === 'ACTIVE' ? (
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          campaign.status === 'ACTIVE'
                            ? 'bg-blue-100 text-blue-700'
                            : campaign.status === 'PENDING'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {campaign.status === 'ACTIVE' ? 'Active' :
                        campaign.status === 'PENDING' ? 'Upcoming' :
                        'Completed'}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {campaign.status === 'PENDING' && (
                            <button
                              onClick={() => openEditModal(campaign)}
                              className="px-3 py-1 rounded-md text-white text-xs bg-blue-500 hover:bg-blue-600"
                            >
                              Verify
                            </button>
                          )}
                        <button
                          onClick={() => openProofsModal(campaign)}
                          className={`px-3 py-1 rounded-md text-white text-xs ${
                            campaign.status === 'ACTIVE'
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-gray-400'
                          }`}
                        >
                          Proofs
                        </button>
                        <button
                          onClick={() => openDonationModal(campaign)}
                          className="px-3 py-1 rounded-md text-white bg-purple-600 hover:bg-purple-700 text-xs"
                        >
                          Donations
                        </button>
                      </div>
                    </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-500">
                  Tidak ada kampanye yang ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isEditModalOpen && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-full">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Verifikasi Kampanye</h2>
                <button onClick={closeEditModal} className="text-gray-500 hover:text-gray-700">
                    <XMarkIcon className="h-6 w-6" />
                </button>
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Campaign Title:</label>
              <p className="border px-3 py-2 rounded bg-gray-100">{selectedCampaign.judul}</p>
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Status Saat Ini:</label>
              <p className="px-3 py-2">
                <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
                  PENDING
                </span>
              </p>
            </div>
            <p className="mb-6 text-sm text-gray-600">
              Apakah Anda ingin menyetujui kampanye ini?
            </p>
            {updateMessage.text && (
              <div className={`mb-4 p-2 rounded ${
                updateMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {updateMessage.text}
              </div>
            )}
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={closeEditModal}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleVerify(false)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                disabled={updateLoading}
              >
                Tolak
              </button>
              <button
                type="button"
                onClick={() => handleVerify(true)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                disabled={updateLoading}
              >
                {updateLoading ? 'Memproses...' : 'Setujui'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDonationModalOpen && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Donation History - {selectedCampaign.judul}</h2>
              <button 
                onClick={closeDonationModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <DonationHistoryPerCampaign campaignId={selectedCampaign.campaignId.toString()} />
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeDonationModal}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {isProofsModalOpen && selectedCampaign && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Campaign Proof - {selectedCampaign.judul}</h2>
                <button 
                  onClick={closeProofsModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Campaign Details:</h3>
                <p className="mb-2">Target Amount: ${selectedCampaign.target?.toLocaleString()}</p>
                <p className="mb-4">Current Amount: ${selectedCampaign.currentAmount?.toLocaleString()}</p>
                
                <h3 className="font-semibold mb-2">Proof Document:</h3>
                {selectedCampaign.buktiPenggalanganDana ? (
                  <a 
                    href={selectedCampaign.buktiPenggalanganDana}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    View Campaign Proof Document
                  </a>
                ) : (
                  <p className="text-gray-500">No proof document available</p>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={closeProofsModal}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}