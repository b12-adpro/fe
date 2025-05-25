'use client';

import { useState, useEffect } from 'react';
import { Search, Bell, UserCheck, UserX, Trash2, FileText, RefreshCcw } from 'lucide-react';

interface UserDTO {
  id: string;
  name: string;
  role: 'FUNDRAISER' | 'DONATUR';
  blocked: boolean;
}

export default function UserTable() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [donationHistory, setDonationHistory] = useState<any[]>([]);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [selectedTab, setSelectedTab] = useState('users');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users`);
      const data = await res.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;
    
    // Apply role filter
    if (filterRole !== 'all') {
      result = result.filter(user => user.role === filterRole);
    }
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredUsers(result);
  }, [searchTerm, filterRole, users]);

  const handleBlock = async (id: string, status: boolean) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users/${id}/block?status=${status}`, { method: 'POST' });
      fetchUsers();
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Gagal memblokir user');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users/${id}`, { method: 'DELETE' });
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Gagal menghapus user');
      }
    }
  };

  const handleSendNotification = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: notifTitle, message: notifMessage }),
      });

      if (response.ok) {
        alert('Notifikasi berhasil dikirim!');
        setShowModal(false);
        setNotifTitle('');
        setNotifMessage('');
      } else {
        alert('Gagal mengirim notifikasi');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat mengirim notifikasi');
    }
  };

  const handleViewDonations = async (donaturId: string, userName: string) => {
    try {
      setSelectedUserName(userName);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/donation-history/donatur/${donaturId}`, { method: 'GET' });
      const data = await res.json();
      setDonationHistory(data);
      setShowDonationModal(true);
    } catch (error) {
      console.error('Gagal mengambil riwayat donasi:', error);
      alert('Gagal mengambil data donasi.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Memuat data pengguna...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6 border-b">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
          <li className="mr-2">
            <button 
              className={`inline-block p-4 rounded-t-lg ${selectedTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-gray-600 hover:border-gray-300'}`}
              onClick={() => setSelectedTab('users')}
            >
              Manajemen User
            </button>
          </li>
          <li className="mr-2">
            <button 
              className={`inline-block p-4 rounded-t-lg ${selectedTab === 'notifications' ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-gray-600 hover:border-gray-300'}`}
              onClick={() => setSelectedTab('notifications')}
            >
              Kirim Notifikasi
            </button>
          </li>
        </ul>
      </div>

      {selectedTab === 'notifications' ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Kirim Notifikasi ke Semua Pengguna</h2>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Judul Notifikasi</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={notifTitle}
              onChange={(e) => setNotifTitle(e.target.value)}
              placeholder="Masukkan judul notifikasi"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Pesan Notifikasi</label>
            <textarea
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
              value={notifMessage}
              onChange={(e) => setNotifMessage(e.target.value)}
              placeholder="Masukkan pesan notifikasi"
            />
          </div>
          <button
            onClick={handleSendNotification}
            disabled={!notifTitle || !notifMessage}
            className={`flex items-center justify-center w-full py-2 px-4 rounded-lg text-white ${!notifTitle || !notifMessage ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            <Bell size={18} className="mr-2" />
            Kirim Notifikasi
          </button>
        </div>
      ) : (
        <>
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
                <div className="flex items-center">
                <h2 className="text-xl font-semibold">Daftar Pengguna</h2>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                <div className="relative">
                    <input
                    type="text"
                    className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Cari pengguna..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
                
                <select
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                >
                    <option value="all">Semua Role</option>
                    <option value="FUNDRAISER">Fundraiser</option>
                    <option value="DONATUR">Donatur</option>
                </select>
                </div>
            </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-sm leading-normal">
                  <th className="py-3 px-4 text-left">Nama</th>
                  <th className="py-3 px-4 text-left">Role</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4">{user.name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'FUNDRAISER' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {user.blocked ? (
                          <span className="flex items-center text-red-600">
                            <UserX size={16} className="mr-1" /> Blocked
                          </span>
                        ) : (
                          <span className="flex items-center text-green-600">
                            <UserCheck size={16} className="mr-1" /> Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                            <button
                                onClick={() => handleBlock(user.id, !user.blocked)}
                                className={`px-3 py-1 rounded-md text-white text-xs flex items-center ${user.blocked ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                            >
                                {user.blocked ? (
                                <>
                                    <UserCheck size={14} className="mr-1" /> Unblock
                                </>
                                ) : (
                                <>
                                    <UserX size={14} className="mr-1" /> Block
                                </>
                                )}
                            </button>
                          
                            <button
                                onClick={() => handleViewDonations(user.id, user.name)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs flex items-center"
                            >
                                <FileText size={14} className="mr-1" /> Donasi
                            </button>
                          
                            <button
                                onClick={() => handleDelete(user.id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs flex items-center"
                            >
                            <Trash2 size={14} className="mr-1" /> Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      Tidak ada pengguna yang ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showDonationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Riwayat Donasi - {selectedUserName}
              </h3>
              <button 
                onClick={() => setShowDonationModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {donationHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 text-sm">
                      <th className="py-2 px-4 text-left">Kampanye</th>
                      <th className="py-2 px-4 text-right">Jumlah Donasi</th>
                      <th className="py-2 px-4 text-center">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donationHistory.map((donation, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{donation.campaignTitle}</td>
                        <td className="py-3 px-4 text-right font-medium text-green-600">
                          {formatCurrency(donation.amount)}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-500 text-sm">
                          {new Date(donation.date).toLocaleDateString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                Pengguna ini belum pernah melakukan donasi
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDonationModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}