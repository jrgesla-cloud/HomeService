
import React, { useState, useMemo } from 'react';
import { User, ServiceRequest, PlatformContent, CategoryItem, UserRole, FeeRequest, Message } from '../types';
import { Badge, StatCard, useLanguage, useCurrency, ChatModal, ProfileView, EditProfileModal } from './Shared';
import { 
  Users, 
  Briefcase, 
  Activity, 
  TrendingUp, 
  Plus, 
  X, 
  Search, 
  Star,
  MapPin, 
  DollarSign, 
  Mail, 
  Save, 
  Trash2, 
  Edit2, 
  Filter, 
  Calendar, 
  User as UserIcon, 
  Clock, 
  CheckCircle, 
  Receipt, 
  FileText, 
  ShieldCheck, 
  Lock, 
  Globe, 
  MessageSquare, 
  AlertTriangle, 
  CheckSquare, 
  Phone, 
  Instagram, 
  Facebook, 
  Twitter,
  ArrowUpRight,
  ArrowDownLeft,
  Banknote,
  CreditCard,
  History,
  PieChart,
  Wallet,
  CheckCircle2,
  Check,
  FilterIcon,
  BellRing,
  AlertCircle
} from 'lucide-react';

interface Props {
  currentUser: User;
  users: User[];
  bookings: ServiceRequest[];
  currentView: string;
  onAddUser: (user: Omit<User, 'id' | 'rating' | 'jobsCompleted'>) => void;
  onRemoveUser: (userId: string) => void;
  platformContent: PlatformContent;
  onUpdateContent: (content: PlatformContent) => void;
  onProcessWithdrawal: (withdrawalId: string, action: 'APPROVE' | 'REJECT', amount?: number) => void;
  serviceCategories: CategoryItem[];
  onAddCategory: (category: Omit<CategoryItem, 'id'>) => void;
  onUpdateCategory?: (category: CategoryItem) => void;
  onDeleteCategory: (categoryId: string) => void;
  onAdminSendMessageToUser: (userId: string, message: string) => void;
  onSendMessage: (bookingId: string, text: string) => void;
  onMarkRead: (bookingId: string) => void;
  onManageFee: (providerId: string, feeId: string, action: 'APPROVE' | 'REJECT' | 'UPDATE' | 'REMIND', newAmount?: number) => void;
}

const PLATFORM_FEE_FLAT = 500; 

