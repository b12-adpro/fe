"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Users, Target, Clock, Heart, MessageSquare, User, ArrowLeft } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.211.204.60';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDateOnly = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const StatusBadge = ({ status }) => {
  return (
    <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
      ✓ Selesai
    </span>
  );
};

const CampaignStatusBadge = ({ status }) => {
  const isActive = status === 'ACTIVE';
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
      isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    }`}>
      {isActive ? '🟢' : '🔴'} {status}
    </span>
  );
};

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.campaignId;
  
  const [campaign, setCampaign] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [donationsLoading, setDonationsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [donationsError, setDonationsError] = useState(null);

  const actualCollectedAmount = donations.reduce((sum, donation) => sum + donation.amount, 0);

  const uniqueDonorsCount = [...new Set(donations.map(donation => donation.donaturId))].length;

  const calculateProgress = () => {
    if (!campaign) return 0;
    return Math.min((actualCollectedAmount / campaign.target) * 100, 100);
  };

  const handleBackClick = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  useEffect(() => {
    if (!campaignId) return;
    
    const fetchCampaign = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/campaign/campaignId/${campaignId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const campaignData = await response.json();
        setCampaign(campaignData);
      } catch (err) {
        setError("Gagal memuat data kampanye. Silakan coba lagi nanti.");
        console.error("Error fetching campaign:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [campaignId]);

  useEffect(() => {
    if (!campaignId) return;
    
    const fetchDonations = async () => {
      setDonationsLoading(true);
      setDonationsError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/donations/campaigns/${campaignId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const donationsData = await response.json();

        const sortedDonations = donationsData.sort((a, b) => 
          new Date(b.datetime) - new Date(a.datetime)
        );

        setDonations(sortedDonations);
      } catch (err) {
        setDonationsError("Gagal memuat data donasi.");
        console.error("Error fetching donations:", err);
      } finally {
        setDonationsLoading(false);
      }
    };
    fetchDonations();
  }, [campaignId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data kampanye...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Title with Back Button */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={handleBackClick}
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mr-4 p-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft size={20} className="mr-1" />
                Kembali
              </button>
              <h1 className="text-3xl font-bold text-gray-800">Detail Kampanye</h1>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data kampanye...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg">
            <p>{error}</p>
          </div>
        ) : campaign ? (
          <>
            {/* Campaign Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{campaign.judul}</h2>
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <Calendar size={16} className="mr-2" />
                    <span>Dibuat pada {formatDateOnly(campaign.datetime)}</span>
                  </div>
                </div>
                <CampaignStatusBadge status={campaign.status} />
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">{campaign.deskripsi}</p>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress Donasi</span>
                  <span className="text-sm text-gray-600">{calculateProgress().toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>
              </div>

              {/* Campaign Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Target className="text-blue-600 mr-2" size={20} />
                    <span className="text-sm font-medium text-gray-700">Target</span>
                  </div>
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(campaign.target)}</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Heart className="text-green-600 mr-2" size={20} />
                    <span className="text-sm font-medium text-gray-700">Terkumpul</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(actualCollectedAmount)}</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Users className="text-purple-600 mr-2" size={20} />
                    <span className="text-sm font-medium text-gray-700">Donatur</span>
                  </div>
                  <p className="text-lg font-bold text-purple-600">{uniqueDonorsCount} orang</p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Clock className="text-orange-600 mr-2" size={20} />
                    <span className="text-sm font-medium text-gray-700">Sisa Waktu</span>
                  </div>
                  <p className="text-lg font-bold text-orange-600">{campaign.daysLeft} hari</p>
                </div>
              </div>
            </div>

            {/* Donations Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Daftar Donasi</h3>
                <div className="text-sm text-gray-600">
                  Total: {donations.length} donasi
                </div>
              </div>

              {donationsLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Memuat daftar donasi...</p>
                </div>
              ) : donationsError ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-3">{donationsError}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : donations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Belum ada donasi untuk kampanye ini.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {donations.map((donation) => (
                    <div 
                      key={donation.donationId} 
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <User size={20} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">Seseorang</p>
                            <p className="text-sm text-gray-500 flex items-center">
                              <Calendar size={12} className="mr-1" />
                              {formatDate(donation.datetime)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600 mb-1">
                            {formatCurrency(donation.amount)}
                          </p>
                          <StatusBadge status={donation.status} />
                        </div>
                      </div>

                      {donation.message && (
                        <div className="bg-blue-50 p-3 rounded-md">
                          <div className="flex items-start">
                            <MessageSquare size={16} className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                            <p className="text-gray-700 text-sm">{donation.message}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}