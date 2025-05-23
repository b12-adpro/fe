'use client';

import { useEffect, useState } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';

type Notification = {
  id: number;
  title: string;
  message: string;
  createdAt: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://yielding-kendra-tk-adpro-12-72b281e5.koyeb.app/admin/notifications');
        
        if (!response.ok) {
          throw new Error('Gagal mengambil data notifikasi');
        }
        
        const data = await response.json();
        setNotifications(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil notifikasi');
      } finally {
        setLoading(false);
      }
    };
  
    fetchNotifications();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto p-6">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="h-6 w-6 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">Notifikasi Global</h1>
          </div>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
            {notifications.length} Notifikasi
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <span className="ml-2 text-gray-600">Memuat notifikasi...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md border border-red-200">
            <p className="text-red-700">{error}</p>
            <button 
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
              onClick={() => window.location.reload()}
            >
              Coba lagi
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Bell className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h2 className="text-xl font-medium text-gray-800 mb-2">Tidak ada notifikasi</h2>
            <p className="text-gray-600">Anda akan melihat notifikasi baru di sini ketika ada pembaruan penting.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-lg font-semibold text-gray-800">{notification.title}</h2>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{notification.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}