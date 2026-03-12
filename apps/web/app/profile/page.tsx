'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { authAPI } from '@/lib/api';
import { User, Mail, Phone, MapPin, Lock, Plus, Trash2, Edit2, Check, X, LogOut, Package, Heart, Settings } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const tabs = [
  { id: 'profile', label: 'Personal Info', icon: User },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'password', label: 'Password', icon: Lock },
];

export default function ProfilePage() {
  const { user, isAuthenticated, updateUser, logout } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPw, setSavingPw] = useState(false);

  // Address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({ fullName: '', phone: '', street: '', city: '', state: '', country: '', zipCode: '', isDefault: false });
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user) setProfileForm({ name: user.name || '', phone: user.phone || '' });
  }, [isAuthenticated, user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await authAPI.updateProfile(profileForm);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSavingProfile(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setSavingPw(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    finally { setSavingPw(false); }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      if (editingAddressId) {
        const { data } = await authAPI.updateAddress(editingAddressId, addressForm);
        updateUser({ addresses: data.addresses });
        toast.success('Address updated!');
      } else {
        const { data } = await authAPI.addAddress(addressForm);
        updateUser({ addresses: data.addresses });
        toast.success('Address added!');
      }
      setShowAddressForm(false);
      setEditingAddressId(null);
      setAddressForm({ fullName: '', phone: '', street: '', city: '', state: '', country: '', zipCode: '', isDefault: false });
    } catch { toast.error('Failed to save address'); }
    finally { setSavingAddress(false); }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    try {
      const { data } = await authAPI.deleteAddress(id);
      updateUser({ addresses: data.addresses });
      toast.success('Address deleted');
    } catch { toast.error('Failed to delete address'); }
  };

  const startEditAddress = (addr: any) => {
    setAddressForm({ fullName: addr.fullName, phone: addr.phone, street: addr.street, city: addr.city, state: addr.state, country: addr.country, zipCode: addr.zipCode, isDefault: addr.isDefault });
    setEditingAddressId(addr._id);
    setShowAddressForm(true);
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-500 text-sm">{user.email}</p>
            <span className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full mt-1 capitalize">{user.role}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/orders" className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-medium transition-colors">
            <Package className="w-4 h-4" /> Orders
          </Link>
          <button onClick={() => { logout(); router.push('/'); }} className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[{ icon: Package, label: 'Orders', href: '/orders', color: 'bg-blue-50 text-blue-600' },
          { icon: Heart, label: 'Wishlist', href: '/wishlist', color: 'bg-pink-50 text-pink-600' },
          { icon: MapPin, label: 'Addresses', href: '#', color: 'bg-green-50 text-green-600' }].map(({ icon: Icon, label, href, color }) => (
          <Link key={label} href={href} onClick={label === 'Addresses' ? (e) => { e.preventDefault(); setActiveTab('addresses'); } : undefined}
            className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-all">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}><Icon className="w-5 h-5" /></div>
            <span className="text-sm font-semibold text-gray-900">{label}</span>
          </Link>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors flex-1 justify-center ${activeTab === id ? 'text-gray-900 border-b-2 border-gray-900 bg-gray-50' : 'text-gray-500 hover:text-gray-700'}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Personal Info */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="max-w-lg space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={user.email} disabled
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
                </div>
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1 234 567 890"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
              </div>
              <button type="submit" disabled={savingProfile}
                className="bg-gray-900 text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                {savingProfile ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                Save Changes
              </button>
            </form>
          )}

          {/* Addresses */}
          {activeTab === 'addresses' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-gray-900">Saved Addresses</h3>
                <button onClick={() => { setShowAddressForm(true); setEditingAddressId(null); setAddressForm({ fullName: '', phone: '', street: '', city: '', state: '', country: '', zipCode: '', isDefault: false }); }}
                  className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors">
                  <Plus className="w-4 h-4" /> Add Address
                </button>
              </div>

              {showAddressForm && (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-5">
                  <h4 className="font-semibold text-gray-900 mb-4">{editingAddressId ? 'Edit Address' : 'New Address'}</h4>
                  <form onSubmit={handleSaveAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[{ key: 'fullName', label: 'Full Name', placeholder: 'John Doe' },
                      { key: 'phone', label: 'Phone', placeholder: '+1 234 567 890' },
                      { key: 'street', label: 'Street Address', placeholder: '123 Main St', full: true },
                      { key: 'city', label: 'City', placeholder: 'New York' },
                      { key: 'state', label: 'State', placeholder: 'NY' },
                      { key: 'country', label: 'Country', placeholder: 'United States' },
                      { key: 'zipCode', label: 'ZIP Code', placeholder: '10001' }].map(({ key, label, placeholder, full }) => (
                      <div key={key} className={full ? 'sm:col-span-2' : ''}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                        <input value={(addressForm as any)[key]} onChange={e => setAddressForm(p => ({ ...p, [key]: e.target.value }))}
                          placeholder={placeholder} required
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900 bg-white" />
                      </div>
                    ))}
                    <div className="sm:col-span-2 flex items-center gap-2">
                      <input type="checkbox" id="isDefault" checked={addressForm.isDefault} onChange={e => setAddressForm(p => ({ ...p, isDefault: e.target.checked }))} className="accent-gray-900" />
                      <label htmlFor="isDefault" className="text-sm text-gray-700">Set as default address</label>
                    </div>
                    <div className="sm:col-span-2 flex gap-3">
                      <button type="submit" disabled={savingAddress}
                        className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors">
                        {savingAddress ? 'Saving...' : 'Save Address'}
                      </button>
                      <button type="button" onClick={() => setShowAddressForm(false)}
                        className="border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {(!user.addresses || user.addresses.length === 0) && !showAddressForm ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No addresses saved yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.addresses?.map((addr: any) => (
                    <div key={addr._id} className={`relative border rounded-2xl p-4 ${addr.isDefault ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white'}`}>
                      {addr.isDefault && <span className="absolute top-3 right-3 text-xs bg-gray-900 text-white px-2 py-0.5 rounded-full">Default</span>}
                      <p className="font-semibold text-gray-900 text-sm mb-1">{addr.fullName}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{addr.street}<br />{addr.city}, {addr.state} {addr.zipCode}<br />{addr.country}</p>
                      <p className="text-xs text-gray-500 mt-1">{addr.phone}</p>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => startEditAddress(addr)} className="text-xs flex items-center gap-1 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button onClick={() => handleDeleteAddress(addr._id)} className="text-xs flex items-center gap-1 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Password */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="max-w-lg space-y-5">
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
                🔒 Choose a strong password with at least 6 characters
              </div>
              {[{ key: 'currentPassword', label: 'Current Password' }, { key: 'newPassword', label: 'New Password' }, { key: 'confirmPassword', label: 'Confirm New Password' }].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="password" value={(pwForm as any)[key]} onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))} required
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                </div>
              ))}
              <button type="submit" disabled={savingPw}
                className="bg-gray-900 text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                {savingPw ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                Update Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
