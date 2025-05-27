"use client";
import { useState, useEffect } from 'react';
import { Clock, Target, Heart, History } from 'lucide-react';

const donaturId = "8f7d6543-2e1a-9c8b-7f6e-5d4c3b2a1001";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString));
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [donationMessage, setDonationMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch(`http://3.211.204.60/api/campaign/all`);
        if (!response.ok) {
          throw new Error('Failed to fetch campaigns');
        }
        const data = await response.json();
        setCampaigns(data);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        setError('Failed to load campaigns. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const openDonationModal = (campaign) => {
    setSelectedCampaign(campaign);
    setDonationAmount("");
    setDonationMessage("");
    setIsModalOpen(true);
    setSubmitResult(null);
  };

  const closeDonationModal = () => {
    setIsModalOpen(false);
    setSelectedCampaign(null);
    setTimeout(() => {
      setSubmitResult(null);
    }, 300);
  };

  const handleSubmitDonation = async () => {
    if (!donationAmount || parseInt(donationAmount) <= 0) return;

    setIsSubmitting(true);

    try {
      const donationData = {
        campaignId: selectedCampaign.campaignId,
        donaturId: donaturId,
        amount: parseInt(donationAmount),
        status: "COMPLETED",
        message: donationMessage,
      };

      const response = await fetch(`http://3.211.204.60/api/donations/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donationData),
      });

      if (response.ok) {
        await response.json();
        setSubmitResult({
          success: true,
          message: "Donasi berhasil! Terima kasih atas kebaikan Anda."
        });

        setCampaigns(prevCampaigns =>
          prevCampaigns.map(campaign =>
            campaign.campaignId === selectedCampaign.campaignId
              ? { ...campaign, collected: campaign.collected + parseInt(donationAmount) }
              : campaign
          )
        );
      } else {
        const errorData = await response.json();
        setSubmitResult({
          success: false,
          message: errorData.message || "Terjadi kesalahan saat memproses donasi."
        });
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message: "Gagal terhubung ke server. Silakan coba lagi nanti."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled = !donationAmount || parseInt(donationAmount) <= 0 || isSubmitting;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold">Platform Donasi Peduli</h1>
            <p className="mt-2">Bantu sesama dengan donasi untuk kampanye yang bermakna</p>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600">Memuat kampanye...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold">Platform Donasi Peduli</h1>
            <p className="mt-2">Bantu sesama dengan donasi untuk kampanye yang bermakna</p>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-red-600">{error}</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Platform Donasi Peduli</h1>
              <p className="mt-2">Bantu sesama dengan donasi untuk kampanye yang bermakna</p>
            </div>
            <button
              onClick={() => window.location.href = '/donation'}
              className="flex items-center space-x-2 bg-white text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
            >
              <History size={20} />
              <span>Lihat Riwayat Donasi</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Kampanye Terbaru</h2>
          
          {/* Mobile version of donation history button */}
          <button
            onClick={() => window.location.href = '/donation'}
            className="md:hidden flex items-center space-x-2 bg-blue-600 text-white hover:bg-blue-700 font-semibold py-2 px-3 rounded-lg transition-colors duration-300"
          >
            <History size={18} />
            <span className="text-sm">Riwayat</span>
          </button>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">Tidak ada kampanye tersedia saat ini.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {campaigns.map(campaign => (
              <div key={campaign.campaignId} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Campaign Status Badge */}
                <div className="p-4 pb-0">
                  <div className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {campaign.status}
                  </div>
                </div>

                {/* Campaign Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{campaign.judul}</h3>
                  <p className="text-gray-600 mb-4">{campaign.deskripsi}</p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Terkumpul {formatCurrency(campaign.collected)}</span>
                      <span className="text-gray-600">dari {formatCurrency(campaign.target)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, (campaign.collected / campaign.target) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Campaign Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="flex flex-col items-center p-2 bg-blue-50 rounded-lg">
                      <Heart size={20} className="text-red-500 mb-1" />
                      <span style={{ color: '#333' }} className="text-sm font-semibold">{campaign.donors}</span>
                      <span className="text-xs text-gray-600">Donatur</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-blue-50 rounded-lg">
                      <Target size={20} className="text-blue-500 mb-1" />
                      <span style={{ color: '#333' }} className="text-sm font-semibold">{Math.round((campaign.collected / campaign.target) * 100)}%</span>
                      <span className="text-xs text-gray-600">Tercapai</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-blue-50 rounded-lg">
                      <Clock size={20} className="text-green-500 mb-1" />
                      <span style={{ color: '#333' }} className="text-sm font-semibold">{campaign.daysLeft}</span>
                      <span className="text-xs text-gray-600">Hari lagi</span>
                    </div>
                  </div>

                  {/* Date Created */}
                  <div className="text-sm text-gray-500 mb-4">
                    Dibuat pada: {formatDate(campaign.datetime)}
                  </div>

                  {/* Donation Buttons */}
                  <div className="space-y-3">
                    <button 
                      onClick={() => openDonationModal(campaign)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded transition-colors duration-300"
                    >
                      Beri Donasi
                    </button>
                    
                    <button 
                      onClick={() => window.location.href = `/donation/campaigns/${campaign.campaignId}`}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded transition-colors duration-300 border border-gray-300"
                    >
                      Informasi Selengkapnya
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Donation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <button 
            className="absolute inset-0 bg-black/50 pointer-events-auto" 
            onClick={closeDonationModal}
          ></button>

          {/* Modal */}
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 z-10">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Donasi untuk "{selectedCampaign?.judul}"</h3>

              {submitResult ? (
                <div className={`p-4 mb-4 rounded-lg ${submitResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {submitResult.message}
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Jumlah Donasi (Rp) *
                    </label>
                    <input
                      type="number"
                      id="amount"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Masukkan jumlah donasi"
                      min="1"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Pesan (Opsional)
                    </label>
                    <textarea
                      id="message"
                      value={donationMessage}
                      onChange={(e) => setDonationMessage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Tulis pesan untuk kampanye ini"
                      rows={3}
                    ></textarea>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeDonationModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  {submitResult ? 'Tutup' : 'Batal'}
                </button>

                {!submitResult && (
                  <button
                    onClick={handleSubmitDonation}
                    className={`px-4 py-2 rounded-md font-medium ${
                      isButtonDisabled
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    disabled={isButtonDisabled}
                  >
                    {isSubmitting ? 'Memproses...' : 'Konfirmasi'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}