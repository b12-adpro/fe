'use client';

import { useEffect, useState } from 'react';
import DonationHistoryPerCampaign from '.././donations/component/DonationHistoryPerCampaign';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'

interface CampaignDTO {
  id: number;
  fundraiserId: string;
  fundraiserName: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  progressStatus: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
}

interface FundUsageProofDTO {
  id: number;
  campaignId: number;
  title: string;
  description: string;
  amount: number;
  submittedAt: string;
}

export default function CampaignPage() {
  const [campaigns, setCampaigns] = useState<CampaignDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [verificationFilter, setVerificationFilter] = useState<string>('ALL');
  const [progressFilter, setProgressFilter] = useState<string>('ALL');
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignDTO | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ text: '', type: '' });
  const [fundProofs, setFundProofs] = useState<FundUsageProofDTO[]>([]);
  const [proofsLoading, setProofsLoading] = useState(false);
  const [isProofsModalOpen, setIsProofsModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://yielding-kendra-tk-adpro-12-72b281e5.koyeb.app/admin/campaigns');
      const data = await response.json();
      console.log('Fetched campaigns:', data); 
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFundUsageProofs = async (campaignId: number) => {
    setProofsLoading(true);
    try {
      const response = await fetch(`https://yielding-kendra-tk-adpro-12-72b281e5.koyeb.app/admin/campaigns/${campaignId}/fund-usage-proofs`);
      if (response.ok) {
        const data = await response.json();
        setFundProofs(data);
      } else {
        console.error('Failed to fetch fund usage proofs');
        setFundProofs([]);
      }
    } catch (error) {
      console.error('Error fetching fund usage proofs:', error);
      setFundProofs([]);
    } finally {
      setProofsLoading(false);
    }
  };

  
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

  const fundProofsChartData = fundProofs.map((proof) => ({
    name: proof.title,
    amount: proof.amount || 0,
    description: proof.description,
  }));
  
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
    await fetchFundUsageProofs(campaign.id);
  };

  const closeProofsModal = () => {
    setIsProofsModalOpen(false);
    setSelectedCampaign(null);
    setFundProofs([]);
  };

  const openDonationModal = (campaign: CampaignDTO) => {
    setSelectedCampaign(campaign);
    setIsDonationModalOpen(true);
  };
  
  const closeDonationModal = () => {
    setIsDonationModalOpen(false);
    setSelectedCampaign(null);
  };

  const handleVerify = async (approve: boolean) => {
    if (!selectedCampaign) return;
    
    setUpdateLoading(true);
    setUpdateMessage({ text: '', type: '' });
    
    try {
      const response = await fetch(`https://yielding-kendra-tk-adpro-12-72b281e5.koyeb.app/admin/campaigns/${selectedCampaign.id}/verify?approve=${approve}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const updatedCampaign = await response.json();
        setCampaigns(campaigns.map(c => c.id === updatedCampaign.id ? updatedCampaign : c));
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
      verificationFilter === 'ALL' || campaign.verificationStatus === verificationFilter;
    const progressMatch =
      progressFilter === 'ALL' || campaign.progressStatus === progressFilter;
    return verificationMatch && progressMatch;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const chartData = campaigns.map((campaign) => ({
    name: campaign.title,
    targetAmount: campaign.targetAmount,
    currentAmount: campaign.currentAmount,
  }));

  if (loading) return <p className="text-center">Loading campaigns...</p>;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block font-semibold mb-1">Filter Verification Status:</label>
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="border rounded px-3 py-1"
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Filter Progress Status:</label>
          <select
            value={progressFilter}
            onChange={(e) => setProgressFilter(e.target.value)}
            className="border rounded px-3 py-1"
          >
            <option value="ALL">All</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-sm leading-normal">
              <th className="py-3 px-4 text-left">Title</th>
              <th className="py-3 px-4 text-left">Fundraiser</th>
              <th className="py-3 px-4 text-left">Target</th>
              <th className="py-3 px-4 text-left">Current</th>
              <th className="py-3 px-4 text-left">Start</th>
              <th className="py-3 px-4 text-left">End</th>
              <th className="py-3 px-4 text-left">Verification</th>
              <th className="py-3 px-4 text-left">Progress</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {filteredCampaigns.length > 0 ? (
              filteredCampaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">{campaign.title}</td>
                  <td className="py-3 px-4">{campaign.fundraiserName}</td>
                  <td className="py-3 px-4">{campaign.targetAmount}</td>
                  <td className="py-3 px-4">{campaign.currentAmount}</td>
                  <td className="py-3 px-4">{formatDate(campaign.startDate)}</td>
                  <td className="py-3 px-4">{formatDate(campaign.endDate)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        campaign.verificationStatus === 'VERIFIED'
                          ? 'bg-green-100 text-green-700'
                          : campaign.verificationStatus === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {campaign.verificationStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {campaign.verificationStatus === 'VERIFIED' ? (
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          campaign.progressStatus === 'ACTIVE'
                            ? 'bg-blue-100 text-blue-700'
                            : campaign.progressStatus === 'UPCOMING'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {campaign.progressStatus}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                    {campaign.verificationStatus === 'PENDING' && (
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
                          campaign.progressStatus === 'ACTIVE' || campaign.progressStatus === 'COMPLETED'
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
                  No campaigns found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


      {/* Edit Modal */}
      {isEditModalOpen && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-full">
            <h2 className="text-xl font-bold mb-4">Verify Campaign</h2>
            
            <div className="mb-4">
              <label className="block font-semibold mb-1">Campaign Title:</label>
              <p className="border px-3 py-2 rounded bg-gray-100">{selectedCampaign.title}</p>
            </div>
            
            <div className="mb-4">
              <label className="block font-semibold mb-1">Current Status:</label>
              <p className="px-3 py-2">
                <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
                  PENDING
                </span>
              </p>
            </div>

            <p className="mb-4">Do you want to approve this campaign?</p>
            <p className="mb-6 text-sm text-gray-600">
              When approved, this campaign will be set to VERIFIED status.
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
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleVerify(false)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                disabled={updateLoading}
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => handleVerify(true)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                disabled={updateLoading}
              >
                {updateLoading ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDonationModalOpen && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Donation History - {selectedCampaign.title}</h2>
              <button 
                onClick={closeDonationModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <DonationHistoryPerCampaign campaignId={selectedCampaign.id.toString()} />
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeDonationModal}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fund Usage Proofs Modal */}
      {isProofsModalOpen && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Fund Usage Proofs - {selectedCampaign.title}</h2>
              <button 
                onClick={closeProofsModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {proofsLoading ? (
              <div className="flex justify-center items-center h-40">
                <p>Loading proofs...</p>
              </div>
            ) : fundProofs.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No fund usage proofs found for this campaign.</p>
              </div>
            ) : (
              <div className="mb-6 overflow-x-auto">
                <div className="min-w-[600px]">
                    <h3 className="font-semibold mb-2">
                      Current Amount: ${selectedCampaign.currentAmount?.toLocaleString()} &nbsp;
                      | Target Amount: ${selectedCampaign.targetAmount?.toLocaleString()}
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={fundProofs.map(proof => ({
                          name: proof.title,
                          date: formatDate(proof.submittedAt),
                          amount: proof.amount || 0,
                          description: proof.description
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-3 border rounded shadow text-sm max-w-xs break-words">
                                  <p className="font-bold mb-1">{data.name}</p>
                                  <p>{data.description}</p>
                                  <p className="text-blue-600">Amount: ${data.amount.toLocaleString()}</p>
                                  <p className="text-gray-500">Submitted: {label}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                          <Line 
                            type="monotone" 
                            dataKey="amount" 
                            stroke="#4f46e5" 
                            strokeWidth={3}
                            activeDot={{ r: 6 }} 
                          />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
            )}
            
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