// --- Sub-component for adding category ---
const AddCategoryModal: React.FC<{ isOpen: boolean; onClose: () => void; onAdd: (c: any) => void }> = ({ isOpen, onClose, onAdd }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ name: '', icon: '🔧', basePrice: 500 });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] w-full max-w-md shadow-2xl p-8 border dark:border-gray-700 animate-scale-in">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black dark:text-white uppercase tracking-tight">{t('add_category')}</h3>
          <button onClick={onClose} className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={24}/></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onAdd(formData); onClose(); setFormData({ name: '', icon: '🔧', basePrice: 500 }); }} className="space-y-5 text-left">
           <div>
             <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">{t('name')}</label>
             <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Psh. cat_painting ose Bojatisje" className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-800 rounded-xl text-xs dark:text-white font-black" />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">{t('icon')} (Emoji)</label>
                <input required value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-800 rounded-xl text-center text-xl" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">{t('base_price')}</label>
                <input required type="number" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: parseInt(e.target.value)})} className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-800 rounded-xl text-xs dark:text-white font-black" />
              </div>
           </div>
           <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 shadow-xl active:scale-95 transition-all mt-4">{t('save')}</button>
        </form>
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC<Props> = ({ 
  currentUser, 
  users, 
  bookings, 
  currentView, 
  onAddUser, 
  onRemoveUser, 
  platformContent, 
  onUpdateContent, 
  onProcessWithdrawal, 
  serviceCategories, 
  onAddCategory, 
  onDeleteCategory, 
  onSendMessage, 
  onMarkRead, 
  onManageFee 
}) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingFee, setEditingFee] = useState<{ pId: string; fId: string; currentAmt: number } | null>(null);
  const [newFeeAmount, setNewFeeAmount] = useState<string>('');
  const [feeStatusFilter, setFeeStatusFilter] = useState<string>('ALL');

  const stats = useMemo(() => {
    const totalUnpaidFees = users.reduce((acc, u) => {
      const userFees = (u.feeRequests || []).filter(f => f.status !== 'PAID').reduce((sum, f) => sum + f.amount, 0);
      return acc + userFees;
    }, 0);

    return {
      totalUsers: users.length,
      totalBookings: bookings.length,
      activeJobs: bookings.filter(b => ['ACCEPTED', 'IN_PROGRESS'].includes(b.status)).length,
      revenue: bookings.filter(b => b.paymentStatus === 'PAID' && b.paymentMethod === 'CARD').length * PLATFORM_FEE_FLAT,
      unpaidCommissions: totalUnpaidFees
    };
  }, [users, bookings]);

  const financialStats = useMemo(() => {
    const pendingWithdrawals = users.flatMap(u => u.withdrawals || []).filter(w => w.status === 'PENDING');
    const totalPendingPayoutAmount = pendingWithdrawals.reduce((acc, w) => acc + w.amount, 0);
    const activeCommissionPotential = stats.activeJobs * PLATFORM_FEE_FLAT;
    
    return {
      settledRevenue: stats.revenue,
      pendingPayouts: totalPendingPayoutAmount,
      payoutCount: pendingWithdrawals.length,
      activePotential: activeCommissionPotential,
      totalUnpaid: stats.unpaidCommissions
    };
  }, [users, stats]);

  const allUnpaidFees = useMemo(() => {
    return users.flatMap(u => (u.feeRequests || []).map(f => ({ ...f, pName: u.name, pId: u.id, pEmail: u.email })))
      .filter(f => f.status !== 'PAID')
      .filter(f => feeStatusFilter === 'ALL' || f.status === feeStatusFilter);
  }, [users, feeStatusFilter]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                  <StatCard label={t('total_users')} value={stats.totalUsers} icon={Users} color="bg-indigo-500" />
                  <StatCard label={t('total_bookings')} value={stats.totalBookings} icon={Briefcase} color="bg-blue-500" />
                  <StatCard label={t('active_jobs')} value={stats.activeJobs} icon={Activity} color="bg-orange-500" />
                  <StatCard label={t('revenue_commissions')} value={formatPrice(stats.revenue)} icon={TrendingUp} color="bg-emerald-500" />
                  <StatCard label={t('total_owed')} value={formatPrice(stats.unpaidCommissions)} icon={AlertCircle} color="bg-red-500" />
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-[1.5rem] border dark:border-gray-700 shadow-sm flex flex-col">
                  <h3 className="text-[10px] font-black dark:text-white mb-6 flex items-center gap-2.5 uppercase tracking-widest"><Clock size={18} className="text-indigo-600" /> {t('recent_bookings')}</h3>
                  <div className="space-y-2">
                      {bookings.slice(0, 5).map(b => (
                          <div key={b.id} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border dark:border-gray-800 transition-all hover:bg-white dark:hover:bg-gray-800">
                              <div className="min-w-0">
                                  <p className="text-[11px] font-black dark:text-white truncate uppercase mb-0.5">{b.customerName}</p>
                                  <p className="text-[7px] text-gray-400 uppercase font-bold tracking-widest">{t(b.category)} • {b.id.substring(0,8)}</p>
                              </div>
                              <Badge status={b.status} />
                          </div>
                      ))}
                  </div>
              </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-black dark:text-white uppercase tracking-tight px-2">{t('user_management')}</h2>
              <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 overflow-hidden shadow-sm overflow-x-auto">
                  <table className="w-full text-left text-[10px] min-w-[700px]">
                      <thead className="bg-gray-50/50 dark:bg-gray-900/50 font-black uppercase tracking-widest text-gray-400 border-b dark:border-gray-700">
                          <tr>
                              <th className="p-4">{t('user')}</th>
                              <th className="p-4">{t('role')}</th>
                              <th className="p-4">{t('contact_info')}</th>
                              <th className="p-4">{t('status')}</th>
                              <th className="p-4 text-right">Veprimet</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y dark:divide-gray-700">
                          {users.map(u => (
                              <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                  <td className="p-4 flex items-center gap-3">
                                      <img src={u.avatarUrl} className="w-9 h-9 rounded-lg object-cover border dark:border-gray-700" />
                                      <div><p className="font-black dark:text-white uppercase text-xs">{u.name}</p><p className="text-[8px] text-gray-500 uppercase tracking-widest">{u.email}</p></div>
                                  </td>
                                  <td className="p-4">
                                      <span className={`px-2 py-0.5 rounded-md font-black text-[8px] uppercase ${u.role === 'PROVIDER' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' : u.role === 'ADMIN' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'}`}>
                                          {t(`role_${u.role.toLowerCase()}`)}
                                      </span>
                                  </td>
                                  <td className="p-4 font-bold text-gray-600 dark:text-gray-400">{u.phone || 'N/A'}</td>
                                  <td className="p-4">
                                      {u.isVerified ? (
                                          <span className="flex items-center gap-1.5 text-green-600 font-black uppercase text-[8px] tracking-widest"><ShieldCheck size={14}/> {t('verified')}</span>
                                      ) : (
                                          <span className="flex items-center gap-1.5 text-yellow-600 font-black uppercase text-[8px] tracking-widest"><AlertTriangle size={14}/> {t('PENDING')}</span>
                                      )}
                                  </td>
                                  <td className="p-4 text-right">
                                      {u.id !== currentUser.id && <button onClick={() => onRemoveUser(u.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
        );

      case 'services':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">{t('service_management')}</h2>
              <button 
                onClick={() => setShowAddCategoryModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
              >
                <Plus size={16}/> {t('add_category')}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {serviceCategories.map(cat => (
                <div key={cat.id} className="bg-white dark:bg-gray-800 p-5 rounded-[1.5rem] border dark:border-gray-700 shadow-sm flex flex-col justify-between group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-3xl">{cat.icon}</div>
                    <button onClick={() => onDeleteCategory(cat.id)} className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                  </div>
                  <div>
                    <h4 className="font-black dark:text-white text-[11px] uppercase tracking-tight mb-1">{t(cat.name)}</h4>
                    <p className="text-[8px] text-indigo-600 font-black uppercase tracking-widest">{t('base_price')}: {formatPrice(cat.basePrice)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'bookings':
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-black dark:text-white uppercase tracking-tight px-2">{t('nav_bookings')}</h2>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 overflow-hidden shadow-sm overflow-x-auto">
              <table className="w-full text-left text-[10px] min-w-[800px]">
                <thead className="bg-gray-50/50 dark:bg-gray-900/50 font-black uppercase tracking-widest text-gray-400 border-b dark:border-gray-700">
                  <tr>
                    <th className="p-4">{t('job_info')}</th>
                    <th className="p-4">{t('participants')}</th>
                    <th className="p-4">{t('status')}</th>
                    <th className="p-4 text-right">{t('total')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {bookings.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                      <td className="p-4">
                        <p className="font-black dark:text-white uppercase text-xs mb-1">{t(b.category)}</p>
                        <p className="text-[8px] text-gray-500 uppercase font-bold tracking-widest">#{b.id.substring(0,8)}</p>
                      </td>
                      <td className="p-4">
                        <div className="text-[9px] font-bold">
                          <p className="text-indigo-600 uppercase tracking-tighter">C: {b.customerName}</p>
                          <p className="text-gray-500 uppercase tracking-tighter mt-1">P: {b.providerName || t('no_provider')}</p>
                        </div>
                      </td>
                      <td className="p-4"><Badge status={b.status}/></td>
                      <td className="p-4 text-right font-black dark:text-white">{formatPrice(b.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'finance':
        return (
          <div className="space-y-10 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500"><TrendingUp size={100} /></div>
                 <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md"><ArrowUpRight size={18}/></div>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">{t('revenue_commissions')}</span>
                 </div>
                 <h3 className="text-2xl font-black leading-none mb-1">{formatPrice(financialStats.settledRevenue)}</h3>
                 <p className="text-[8px] font-bold opacity-70 uppercase tracking-widest">Digital Settled</p>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500"><AlertCircle size={100} /></div>
                 <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md"><Receipt size={18}/></div>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">{t('total_owed')}</span>
                 </div>
                 <h3 className="text-2xl font-black leading-none mb-1">{formatPrice(financialStats.totalUnpaid)}</h3>
                 <p className="text-[8px] font-bold opacity-70 uppercase tracking-widest">Pending Commissions</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500"><History size={100} /></div>
                 <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md"><ArrowDownLeft size={18}/></div>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">{t('withdrawal_requests')}</span>
                 </div>
                 <h3 className="text-2xl font-black leading-none mb-1">{formatPrice(financialStats.pendingPayouts)}</h3>
                 <p className="text-[8px] font-bold opacity-70 uppercase tracking-widest">{financialStats.payoutCount} Active</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border-2 border-indigo-50 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 text-indigo-600 opacity-5 group-hover:scale-110 transition-transform duration-500"><PieChart size={100} /></div>
                 <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl text-indigo-600"><Activity size={18}/></div>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">Pipeline</span>
                 </div>
                 <h3 className="text-2xl font-black leading-none mb-1 dark:text-white">{formatPrice(financialStats.activePotential)}</h3>
                 <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">{stats.activeJobs} Jobs In-Flight</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50/20 dark:bg-gray-900/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-xl flex items-center justify-center shadow-inner"><Wallet size={18}/></div>
                  <h3 className="text-[9px] font-black uppercase tracking-widest dark:text-white">{t('withdrawal_requests')}</h3>
                </div>
                <span className="bg-orange-600 text-white text-[7px] font-black px-3 py-1.5 rounded-full uppercase">{financialStats.payoutCount} Requests</span>
              </div>
              <div className="flex-1 max-h-[400px] overflow-y-auto divide-y dark:divide-gray-700 scrollbar-thin">
                 {users.flatMap(u => u.withdrawals || []).filter(w => w.status === 'PENDING').length === 0 ? (
                   <div className="p-20 text-center">
                      <CheckCircle size={32} className="mx-auto text-gray-200 dark:text-gray-700 mb-4"/>
                      <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">No pending payouts</p>
                   </div>
                 ) : users.flatMap(u => u.withdrawals || []).filter(w => w.status === 'PENDING').map(w => {
                   const provider = users.find(u => u.id === w.providerId);
                   return (
                      <div key={w.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-all flex flex-col md:flex-row justify-between items-center gap-4 group">
                          <div className="flex items-center gap-3 w-full">
                              <img src={provider?.avatarUrl} className="w-10 h-10 rounded-xl object-cover border-2 border-white dark:border-gray-800 shadow-md"/>
                              <div className="min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                      <p className="text-[11px] font-black dark:text-white uppercase leading-none">{w.providerName}</p>
                                      <div className="flex items-center gap-1 bg-yellow-400/10 text-yellow-600 px-1.5 py-0.5 rounded text-[7px] font-black">
                                          <Star size={8} className="fill-yellow-600" /> {provider?.rating?.toFixed(1)}
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-[7px] font-black text-gray-400 uppercase tracking-widest">
                                      <span className="flex items-center gap-1">{w.method === 'PayPal' ? <Globe size={8}/> : <Banknote size={8}/>} {w.method}</span>
                                      <span>•</span>
                                      <span>{new Date(w.date).toLocaleDateString()}</span>
                                  </div>
                              </div>
                          </div>
                          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                              <span className="text-lg font-black text-indigo-600 whitespace-nowrap">{formatPrice(w.amount)}</span>
                              <div className="flex gap-1.5">
                                  <button onClick={() => onProcessWithdrawal(w.id, 'APPROVE')} className="w-8 h-8 bg-emerald-600 text-white rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center"><CheckCircle size={14}/></button>
                                  <button onClick={() => onProcessWithdrawal(w.id, 'REJECT')} className="w-8 h-8 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all flex items-center justify-center"><X size={14}/></button>
                              </div>
                          </div>
                      </div>
                   );
                 })}
              </div>
            </div>
          </div>
        );

      case 'fees':
        return (
          <div className="space-y-8 animate-fade-in">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
                <div>
                   <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">{t('fee_management')}</h2>
                   <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-2">Manage outstanding platform commissions from cash bookings</p>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-xl border dark:border-gray-700 shadow-sm">
                   <FilterIcon size={14} className="text-gray-400 ml-2" />
                   <select 
                      value={feeStatusFilter} 
                      onChange={(e) => setFeeStatusFilter(e.target.value)} 
                      className="bg-transparent border-0 text-[9px] font-black uppercase tracking-widest dark:text-white focus:ring-0"
                    >
                      <option value="ALL">{t('all_statuses')}</option>
                      <option value="PENDING">{t('PENDING')}</option>
                      <option value="VERIFYING">{t('VERIFYING')}</option>
                      <option value="REJECTED">{t('REJECTED')}</option>
                   </select>
                </div>
             </div>

             <div className="bg-white dark:bg-gray-800 rounded-[2rem] border dark:border-gray-700 shadow-xl overflow-hidden flex flex-col">
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-left text-[10px] min-w-[900px]">
                    <thead className="bg-gray-50/50 dark:bg-gray-900/50 font-black uppercase tracking-[0.2em] text-gray-400 border-b dark:border-gray-700 sticky top-0 z-10">
                      <tr>
                        <th className="p-6">{t('provider_label')}</th>
                        <th className="p-6">{t('job_info')}</th>
                        <th className="p-6">{t('status')}</th>
                        <th className="p-6 text-right">{t('amount')}</th>
                        <th className="p-6 text-center">Veprimet</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                      {allUnpaidFees.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-32 text-center text-gray-400 font-black uppercase tracking-widest italic opacity-20">
                            No matching fee requests found.
                          </td>
                        </tr>
                      ) : allUnpaidFees.map(f => (
                        <tr key={f.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-all group">
                          <td className="p-6">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 rounded-lg flex items-center justify-center font-black text-[10px]">
                                  {f.pName[0]}
                               </div>
                               <div>
                                  <p className="font-black dark:text-white uppercase text-[11px] leading-none mb-1">{f.pName}</p>
                                  <p className="text-[7px] text-gray-500 font-bold uppercase tracking-widest">{f.pEmail}</p>
                               </div>
                            </div>
                          </td>
                          <td className="p-6">
                            <p className="font-black dark:text-white uppercase leading-none mb-1">{t(f.bookingCategory)}</p>
                            <p className="text-[7px] text-indigo-600 font-bold uppercase tracking-widest">{new Date(f.date).toLocaleDateString()}</p>
                          </td>
                          <td className="p-6">
                             <Badge status={f.status} />
                          </td>
                          <td className="p-6 text-right">
                             {editingFee?.fId === f.id ? (
                               <div className="flex items-center justify-end gap-2 animate-fade-in">
                                 <input 
                                   autoFocus
                                   type="number" 
                                   value={newFeeAmount} 
                                   onChange={e => setNewFeeAmount(e.target.value)} 
                                   className="w-20 bg-white dark:bg-gray-950 border-2 border-indigo-500 rounded-lg px-2 py-1 text-right font-black text-xs"
                                 />
                                 <button onClick={() => {
                                   onManageFee(f.pId, f.id, 'UPDATE', parseFloat(newFeeAmount));
                                   setEditingFee(null);
                                 }} className="p-1.5 bg-emerald-600 text-white rounded-md hover:scale-110 transition-transform"><Check size={14}/></button>
                                 <button onClick={() => setEditingFee(null)} className="p-1.5 bg-red-500 text-white rounded-md hover:scale-110 transition-transform"><X size={14}/></button>
                               </div>
                             ) : (
                               <div className="flex flex-col items-end">
                                  <p className="font-black dark:text-white text-base leading-none mb-1">{formatPrice(f.amount)}</p>
                                  <button 
                                    onClick={() => {
                                      setEditingFee({ pId: f.pId, fId: f.id, currentAmt: f.amount });
                                      setNewFeeAmount(f.amount.toString());
                                    }} 
                                    className="text-[7px] font-black uppercase text-indigo-600 hover:underline tracking-widest"
                                  >
                                    {t('edit_fee')}
                                  </button>
                               </div>
                             )}
                          </td>
                          <td className="p-6">
                            <div className="flex items-center justify-center gap-2">
                               {f.status === 'VERIFYING' && (
                                 <>
                                   <button 
                                      onClick={() => onManageFee(f.pId, f.id, 'APPROVE')} 
                                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-[7px] hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
                                    >
                                      <CheckCircle2 size={12}/> {t('approve_payment')}
                                    </button>
                                    <button 
                                      onClick={() => onManageFee(f.pId, f.id, 'REJECT')} 
                                      className="flex items-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl font-black uppercase tracking-widest text-[7px] hover:bg-red-600 hover:text-white transition-all active:scale-95"
                                    >
                                      <X size={12}/> {t('reject_payment')}
                                    </button>
                                 </>
                               )}
                               {f.status === 'PENDING' && (
                                 <button 
                                    onClick={() => onManageFee(f.pId, f.id, 'REMIND')} 
                                    className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-800 border-2 border-indigo-600 text-indigo-600 rounded-xl font-black uppercase tracking-widest text-[7px] hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-sm"
                                  >
                                    <BellRing size={12} /> {t('request_fee_btn')}
                                  </button>
                               )}
                               {f.status === 'REJECTED' && (
                                 <button 
                                    onClick={() => onManageFee(f.pId, f.id, 'APPROVE')} 
                                    className="px-3 py-2 border-2 border-emerald-600 text-emerald-600 rounded-xl font-black uppercase tracking-widest text-[7px] hover:bg-emerald-600 hover:text-white transition-all"
                                  >
                                    Force Approve
                                  </button>
                               )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
          </div>
        );

      case 'content':
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-black dark:text-white uppercase tracking-tight px-2">{t('nav_content')}</h2>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[1.5rem] border dark:border-gray-700 shadow-sm space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('contact_info')} Email</label>
                   <input value={platformContent.contact.email} className="w-full bg-gray-50 dark:bg-gray-900 border dark:border-gray-800 p-3 rounded-xl text-[10px] dark:text-white font-bold"/>
                 </div>
                 <div>
                   <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Phone</label>
                   <input value={platformContent.contact.phone} className="w-full bg-gray-50 dark:bg-gray-900 border dark:border-gray-800 p-3 rounded-xl text-[10px] dark:text-white font-bold"/>
                 </div>
               </div>
               <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"><Save size={16}/> {t('save')}</button>
            </div>
          </div>
        );

      case 'profile':
        return <ProfileView user={currentUser} onEdit={() => setShowEditModal(true)} />;

      default:
        return <div className="p-20 text-center text-gray-400 uppercase font-black text-xs tracking-widest">{t('view_not_found')}</div>;
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {renderView()}
      <EditProfileModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} user={currentUser} onSave={() => {}} />
      <AddCategoryModal isOpen={showAddCategoryModal} onClose={() => setShowAddCategoryModal(false)} onAdd={onAddCategory} />
    </div>
  );
};
