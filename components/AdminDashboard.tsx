
import React, { useState, useEffect, useMemo } from 'react';
import { User, ServiceRequest, ServiceCategory, PlatformContent, Withdrawal, CategoryItem, FeeRequest } from '../types';
import { Badge, StatCard, StarRating, useLanguage, useCurrency, ChatModal } from './Shared';
import { Users, Briefcase, Activity, TrendingUp, Plus, X, Search, MapPin, DollarSign, Mail, Save, Trash2, Edit2, Filter, Calendar, User as UserIcon, Clock, CheckCircle, XCircle, CreditCard, Receipt, FileText, ShieldCheck, Lock, Phone, Globe, HelpCircle, BellRing, HandCoins, MessageSquare, Send, AlertTriangle, ExternalLink } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

interface Props {
  currentUser: User;
  users: User[];
  bookings: ServiceRequest[];
  currentView: string;
  onAddProvider: (provider: Omit<User, 'id' | 'rating' | 'jobsCompleted'>) => void;
  platformContent?: PlatformContent;
  onUpdateContent?: (content: PlatformContent) => void;
  onProcessWithdrawal?: (withdrawalId: string, action: 'APPROVE' | 'REJECT', amount?: number) => void;
  serviceCategories: CategoryItem[];
  onAddCategory: (category: Omit<CategoryItem, 'id'>) => void;
  onUpdateCategory?: (category: CategoryItem) => void;
  onDeleteCategory: (categoryId: string) => void;
  onRequestFee?: (providerId: string, feeId: string) => void;
  onMarkFeePaid?: (providerId: string, feeId: string, status: 'PAID' | 'REJECTED') => void;
  onAdminSendMessageToUser: (userId: string, message: string) => void;
  onSendMessage: (bookingId: string, text: string) => void;
}

const PLATFORM_FEE_FLAT = 5;

const AddProviderModal: React.FC<{ isOpen: boolean, onClose: () => void, onSubmit: (d: any) => void, categories: CategoryItem[] }> = ({ isOpen, onClose, onSubmit, categories }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({ name: '', email: '', category: categories[0]?.name || 'cat_general', hourlyRate: 50, address: '', bio: '', phone: '' });

    if (!isOpen) return null;
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit({ ...formData, role: 'PROVIDER' }); onClose(); };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 animate-scale-in border dark:border-gray-700">
                <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('add_provider')}</h3><button onClick={onClose} className="text-gray-500 dark:text-gray-400"><X size={20} /></button></div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input required placeholder={t('full_name')} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
                    <div className="grid grid-cols-2 gap-4">
                        <input required type="email" placeholder={t('email')} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
                        <input required type="tel" placeholder={t('phone')} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
                    </div>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg">{categories.map(c => <option key={c.id} value={c.name}>{t(c.name)}</option>)}</select>
                    <input required type="number" placeholder={`${t('rate_service')} (€)`} value={formData.hourlyRate} onChange={e => setFormData({...formData, hourlyRate: Number(e.target.value)})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
                    <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700">{t('submit')}</button>
                </form>
            </div>
        </div>
    );
}

const EditCategoryModal: React.FC<{ isOpen: boolean, onClose: () => void, category: CategoryItem | null, onSave: (c: CategoryItem) => void }> = ({ isOpen, onClose, category, onSave }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState<CategoryItem | null>(null);

    useEffect(() => { setFormData(category); }, [category]);

    if (!isOpen || !formData) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-scale-in border dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('edit_category')}</h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('name')}</label>
                        <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('icon')}</label>
                        <input required value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('base_price')} (€)</label>
                        <input required type="number" min="0" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: Number(e.target.value)})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
                    </div>
                    <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700">{t('save')}</button>
                </form>
            </div>
        </div>
    );
}

