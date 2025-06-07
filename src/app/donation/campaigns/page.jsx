"use client";
import { useState, useEffect, useCallback } from 'react';
import { Clock, Target, Heart, History, LogIn } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.211.204.60';

const formatCurrency = (amount) => {
  if (amount == null || isNaN(amount)) return 'Rp 0';
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return 'Tanggal tidak tersedia';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Tanggal tidak valid';
  
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const validateDonationAmount = (amount) => {
  const parsed = Number(amount);
  if (isNaN(parsed) || parsed <= 0) {
    return { isValid: false, error: 'Jumlah donasi harus berupa angka positif' };
  }
  if (parsed > 1000000000) {
    return { isValid: false, error: 'Jumlah donasi terlalu besar' };
  }
  return { isValid: true, error: null };
};

const sanitizeMessage = (message) => {
  if (!message) return '';
  return message.replace(/<[^>]*>/g, '').trim().substring(0, 500);
};

export default function CampaignsPage() {
  const { user, isAuthenticated, initialAuthCheckComplete } = useAuth();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [donationMessage, setDonationMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const donaturId = user?.id;

  const fetchCampaigns = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/campaign/all`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status >= 500) {
          throw new Error('Server sedang bermasalah. Silakan coba lagi nanti.');
        }
        throw new Error(`HTTP ${response.status}: Gagal memuat kampanye`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Format data kampanye tidak valid');
      }

      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setError(error.message || 'Failed to load campaigns. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const openDonationModal = (campaign) => {
    if (!initialAuthCheckComplete) {
      return;
    }
    
    if (!isAuthenticated || !donaturId) {
      setShowLoginPrompt(true);
      return;
    }
    
    setSelectedCampaign(campaign);
    setDonationAmount("");
    setDonationMessage("");
    setValidationError(null);
    setIsModalOpen(true);
    setSubmitResult(null);
  };

  const closeDonationModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedCampaign(null);
    setSubmitResult(null);
    setValidationError(null);
    setShowLoginPrompt(false);
  }, []);

  const handleSubmitDonation = async () => {
    const amountValidation = validateDonationAmount(donationAmount);
    if (!amountValidation.isValid) {
      setValidationError(amountValidation.error);
      return;
    }

    if (!isAuthenticated || !donaturId) {
      setValidationError('Anda harus login untuk melakukan donasi');
      return;
    }

    if (!selectedCampaign) {
      setValidationError('Kampanye tidak valid');
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    try {
      const donationData = {
        campaignId: selectedCampaign.campaignId,
        donaturId: donaturId,
        amount: Number(donationAmount),
        status: "COMPLETED",
        message: sanitizeMessage(donationMessage),
      };

      const response = await fetch(`${API_BASE_URL}/api/donations/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
              ? { 
                  ...campaign, 
                  collected: (campaign.collected || 0) + Number(donationAmount),
                  donors: (campaign.donors || 0) + 1
                }
              : campaign
          )
        );
      } else {
        let errorMessage = "Terjadi kesalahan saat memproses donasi.";

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Error parsing response as JSON:', e);
        }

        if (response.status === 401) {
          errorMessage = "Sesi telah berakhir. Silakan login kembali.";
        } else if (response.status === 403) {
          errorMessage = "Anda tidak memiliki akses untuk melakukan donasi.";
        } else if (response.status >= 500) {
          errorMessage = "Server sedang bermasalah. Silakan coba lagi nanti.";
        }
        
        setSubmitResult({
          success: false,
          message: errorMessage
        });
      }
    } catch (error) {
      console.error('Donation submission error:', error);
      setSubmitResult({
        success: false,
        message: "Gagal terhubung ke server. Silakan coba lagi nanti."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled = !donationAmount || 
                           !validateDonationAmount(donationAmount).isValid || 
                           isSubmitting || 
                           !isAuthenticated;

  const handleNavigateToHistory = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    router.push('/donation');
  };

  const handleNavigateToCampaignDetail = (campaignId) => {
    router.push(`/donation/campaigns/${campaignId}`);
  };

  const handleNavigateToLogin = () => {
    router.push('/auth/login');
  };

  if (!initialAuthCheckComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600">Memuat...</div>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
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
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col justify-center items-center h-64">
            <div className="text-xl text-red-600 mb-4">{error}</div>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchCampaigns();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-300"
            >
              Coba Lagi
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Title and Action Buttons */}
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Daftar Kampanye</h1>

          {/* Action buttons */}
          <div className="flex space-x-3">
            {isAuthenticated && (
              <button
                onClick={handleNavigateToHistory}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
              >
                <History size={20} />
                <span className="hidden sm:inline">Lihat Riwayat Donasi</span>
                <span className="sm:hidden">Riwayat</span>
              </button>
            )}
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-gray-600 mb-6">Bantu sesama dengan donasi untuk kampanye yang bermakna.</p>

        {/* Authentication status info */}
        {!isAuthenticated && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <LogIn size={20} className="text-yellow-600" />
              <div>
                <p className="text-yellow-800 font-medium">Anda belum login</p>
                <p className="text-yellow-700 text-sm">
                  Silakan login untuk dapat memberi donasi dan melihat riwayat donasi Anda.
                </p>
              </div>
            </div>
          </div>
        )}

        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">Tidak ada kampanye tersedia saat ini.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {campaigns.map(campaign => {
              const progressPercentage = (campaign.target && campaign.target > 0) 
                ? Math.min(100, ((campaign.collected || 0) / campaign.target) * 100)
                : 0;

              const safeCampaign = {
                campaignId: campaign.campaignId,
                judul: campaign.judul || 'Judul tidak tersedia',
                deskripsi: campaign.deskripsi || 'Deskripsi tidak tersedia',
                status: campaign.status || 'AKTIF',
                collected: campaign.collected || 0,
                target: campaign.target || 0,
                donors: campaign.donors || 0,
                daysLeft: campaign.daysLeft || 0,
                datetime: campaign.datetime
              };

              return (
                <div key={safeCampaign.campaignId} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Campaign Status Badge */}
                  <div className="p-4 pb-0">
                    <div className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {safeCampaign.status}
                    </div>
                  </div>

                  {/* Campaign Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{safeCampaign.judul}</h3>
                    <p className="text-gray-600 mb-4">{safeCampaign.deskripsi}</p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Terkumpul {formatCurrency(safeCampaign.collected)}</span>
                        <span className="text-gray-600">dari {formatCurrency(safeCampaign.target)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Campaign Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      <div className="flex flex-col items-center p-2 bg-blue-50 rounded-lg">
                        <Heart size={20} className="text-red-500 mb-1" />
                        <span style={{ color: '#333' }} className="text-sm font-semibold">{safeCampaign.donors}</span>
                        <span className="text-xs text-gray-600">Donatur</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-blue-50 rounded-lg">
                        <Target size={20} className="text-blue-500 mb-1" />
                        <span style={{ color: '#333' }} className="text-sm font-semibold">{Math.round(progressPercentage)}%</span>
                        <span className="text-xs text-gray-600">Tercapai</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-blue-50 rounded-lg">
                        <Clock size={20} className="text-green-500 mb-1" />
                        <span style={{ color: '#333' }} className="text-sm font-semibold">{safeCampaign.daysLeft}</span>
                        <span className="text-xs text-gray-600">Hari lagi</span>
                      </div>
                    </div>

                    {/* Date Created */}
                    <div className="text-sm text-gray-500 mb-4">
                      Dibuat pada {formatDate(safeCampaign.datetime)}
                    </div>

                    {/* Donation Buttons */}
                    <div className="space-y-3">
                      {isAuthenticated && (
                        <div className="space-y-3">
                          <button 
                            onClick={() => openDonationModal(safeCampaign)}
                            className="w-full font-semibold py-3 px-4 rounded transition-colors duration-300 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Beri Donasi
                          </button>
                        </div>
                      )}
                      <button 
                        onClick={() => handleNavigateToCampaignDetail(safeCampaign.campaignId)}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded transition-colors duration-300 border border-gray-300"
                      >
                        Informasi Selengkapnya
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-prompt-title"
        >
          <button 
            className="absolute inset-0 bg-black/50 pointer-events-auto" 
            onClick={() => setShowLoginPrompt(false)}
            aria-label="Tutup modal"
          ></button>

          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 z-10">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <LogIn size={48} className="text-blue-600" />
              </div>
              <h3 
                id="login-prompt-title"
                className="text-xl font-bold mb-4 text-gray-900 text-center"
              >
                Login Diperlukan
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Anda perlu login terlebih dahulu untuk melakukan atau melihat riwayat donasi.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  Batal
                </button>
                <button
                  onClick={handleNavigateToLogin}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors duration-200"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Donation Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="donation-modal-title"
        >
          <button 
            className="absolute inset-0 bg-black/50 pointer-events-auto" 
            onClick={closeDonationModal}
            aria-label="Tutup modal"
          ></button>

          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 z-10">
            <div className="p-6">
              <h3 
                id="donation-modal-title"
                className="text-xl font-bold mb-4 text-gray-900"
              >
                Donasi untuk "{selectedCampaign?.judul}"
              </h3>

              {submitResult ? (
                <div className={`p-4 mb-4 rounded-lg ${submitResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {submitResult.message}
                </div>
              ) : (
                <>
                  {validationError && (
                    <div className="p-4 mb-4 rounded-lg bg-red-100 text-red-800">
                      {validationError}
                    </div>
                  )}

                  <div className="mb-4">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Jumlah Donasi (Rp) *
                    </label>
                    <input
                      type="number"
                      id="amount"
                      value={donationAmount}
                      onChange={(e) => {
                        setDonationAmount(e.target.value);
                        setValidationError(null);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Masukkan jumlah donasi"
                      min="1"
                      max="1000000000"
                      required
                      aria-describedby="amount-help"
                    />
                    <div id="amount-help" className="text-xs text-gray-500 mt-1">
                      Minimal Rp 1, maksimal Rp 1.000.000.000
                    </div>
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
                      maxLength={500}
                      aria-describedby="message-help"
                    ></textarea>
                    <div id="message-help" className="text-xs text-gray-500 mt-1">
                      Maksimal 500 karakter ({donationMessage.length}/500)
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeDonationModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  {submitResult ? 'Tutup' : 'Batal'}
                </button>

                {!submitResult && (
                  <button
                    onClick={handleSubmitDonation}
                    className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
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