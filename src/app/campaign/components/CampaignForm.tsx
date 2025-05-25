'use client';
import { useState, useRef } from 'react';

interface CampaignFormData {
  judul: string;
  target: number;
  deskripsi: string;
  buktiPenggalanganDana: string;
  fundraiserId: string;
}

interface AddCampaignFormProps {
  onSuccess: () => void;
}

export default function AddCampaignForm({ onSuccess }: AddCampaignFormProps) {
  const [formData, setFormData] = useState<CampaignFormData>({
    judul: '',
    target: 0,
    deskripsi: '',
    buktiPenggalanganDana: '',
    fundraiserId: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    if (!formData.judul.trim()) {
      newErrors.judul = 'Judul kampanye wajib diisi';
    }
    if (formData.target <= 0) {
      newErrors.target = 'Target dana harus lebih besar dari 0';
    }
    if (!formData.deskripsi.trim()) {
      newErrors.deskripsi = 'Deskripsi kampanye wajib diisi';
    }
    if (!formData.fundraiserId.trim()) {
      newErrors.fundraiserId = 'Fundraiser ID wajib diisi';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'target' ? parseInt(value) || 0 : value
    }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const uploadFile = async (selectedFile: File): Promise<string | null> => {
      setUploading(true);
      setMessage({ text: '', type: '' });
      const uploadData = new FormData();
      uploadData.append('file', selectedFile);

      try {
          const response = await fetch('http://localhost:8080/api/campaign/upload/bukti', {
              method: 'POST',
              body: uploadData,
          });

          if (response.ok) {
              const fileUrl = await response.text();
              setMessage({ text: 'Bukti berhasil diunggah.', type: 'success' });
              return fileUrl;
          } else {
              setMessage({ text: 'Gagal mengunggah bukti.', type: 'error' });
              return null;
          }
      } catch (error) {
          console.error("Upload error:", error);
          setMessage({ text: 'Terjadi kesalahan saat mengunggah bukti.', type: 'error' });
          return null;
      } finally {
          setUploading(false);
      }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);

      const uploadedUrl = await uploadFile(selected);
      if (uploadedUrl) {
          setFormData(prev => ({ ...prev, buktiPenggalanganDana: uploadedUrl }));
      } else {
          setFile(null);
          setFormData(prev => ({ ...prev, buktiPenggalanganDana: '' }));
          if (fileInputRef.current) fileInputRef.current.value = '';
      }

    } else {
      setFile(null);
      setFormData(prev => ({ ...prev, buktiPenggalanganDana: '' }));
    }
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!validateForm() || uploading) {
      return;
    }
    setLoading(true);
    setMessage({ text: '', type: '' });

    const dataToSend = {
      judul: formData.judul,
      target: formData.target,
      deskripsi: formData.deskripsi,
      buktiPenggalanganDana: formData.buktiPenggalanganDana,
      fundraiserId: formData.fundraiserId,
      datetime: new Date().toISOString()
    };

    try {
      const response = await fetch('http://localhost:8080/api/campaign/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        setMessage({ text: `Kampanye berhasil dibuat!`, type: 'success' });
        setFormData({ judul: '', target: 0, deskripsi: '', buktiPenggalanganDana: '', fundraiserId: '' });
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onSuccess();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Gagal membuat kampanye.' }));
        setMessage({
           text: errorData.message || 'Gagal membuat kampanye',
           type: 'error'
         });
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      setMessage({
         text: 'Terjadi kesalahan saat membuat kampanye',
         type: 'error'
       });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success'
             ? 'bg-green-50 text-green-800 border border-green-200'
             : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}
      <div className="space-y-6">
        <div>
          <label htmlFor="fundraiserId" className="block text-sm font-medium text-gray-700 mb-1">
            Fundraiser ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="fundraiserId"
            name="fundraiserId"
            value={formData.fundraiserId}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.fundraiserId ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Masukkan UUID Fundraiser (misal: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11)"
          />
          {errors.fundraiserId && (
            <p className="mt-1 text-sm text-red-600">{errors.fundraiserId}</p>
          )}
        </div>
        <div>
          <label htmlFor="judul" className="block text-sm font-medium text-gray-700 mb-1">
            Judul Kampanye <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="judul"
            name="judul"
            value={formData.judul}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.judul ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Masukkan judul kampanye yang menarik"
          />
          {errors.judul && (
            <p className="mt-1 text-sm text-red-600">{errors.judul}</p>
          )}
        </div>
        <div>
          <label htmlFor="target" className="block text-sm font-medium text-gray-700 mb-1">
            Target Dana (Rp) <span className="text-red-500">*</span>
          </label>
           <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">Rp</span>
            </div>
            <input
              type="number"
              id="target"
              name="target"
              value={formData.target || ''}
              onChange={handleInputChange}
              min="1"
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.target ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
            />
          </div>
          {errors.target && (
            <p className="mt-1 text-sm text-red-600">{errors.target}</p>
          )}
        </div>
        <div>
          <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700 mb-1">
            Deskripsi Kampanye <span className="text-red-500">*</span>
          </label>
          <textarea
            id="deskripsi"
            name="deskripsi"
            value={formData.deskripsi}
            onChange={handleInputChange}
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical ${
              errors.deskripsi ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Jelaskan tentang kampanye Anda..."
          />
          {errors.deskripsi && (
            <p className="mt-1 text-sm text-red-600">{errors.deskripsi}</p>
          )}
        </div>
        <div>
          <label htmlFor="buktiPenggalanganDana" className="block text-sm font-medium text-gray-700 mb-1">
            Bukti Penggalangan Dana (Opsional)
          </label>
          <input
            type="file"
            id="buktiPenggalanganDana"
            name="buktiPenggalanganDana"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={uploading}
            className={`w-full px-3 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 ${
              errors.buktiPenggalanganDana ? 'border-red-500' : 'border-gray-300'
            }`}
            accept="image/*,application/pdf"
          />
          {errors.buktiPenggalanganDana && (
            <p className="mt-1 text-sm text-red-600">{errors.buktiPenggalanganDana}</p>
          )}
          {formData.buktiPenggalanganDana && (
              <p className="mt-1 text-xs text-green-600">Bukti diunggah: {formData.buktiPenggalanganDana.split('/').pop()}</p>
          )}
          {!formData.buktiPenggalanganDana && file && (
               <p className="mt-1 text-xs text-gray-500">File terpilih: {file.name}</p>
          )}
        </div>
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading || uploading}
            onClick={handleSubmit}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? 'Membuat...' : (uploading ? 'Mengunggah...' : 'Buat Kampanye')}
          </button>
        </div>
      </div>
    </>
  );
}