const AdminMessageModal: React.FC<{ isOpen: boolean, onClose: () => void, user: User | null, onSend: (userId: string, msg: string) => void }> = ({ isOpen, onClose, user, onSend }) => {
    const { t } = useLanguage();
    const [message, setMessage] = useState('');

    if (!isOpen || !user) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            onSend(user.id, message);
            setMessage('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6 animate-scale-in border dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-indigo-500" />
                        {t('compose_message')}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:text-gray-700"><X size={20} /></button>
                </div>
                <div className="mb-4 flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <img src={user.avatarUrl} className="w-10 h-10 rounded-full" alt="" />
                    <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea 
                        required
                        rows={4}
                        placeholder="..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all">
                        <Send size={18} /> {t('send_message')}
                    </button>
                </form>
            </div>
        </div>
    );
}

export const AdminDashboard: React.FC<Props> = ({ currentUser, users, bookings, currentView, onAddProvider, platformContent, onUpdateContent, onProcessWithdrawal, serviceCategories, onAddCategory, onUpdateCategory, onDeleteCategory, onRequestFee, onMarkFeePaid, onAdminSendMessageToUser, onSendMessage }) => {
  const { t } = useLanguage();
  const { formatPrice, currency, convertPrice } = useCurrency();
  
  // --- All Hooks must be at the top level ---
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [editedContent, setEditedContent] = useState<PlatformContent | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '🔧', basePrice: 50 });
  const [bookingFilter, setBookingFilter] = useState<ServiceRequest['status'] | 'ALL'>('ALL');
  
  // Store adjustedAmounts in the DISPLAY currency for easier editing, convert on submit
  const [adjustedAmounts, setAdjustedAmounts] = useState<Record<string, number>>({});
  
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [userToMessage, setUserToMessage] = useState<User | null>(null);
  const [activeBookingChat, setActiveBookingChat] = useState<ServiceRequest | null>(null);

  useEffect(() => { 
    if (platformContent && !editedContent) {
      setEditedContent(platformContent); 
    }
  }, [platformContent, editedContent]);

  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthLabel = d.toLocaleString('default', { month: 'short' });
        const monthBookings = bookings.filter(b => {
            const bDate = new Date(b.date);
            return bDate.getMonth() === d.getMonth() && bDate.getFullYear() === d.getFullYear();
        });
        const revenue = monthBookings.filter(b => b.paymentStatus === 'PAID').length * PLATFORM_FEE_FLAT;
        data.push({ name: monthLabel, revenue: convertPrice(revenue), count: monthBookings.length });
    }
    return data;
  }, [bookings, convertPrice]);

  // --- Handlers ---
  const handleSaveContent = () => { if (editedContent && onUpdateContent) onUpdateContent(editedContent); };
  const handleAdjustAmount = (id: string, val: string) => {
      const num = parseFloat(val) || 0;
      setAdjustedAmounts(prev => ({ ...prev, [id]: num }));
  };

  const handleProcessWithdrawalWrapper = (withdrawalId: string, action: 'APPROVE' | 'REJECT', amountInDisplay?: number) => {
    if (!onProcessWithdrawal) return;
    
    let amountInEur: number | undefined = undefined;
    if (amountInDisplay !== undefined) {
        // Convert back to EUR for backend logic
        amountInEur = currency === 'ALL' ? amountInDisplay / 100 : amountInDisplay;
    }
    
    onProcessWithdrawal(withdrawalId, action, amountInEur);
    // Clear adjusted amount for this item
    const newAdjusted = { ...adjustedAmounts };
    delete newAdjusted[withdrawalId];
    setAdjustedAmounts(newAdjusted);
  };

  // --- Derived Data ---
  const totalUsers = users.length;
  const totalBookings = bookings.length;
  const activeJobsCount = bookings.filter(b => b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS').length;
  
  const allFeeRequests = users
    .flatMap(u => (u.feeRequests || []).map(fr => ({ ...fr, providerName: u.name })))
    .filter(fr => fr.status !== 'PAID')
    .sort((a, b) => {
        if (a.status === 'VERIFYING' && b.status !== 'VERIFYING') return -1;
        if (a.status !== 'VERIFYING' && b.status === 'VERIFYING') return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  
  const totalUnpaidCashFees = allFeeRequests
    .filter(fr => fr.status !== 'REJECTED')
    .reduce((acc, fr) => acc + (fr.amount || 0), 0);

  const totalPlatformRevenue = bookings
    .filter(b => b.paymentStatus === 'PAID').length * PLATFORM_FEE_FLAT;

  // --- View Rendering ---
  
  if (currentView === 'dashboard') {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label={t('total_users')} value={totalUsers} icon={Users} color="bg-indigo-500" />
                <StatCard label={t('total_bookings')} value={totalBookings} icon={Briefcase} color="bg-blue-500" />
                <StatCard label={t('active_jobs')} value={activeJobsCount} icon={Activity} color="bg-orange-500" />
                <StatCard label={t('revenue_commissions')} value={formatPrice(totalPlatformRevenue)} icon={TrendingUp} color="bg-emerald-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Revenue Growth</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => currency === 'ALL' ? `${v}L` : `€${v}`} />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const val = payload[0]?.value ?? 0;
                                            const prefix = currency === 'EUR' ? '€' : '';
                                            const suffix = currency === 'ALL' ? ' L' : '';
                                            return (
                                                <div className="bg-gray-900 text-white p-3 rounded-lg shadow-xl text-xs">
                                                    <p className="font-bold mb-1">{label}</p>
                                                    <p className="text-emerald-400">Revenue: {prefix}{val.toLocaleString()}{suffix}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="revenue" fill="#6366F1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('recent_bookings')}</h3>
                    <div className="space-y-4">
                        {bookings.slice(0, 5).map(b => (
                            <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300">
                                        {b.category[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold dark:text-white">{t(b.category)}</p>
                                        <p className="text-xs text-gray-500">{b.customerName}</p>
                                    </div>
                                </div>
                                <Badge status={b.status} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
  }

  if (currentView === 'users') {
    const filteredUsers = users.filter(u => 
        (u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())) &&
        (selectedCategoryFilter === 'ALL' || u.role === selectedCategoryFilter)
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('user_management')}</h2>
                <button onClick={() => setShowAddProvider(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"><Plus size={18} /> {t('add_provider')}</button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" placeholder="..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <select value={selectedCategoryFilter} onChange={e => setSelectedCategoryFilter(e.target.value)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500">
                    <option value="ALL">All Roles</option>
                    <option value="CUSTOMER">Customers</option>
                    <option value="PROVIDER">Providers</option>
                    <option value="ADMIN">Admins</option>
                </select>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            <tr>
                                <th className="px-6 py-4">{t('user')}</th>
                                <th className="px-6 py-4">{t('role')}</th>
                                <th className="px-6 py-4">Contact Details</th>
                                <th className="px-6 py-4">{t('details')}</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredUsers.map(u => (
                                <tr key={u.id} className="dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={u.avatarUrl} className="w-10 h-10 rounded-full" alt="" />
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white">{u.name}</div>
                                                <div className="text-xs text-gray-500">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><Badge status={u.role} /></td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            {u.phone && (
                                                <a href={`tel:${u.phone}`} className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                                                    <Phone size={14} />
                                                    {u.phone}
                                                </a>
                                            )}
                                            <a href={`mailto:${u.email}`} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:underline text-xs">
                                                <Mail size={14} />
                                                {u.email}
                                            </a>
                                            {u.address && (
                                                <div className="flex items-start gap-2 text-gray-400 text-[11px] leading-tight">
                                                    <MapPin size={14} className="shrink-0" />
                                                    {u.address}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {u.role === 'PROVIDER' ? (
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-medium px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 w-fit">{t(u.category || 'cat_general')}</span>
                                                <div className="flex items-center gap-1.5"><StarRating rating={u.rating || 0} size={12} /> <span className="text-xs text-gray-500">({u.jobsCompleted} jobs)</span></div>
                                            </div>
                                        ) : <span className="text-gray-400">-</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setUserToMessage(u)} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors" title="Send Internal Message"><MessageSquare size={18} /></button>
                                            {u.phone && (
                                                <a href={`tel:${u.phone}`} className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-full transition-colors" title="Call User"><Phone size={18} /></a>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <AddProviderModal isOpen={showAddProvider} onClose={() => setShowAddProvider(false)} onSubmit={onAddProvider} categories={serviceCategories} />
            <AdminMessageModal isOpen={!!userToMessage} onClose={() => setUserToMessage(null)} user={userToMessage} onSend={onAdminSendMessageToUser} />
        </div>
    );
  }

  if (currentView === 'services') {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('service_management')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4"><Plus size={24} /></div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">{t('add_category')}</h3>
                    <div className="w-full space-y-3">
                        <input placeholder={t('name')} value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
                        <div className="grid grid-cols-2 gap-3">
                            <input placeholder={t('icon')} value={newCategory.icon} onChange={e => setNewCategory({...newCategory, icon: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
                            <input type="number" placeholder={t('base_price')} value={newCategory.basePrice} onChange={e => setNewCategory({...newCategory, basePrice: Number(e.target.value)})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
                        </div>
                        <button onClick={() => { if(newCategory.name) { onAddCategory(newCategory); setNewCategory({name: '', icon: '🔧', basePrice: 50}); } }} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors">{t('confirm')}</button>
                    </div>
                </div>

                {serviceCategories.map(cat => (
                    <div key={cat.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">{cat.icon}</div>
                            <div className="flex gap-1">
                                <button onClick={() => { setEditingCategory(cat); setShowEditCategoryModal(true); }} className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"><Edit2 size={16} /></button>
                                <button onClick={() => onDeleteCategory(cat.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{t(cat.name)}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('base_price')}: {formatPrice(cat.basePrice)}/hr</p>
                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                           {users.filter(u => u.category === cat.name).length} Providers Registered
                        </div>
                    </div>
                ))}
            </div>
            <EditCategoryModal isOpen={showEditCategoryModal} onClose={() => setShowEditCategoryModal(false)} category={editingCategory} onSave={(c) => onUpdateCategory && onUpdateCategory(c)} />
        </div>
    );
  }

  if (currentView === 'finance') {
    const allWithdrawals = users.flatMap(u => u.withdrawals || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const paidBookings = bookings.filter(b => b.paymentStatus === 'PAID').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleRequestAllFees = () => {
        allFeeRequests.filter(fr => fr.status === 'PENDING').forEach(fr => {
            if (onRequestFee) onRequestFee(fr.providerId, fr.id);
        });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nav_finance')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp size={24} className="text-white" />
                        <h3 className="text-lg font-semibold text-emerald-100">{t('revenue_commissions')}</h3>
                    </div>
                    <p className="text-4xl font-bold">{formatPrice(totalPlatformRevenue)}</p>
                 </div>
                 <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                     <div className="flex items-center gap-3 mb-2">
                        <Receipt size={24} className="text-indigo-500" />
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">{t('transactions')}</h3>
                     </div>
                     <p className="text-4xl font-bold text-gray-900 dark:text-white">{paidBookings.length}</p>
                 </div>
                 <div className={`rounded-xl p-6 shadow-sm border transition-colors ${totalUnpaidCashFees > 0 ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                     <div className="flex items-center gap-3 mb-2">
                        <HandCoins size={24} className={totalUnpaidCashFees > 0 ? 'text-orange-500' : 'text-gray-400'} />
                        <h3 className={`text-lg font-semibold ${totalUnpaidCashFees > 0 ? 'text-orange-700 dark:text-orange-300' : 'text-gray-600 dark:text-gray-300'}`}>{t('total_owed')}</h3>
                     </div>
                     <p className={`text-4xl font-bold ${totalUnpaidCashFees > 0 ? 'text-orange-600' : 'text-gray-900 dark:text-white'}`}>{formatPrice(totalUnpaidCashFees)}</p>
                 </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Transaction Log */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[500px]">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <CreditCard size={18} className="text-green-500" /> {t('transactions')}
                        </h3>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4">{t('paid_by')}</th>
                                    <th className="px-6 py-4">{t('total_amount')}</th>
                                    <th className="px-6 py-4">{t('commission')}</th>
                                    <th className="px-6 py-4">{t('net_amount')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {paidBookings.map(b => (
                                    <tr key={b.id} className="dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">{b.customerName}</div>
                                            <div className="text-xs text-gray-500">to {b.providerName}</div>
                                            <div className="text-xs text-gray-400 mt-0.5">{new Date(b.date).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{formatPrice(b.price)}</td>
                                        <td className="px-6 py-4 text-emerald-600 font-medium">+{formatPrice(PLATFORM_FEE_FLAT)}</td>
                                        <td className="px-6 py-4 text-indigo-600">{formatPrice(b.price - PLATFORM_FEE_FLAT)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Withdrawal Requests */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[500px]">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('withdrawal_requests')}</h3>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4">Provider</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {allWithdrawals.map(w => {
                                    const displayedValue = adjustedAmounts[w.id] ?? convertPrice(w.amount);
                                    return (
                                    <tr key={w.id} className="dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{w.providerName}</div>
                                            <div className="text-xs text-gray-500">{new Date(w.date).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {w.status === 'PENDING' ? (
                                                <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 px-2 py-1 max-w-[120px]">
                                                    <span className="text-gray-400 text-xs">{currency === 'EUR' ? '€' : 'L'}</span>
                                                    <input 
                                                        type="number" 
                                                        className="w-full bg-transparent text-sm font-bold focus:outline-none dark:text-white"
                                                        value={displayedValue}
                                                        onChange={(e) => handleAdjustAmount(w.id, e.target.value)}
                                                    />
                                                </div>
                                            ) : (
                                                <span className="font-bold">{formatPrice(w.amount)}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4"><Badge status={w.status} /></td>
                                        <td className="px-6 py-4">
                                            {w.status === 'PENDING' && onProcessWithdrawal && (
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => handleProcessWithdrawalWrapper(w.id, 'APPROVE', adjustedAmounts[w.id] ?? convertPrice(w.amount))} 
                                                        title="Approve (with current amount)"
                                                        className="p-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                                    >
                                                        <CheckCircle size={16}/>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleProcessWithdrawalWrapper(w.id, 'REJECT')} 
                                                        title="Reject"
                                                        className="p-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                                    >
                                                        <XCircle size={16}/>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Cash Fee Requests Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
                    <div className="flex flex-col">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <HandCoins size={18} className="text-orange-500" /> {t('unpaid_fees')}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Identified platform commissions from completed cash jobs</p>
                    </div>
                    <button 
                        onClick={handleRequestAllFees}
                        disabled={allFeeRequests.filter(fr => fr.status === 'PENDING').length === 0}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <BellRing size={16} /> {t('request_all_fees')}
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            <tr>
                                <th className="px-6 py-4">Provider</th>
                                <th className="px-6 py-4">Service</th>
                                <th className="px-6 py-4">Fee Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {allFeeRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                                        <HandCoins className="w-12 h-12 mx-auto mb-3 opacity-10" />
                                        No pending cash fees found.
                                    </td>
                                </tr>
                            ) : (
                                allFeeRequests.map(fr => (
                                    <tr key={fr.id} className={`dark:text-gray-300 transition-colors ${fr.status === 'VERIFYING' ? 'bg-yellow-50 dark:bg-yellow-900/10 animate-pulse' : fr.status === 'REQUESTED' ? 'bg-orange-50/30 dark:bg-orange-900/5' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{fr.providerName}</div>
                                            {fr.status === 'REQUESTED' && (
                                                <div className="flex items-center gap-1 text-[10px] text-orange-600 font-bold uppercase mt-0.5">
                                                    <AlertTriangle size={10} /> Already Notified
                                                </div>
                                            )}
                                            {fr.status === 'VERIFYING' && (
                                                <div className="flex items-center gap-1 text-[10px] text-yellow-600 font-bold uppercase mt-0.5">
                                                    <Clock size={10} /> Payment Review Required
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{t(fr.bookingCategory)}</div>
                                            <div className="text-[10px] text-gray-400">{new Date(fr.date).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-orange-600">{formatPrice(fr.amount)}</td>
                                        <td className="px-6 py-4">
                                            <Badge status={fr.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {fr.status === 'PENDING' && onRequestFee && (
                                                    <button 
                                                        onClick={() => onRequestFee(fr.providerId, fr.id)}
                                                        className="px-3 py-1.5 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-lg text-xs font-bold hover:bg-orange-200 flex items-center gap-1.5 transition-colors"
                                                    >
                                                        <BellRing size={14} /> {t('request_fee_btn')}
                                                    </button>
                                                )}
                                                {(fr.status === 'PENDING' || fr.status === 'REQUESTED' || fr.status === 'VERIFYING') && onMarkFeePaid && (
                                                    <>
                                                        <button 
                                                            onClick={() => onMarkFeePaid!(fr.providerId, fr.id, 'PAID')}
                                                            className="p-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 transition-colors"
                                                            title={t('confirm')}
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => onMarkFeePaid!(fr.providerId, fr.id, 'REJECTED')}
                                                            className="p-1.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 transition-colors"
                                                            title={t('REJECTED')}
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
  }

  if (currentView === 'bookings') {
    const filteredBookings = bookings.filter(b => bookingFilter === 'ALL' || b.status === bookingFilter);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nav_bookings')}</h2>
                <div className="flex gap-2">
                    <select 
                        value={bookingFilter}
                        onChange={(e) => setBookingFilter(e.target.value as any)}
                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="ALL">{t('all_statuses')}</option>
                        <option value="PENDING">{t('PENDING')}</option>
                        <option value="OFFER_MADE">{t('OFFER_MADE')}</option>
                        <option value="ACCEPTED">{t('ACCEPTED')}</option>
                        <option value="COMPLETED">{t('COMPLETED')}</option>
                        <option value="CANCELLED">{t('CANCELLED')}</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                            <tr>
                                <th className="px-6 py-4">{t('job_info')}</th>
                                <th className="px-6 py-4">{t('participants')}</th>
                                <th className="px-6 py-4">{t('preferred_schedule')}</th>
                                <th className="px-6 py-4">{t('status')}</th>
                                <th className="px-6 py-4">{t('offer_price')}</th>
                                <th className="px-6 py-4 text-emerald-600">{t('est_comm')}</th>
                                <th className="px-6 py-4">{t('payment_header')}</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredBookings.map(b => {
                                const customer = users.find(u => u.id === b.customerId);
                                const provider = users.find(u => u.id === b.providerId);
                                
                                return (
                                <tr key={b.id} className="dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 max-w-xs">
                                        <div className="font-bold text-gray-900 dark:text-white">{t(b.category)}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{b.description}</div>
                                        <div className="text-[10px] text-gray-400 mt-1 uppercase">Created: {new Date(b.date).toLocaleDateString()}</div>
                                        {b.address && (
                                            <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                                                <MapPin size={10} /> {b.address}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 w-fit">{t('customer_label')}: {b.customerName}</span>
                                                {customer?.phone && (
                                                    <a href={`tel:${customer.phone}`} className="text-[10px] text-gray-400 hover:text-indigo-600 flex items-center gap-1 mt-0.5 ml-2">
                                                        <Phone size={10} /> {customer.phone}
                                                    </a>
                                                )}
                                            </div>
                                            
                                            {b.providerName ? (
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 w-fit">{t('provider_label')}: {b.providerName}</span>
                                                    {provider?.phone && (
                                                        <a href={`tel:${provider.phone}`} className="text-[10px] text-gray-400 hover:text-indigo-600 flex items-center gap-1 mt-0.5 ml-2">
                                                            <Phone size={10} /> {provider.phone}
                                                        </a>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">{t('no_provider')}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex flex-col text-xs">
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1"><Calendar size={12}/> {new Date(b.scheduledDateTime).toLocaleDateString()}</span>
                                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1"><Clock size={12}/> {new Date(b.scheduledDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4"><Badge status={b.status} /></td>
                                    <td className="px-6 py-4 font-medium">
                                        {b.price > 0 ? formatPrice(b.price) : <span className="text-gray-400">-</span>}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-emerald-600">
                                        {b.price > 0 ? formatPrice(PLATFORM_FEE_FLAT) : <span className="text-gray-400">-</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        {b.paymentStatus === 'PAID' ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded">
                                                <CheckCircle size={12}/> {t('PAID')} ({b.paymentMethod})
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400">{t('UNPAID')}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => setActiveBookingChat(b)}
                                            className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors"
                                            title={t('admin_chat_title')}
                                        >
                                            <MessageSquare size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )})}
                            {filteredBookings.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        {t('no_bookings')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <ChatModal 
                isOpen={!!activeBookingChat} 
                onClose={() => setActiveBookingChat(null)} 
                booking={activeBookingChat} 
                currentUser={currentUser} 
                onSendMessage={onSendMessage} 
            />
        </div>
    );
  }

  if (currentView === 'content') {
    if (!editedContent) return null;

    const handleContactChange = (field: keyof PlatformContent['contact'], value: string) => {
        setEditedContent({ ...editedContent, contact: { ...editedContent.contact, [field]: value } });
    };

    const handleSocialChange = (field: keyof PlatformContent['socialMedia'], value: string) => {
        setEditedContent({ ...editedContent, socialMedia: { ...editedContent.socialMedia, [field]: value } });
    };

    const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
        const newFaq = [...editedContent.faq];
        newFaq[index] = { ...newFaq[index], [field]: value };
        setEditedContent({ ...editedContent, faq: newFaq });
    };

    const addFaq = () => {
        setEditedContent({ ...editedContent, faq: [...editedContent.faq, { question: '', answer: '' }] });
    };

    const removeFaq = (index: number) => {
        setEditedContent({ ...editedContent, faq: editedContent.faq.filter((_, i) => i !== index) });
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('site_content')}</h2>
                <button onClick={handleSaveContent} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                    <Save size={20} /> {t('save')}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><FileText size={20}/> {t('footer_about')}</h3>
                        <textarea rows={4} value={editedContent.aboutUs} onChange={(e) => setEditedContent({...editedContent, aboutUs: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><ShieldCheck size={20}/> {t('footer_terms')}</h3>
                        <textarea rows={4} value={editedContent.termsAndConditions} onChange={(e) => setEditedContent({...editedContent, termsAndConditions: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Lock size={20}/> {t('footer_privacy')}</h3>
                        <textarea rows={4} value={editedContent.privacyPolicy} onChange={(e) => setEditedContent({...editedContent, privacyPolicy: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500" />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Phone size={20}/> {t('contact_info')}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phone')}</label>
                                <input type="text" value={editedContent.contact.phone} onChange={(e) => handleContactChange('phone', e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email')}</label>
                                <input type="text" value={editedContent.contact.email} onChange={(e) => handleContactChange('email', e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('address')}</label>
                                <input type="text" value={editedContent.contact.address} onChange={(e) => handleContactChange('address', e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Globe size={20}/> {t('social_media')}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Facebook</label>
                                <input type="text" value={editedContent.socialMedia.facebook} onChange={(e) => handleSocialChange('facebook', e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instagram</label>
                                <input type="text" value={editedContent.socialMedia.instagram} onChange={(e) => handleSocialChange('instagram', e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Twitter</label>
                                <input type="text" value={editedContent.socialMedia.twitter} onChange={(e) => handleSocialChange('twitter', e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><HelpCircle size={20}/> {t('footer_faq')}</h3>
                            <button onClick={addFaq} className="text-sm px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50">{t('add_question')}</button>
                        </div>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {editedContent.faq.map((faq, index) => (
                                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg relative group border border-gray-200 dark:border-gray-600">
                                    <button onClick={() => removeFaq(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={16} />
                                    </button>
                                    <input 
                                        placeholder="Question" 
                                        value={faq.question} 
                                        onChange={(e) => handleFaqChange(index, 'question', e.target.value)} 
                                        className="w-full mb-2 px-3 py-1.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-sm font-medium dark:text-white"
                                    />
                                    <textarea 
                                        placeholder="Answer" 
                                        rows={2} 
                                        value={faq.answer} 
                                        onChange={(e) => handleFaqChange(index, 'answer', e.target.value)} 
                                        className="w-full px-3 py-1.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-sm dark:text-gray-200"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  return <div className="p-12 text-center text-gray-500">{t('view_not_found')}</div>;
};
