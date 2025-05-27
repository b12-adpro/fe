'use client';

import { useState, useEffect } from 'react';

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

interface EditCampaignFormProps {
  campaignData: CampaignDTO;
  onSuccess: () => void;
}

interface UpdateCampaignFormData {
  judul: string;
  target: number;
  deskripsi: string;
  buktiPenggalanganDana: string;
}

export default function EditCampaignForm({ campaignData, onSuccess }: EditCampaignFormProps) {
  const [formData, setFormData] = useState<UpdateCampaignFormData>({
    judul: '',
    target: 0,
    deskripsi: '',
    buktiPenggalanganDana: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (campaignData) {
      setFormData({
        judul: campaignData.judul,
        target: campaignData.target,
        deskripsi: campaignData.deskripsi,
        buktiPenggalanganDana: campaignData.buktiPenggalanganDana || ''
      });
    }
  }, [campaignData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'target' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
        const response = await fetch(`http://3.211.204.60/api/campaign/${campaignData.campaignId}/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                judul: formData.judul,
                target: formData.target,
                deskripsi: formData.deskripsi,
                buktiPenggalanganDana: formData.buktiPenggalanganDana,
            })
        });
          

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Gagal mengupdate kampanye: ${text}`);
      }

      setSuccessMessage('Kampanye berhasil diupdate!');
      
      setTimeout(() => {
        onSuccess();
      }, 1000);

    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengupdate kampanye');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (typeof amount !== 'number') return 'Rp0';
    return amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
  };

  return (
    <div>
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-800 mb-2">Informasi Kampanye</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">ID Kampanye:</span>
            <span className="ml-2 font-medium">{campaignData.campaignId}</span>
          </div>
          <div>
            <span className="text-gray-600">Status:</span>
            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
              campaignData.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
              campaignData.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {campaignData.status}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Dana Terkumpul:</span>
            <span className="ml-2 font-medium">
              {formatCurrency(campaignData.currentAmount)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Dibuat:</span>
            <span className="ml-2 font-medium">
              {new Date(campaignData.datetime).toLocaleDateString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="judul" className="block text-sm font-medium text-gray-700 mb-2">
            Judul Kampanye *
          </label>
          <input
            type="text"
            id="judul"
            name="judul"
            value={formData.judul}
            onChange={handleInputChange}
            required
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
            placeholder="Masukkan judul kampanye"
          />
        </div>

        <div>
          <label htmlFor="target" className="block text-sm font-medium text-gray-700 mb-2">
            Target Dana (IDR) *
          </label>
          <input
            type="number"
            id="target"
            name="target"
            value={formData.target}
            onChange={handleInputChange}
            required
            min="1"
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
            placeholder="Masukkan target dana"
          />
        </div>

        <div>
          <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700 mb-2">
            Deskripsi *
          </label>
          <textarea
            id="deskripsi"
            name="deskripsi"
            value={formData.deskripsi}
            onChange={handleInputChange}
            required
            rows={4}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
            placeholder="Jelaskan tujuan kampanye Anda"
          />
        </div>

        <div>
          <label htmlFor="buktiPenggalanganDana" className="block text-sm font-medium text-gray-700 mb-2">
            Bukti Penggalangan Dana (URL)
          </label>
          <input
            type="url"
            id="buktiPenggalanganDana"
            name="buktiPenggalanganDana"
            value={formData.buktiPenggalanganDana}
            onChange={handleInputChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
            placeholder="https://example.com/bukti-penggalangan"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Mengupdate...' : 'Update Kampanye'}
          </button>
        </div>
      </form>
    </div>
  );
}
