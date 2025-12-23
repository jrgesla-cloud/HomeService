
import React, { useState, useMemo } from 'react';
import { User, ServiceRequest, Availability, FeeRequest } from '../types';
import { Badge, StatCard, ChatModal, StarRating, WithdrawalModal, ConfirmationModal, OfferModal, useLanguage, useCurrency } from './Shared';
import { Briefcase, DollarSign, Star, Clock, MapPin, CheckCircle, MessageSquare, CreditCard, Banknote, Calendar, Wallet, TrendingUp, Settings, X, Save, ArrowUpRight, AlertCircle, Navigation, Info, Trash2, ChevronUp, ChevronDown, List, Receipt, HandCoins, BellRing, Sparkles, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

interface Props {
  user: User;
  bookings: ServiceRequest[];
  currentView: string;
  onUpdateStatus: (bookingId: string, status: ServiceRequest['status'], price?: number) => void;
  onAcceptJob: (bookingId: string) => void;
  onSendMessage: (bookingId: string, text: string) => void;
  onUpdateAvailability: (availability: Availability) => void;
  onWithdrawFunds: (amount: number, method: string) => void;
  onDeclineJob: (bookingId: string) => void;
  onCancelJob: (bookingId: string) => void;
  onMakeOffer: (bookingId: string, min: number, max: number) => void;
  onPayFee?: (feeId: string) => void;
  onPayAllFees?: () => void;
}

const PLATFORM_FEE_FLAT = 5;

const AvailabilityModal: React.FC<{ isOpen: boolean, onClose: () => void, currentAvailability?: Availability, onSave: (a: Availability) => void }> = ({ isOpen, onClose, currentAvailability, onSave }) => {
  const [workingDays, setWorkingDays] = useState<string[]>(currentAvailability?.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [startTime, setStartTime] = useState(currentAvailability?.startTime || '09:00');
  const [endTime, setEndTime] = useState(currentAvailability?.endTime || '17:00');
  const { t } = useLanguage();

  if (!isOpen) return null;
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day: string) => {
    if (workingDays.includes(day)) setWorkingDays(workingDays.filter(d => d !== day));
    else setWorkingDays([...workingDays, day]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-md shadow-2xl p-6 animate-scale-in border dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />{t('manage_availability')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X size={20} /></button>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('working_days')}</label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map(day => (
                <button key={day} onClick={() => toggleDay(day)} className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${workingDays.includes(day) ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>{day}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('start_time')}</label><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('end_time')}</label><input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
          </div>
          <button onClick={() => { onSave({ workingDays, startTime, endTime }); onClose(); }} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20"><Save size={18} />{t('save')}</button>
        </div>
      </div>
    </div>
  );
};

const CompletionModal: React.FC<{ isOpen: boolean, onClose: () => void, onConfirm: (price: number) => void, initialPrice?: number }> = ({ isOpen, onClose, onConfirm, initialPrice }) => {
    const { t } = useLanguage();
    const { currency, convertPrice } = useCurrency();
    // Convert initialPrice if needed for display
    const [price, setPrice] = useState(initialPrice ? convertPrice(initialPrice).toString() : '');

    if (!isOpen) return null;

    const handleSubmit = () => {
        let finalPrice = parseFloat(price) || 0;
        if (finalPrice > 0) {
            // FIX: Convert input back to base currency (EUR) before submitting
            if (currency === 'ALL') {
                finalPrice = finalPrice / 100;
            }
            onConfirm(finalPrice);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-scale-in border dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('complete_job')}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X size={20} /></button>
                </div>
                <div className="mb-6">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{t('enter_final_price')}</p>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">{t('final_price')} ({currency})</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{currency === 'EUR' ? '€' : 'L'}</span>
                        <input 
                            type="number" 
                            value={price} 
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                            placeholder="0.00"
                        />
                    </div>
                </div>
                <button 
                    onClick={handleSubmit} 
                    disabled={!price || parseFloat(price) <= 0}
                    className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50"
                >
                    {t('confirm_completion')}
                </button>
            </div>
        </div>
    );
};

export const ProviderDashboard: React.FC<Props> = ({ user, bookings, onUpdateStatus, onAcceptJob, onSendMessage, onUpdateAvailability, onWithdrawFunds, onDeclineJob, onCancelJob, onMakeOffer, currentView, onPayFee, onPayAllFees }) => {
  const { t } = useLanguage();
  const { formatPrice, convertPrice, currency } = useCurrency();
  const [selectedChatBooking, setSelectedChatBooking] = useState<ServiceRequest | null>(null);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [jobToRefuse, setJobToRefuse] = useState<string | null>(null);
  const [offerBookingId, setOfferBookingId] = useState<string | null>(null);
  const [bookingToComplete, setBookingToComplete] = useState<ServiceRequest | null>(null);

  const myJobs = bookings.filter(b => b.providerId === user.id);
  const activeJobs = myJobs.filter(b => b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS');
  
  const availableDirectRequests = bookings.filter(b => 
    (b.status === 'PENDING' || b.status === 'OFFER_MADE') && 
    b.providerId === user.id
  );

  const availablePoolJobs = bookings.filter(b => 
    b.status === 'PENDING' && 
    !b.providerId && 
    b.category === user.category
  );

  const myPendingOffers = bookings.filter(b => 
    b.status === 'OFFER_MADE' && 
    b.offers?.some(o => o.providerId === user.id && o.status === 'PENDING')
  );

  const paidJobs = myJobs.filter(j => j.status === 'COMPLETED' && j.paymentStatus === 'PAID');
  
  const totalGrossEarnings = paidJobs.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const totalFees = paidJobs.length * PLATFORM_FEE_FLAT;
  const totalNetEarnings = totalGrossEarnings - totalFees;
  
  const totalCardRevenue = paidJobs.filter(j => j.paymentMethod === 'CARD').reduce((acc, curr) => acc + (curr.price || 0), 0);
  const totalCardJobsCount = paidJobs.filter(j => j.paymentMethod === 'CARD').length;
  
  const totalWithdrawn = (user.withdrawals || [])
    .filter(w => w.status !== 'REJECTED')
    .reduce((acc, w) => acc + w.amount, 0);
  
  const walletBalance = (totalCardRevenue - (totalCardJobsCount * PLATFORM_FEE_FLAT)) - totalWithdrawn;
  
  const unpaidFeeRequests = (user.feeRequests || []).filter(fr => fr.status !== 'PAID');
  const totalOwed = unpaidFeeRequests.reduce((sum, fr) => sum + fr.amount, 0);
  
  const payableFees = unpaidFeeRequests.filter(fr => fr.status === 'PENDING' || fr.status === 'REQUESTED');

  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      const monthYear = `${d.getMonth()}-${d.getFullYear()}`;
      
      const monthlyPaidJobs = paidJobs.filter(job => {
        const jobDate = new Date(job.date);
        return jobDate.getMonth() === d.getMonth() && jobDate.getFullYear() === d.getFullYear();
      });

      const monthGross = monthlyPaidJobs.reduce((sum, job) => sum + (job.price || 0), 0);
      const monthNet = monthGross - (monthlyPaidJobs.length * PLATFORM_FEE_FLAT);
      
      data.push({
        name: monthLabel,
        gross: convertPrice(monthGross),
        net: convertPrice(monthNet),
        rawGross: monthGross,
        id: monthYear
      });
    }
    return data;
  }, [paidJobs, convertPrice]);

  const handleMakeOfferSubmit = (min: number, max: number) => {
    if (offerBookingId) {
      onMakeOffer(offerBookingId, min, max);
      setOfferBookingId(null);
    }
  };

  const bookingToBid = bookings.find(b => b.id === offerBookingId);

  if (currentView === 'earnings') {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="text-indigo-500" />
                    {t('financial_overview')}
                </h2>
                <div className="flex items-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                    <Calendar size={16} />
                    <span>{chartData[0].name} - {chartData[5].name} {new Date().getFullYear()}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <StatCard label={t('gross_revenue')} value={formatPrice(totalGrossEarnings)} icon={DollarSign} color="bg-indigo-500" />
                <StatCard label={t('platform_fees')} value={formatPrice(totalFees)} icon={Receipt} color="bg-orange-500" />
                <StatCard label={t('net_earnings')} value={formatPrice(Math.max(0, totalNetEarnings))} icon={TrendingUp} color="bg-green-500" />
                <StatCard label={t('total_owed')} value={formatPrice(totalOwed)} icon={HandCoins} color="bg-red-500" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('revenue')} Trends</h3>
                            <p className="text-sm text-gray-500">Compare gross and net earnings over the last 6 months</p>
                        </div>
                    </div>
                    <div className="h-[350px] w-full mt-auto">
                         <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={chartData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.05} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#9CA3AF" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    dy={10}
                                />
                                <YAxis 
                                    stroke="#9CA3AF" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tickFormatter={(val) => currency === 'ALL' ? `${val} L` : `€${val}`}
                                />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const grossVal = payload[0]?.value ?? 0;
                                            const netVal = payload[1]?.value ?? 0;
                                            const symbol = currency === 'ALL' ? ' L' : ' €';
                                            const prefix = currency === 'EUR' ? '€' : '';
                                            const suffix = currency === 'ALL' ? ' L' : '';
                                            return (
                                                <div className="bg-gray-900 text-white p-4 rounded-xl shadow-2xl border border-gray-800 text-xs animate-scale-in">
                                                    <p className="font-bold mb-2 border-b border-gray-700 pb-1">{label} {new Date().getFullYear()}</p>
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center justify-between gap-8">
                                                            <span className="flex items-center gap-2 text-gray-400"><span className="w-2 h-2 rounded-full bg-indigo-500"></span>{t('gross_revenue')}</span>
                                                            <span className="font-bold">{prefix}{grossVal.toLocaleString()}{suffix}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-8">
                                                            <span className="flex items-center gap-2 text-gray-400"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>{t('net_earnings')}</span>
                                                            <span className="font-bold text-emerald-400">{prefix}{netVal.toLocaleString()}{suffix}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                                <Bar dataKey="gross" name={t('gross_revenue')} fill="#6366F1" radius={[4, 4, 0, 0]} barSize={32} />
                                <Bar dataKey="net" name={t('net_earnings')} fill="#10B981" radius={[4, 4, 0, 0]} barSize={32} />
                             </BarChart>
                         </ResponsiveContainer>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between overflow-hidden relative">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl font-bold mb-1">{t('my_wallet')}</h3>
                                    <p className="text-indigo-100/70 text-[10px] font-bold uppercase tracking-widest">
                                        {t('available_withdraw')}
                                    </p>
                                </div>
                                <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                                    <Wallet size={20} />
                                </div>
                            </div>
                            <div className="font-bold text-5xl mb-6 tracking-tight flex items-baseline gap-1">
                                {formatPrice(Math.max(0, walletBalance))}
                            </div>
                            <div className="flex items-start gap-2 p-3 bg-black/20 rounded-xl mb-6 border border-white/10">
                                <Info size={14} className="text-indigo-200 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-indigo-100 opacity-90 leading-tight">
                                    {t('wallet_balance_info')}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowWithdrawalModal(true)} 
                            disabled={walletBalance <= 0} 
                            className="relative z-10 w-full py-4 bg-white text-indigo-700 rounded-xl font-bold hover:bg-gray-100 hover:shadow-lg transition-all transform active:scale-95 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            <Wallet size={18} className="group-hover:rotate-12 transition-transform" /> {t('withdraw_funds')}
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex-1">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><HandCoins size={18} className="text-orange-500" /> {t('unpaid_fees')}</h4>
                            {payableFees.length > 1 && onPayAllFees && (
                                <button 
                                    onClick={onPayAllFees}
                                    className="text-[10px] bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 font-bold px-2 py-1 rounded hover:bg-indigo-100 transition-colors uppercase"
                                >
                                    {t('pay_all_fees')}
                                </button>
                            )}
                        </div>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                            {unpaidFeeRequests.length === 0 ? (
                                <p className="text-xs text-gray-500 italic text-center py-4">No pending fees from cash jobs.</p>
                            ) : (
                                unpaidFeeRequests.map((fr, idx) => (
                                    <div key={idx} className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 relative">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t(fr.bookingCategory)}</span>
                                            <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{formatPrice(fr.amount)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-gray-400">{new Date(fr.date).toLocaleDateString()}</span>
                                            <Badge status={fr.status} />
                                        </div>
                                        {onPayFee && (
                                            <button 
                                                onClick={() => onPayFee(fr.id)}
                                                disabled={fr.status === 'VERIFYING'}
                                                className={`mt-1 w-full py-1.5 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1.5 ${
                                                    fr.status === 'VERIFYING' 
                                                    ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                }`}
                                            >
                                                {fr.status === 'VERIFYING' ? (
                                                    <><Loader2 size={12} className="animate-spin" /> {t('payment_awaiting_approval')}</>
                                                ) : (
                                                    <><CreditCard size={12} /> {t('pay_platform')}</>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Receipt size={20} className="text-indigo-500" />
                        {t('job_transactions')}
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold">
                            <tr>
                                <th className="px-6 py-4">{t('date')}</th>
                                <th className="px-6 py-4">{t('service_label')}</th>
                                <th className="px-6 py-4">{t('method')}</th>
                                <th className="px-6 py-4">{t('gross_revenue')}</th>
                                <th className="px-6 py-4">{t('net_earnings')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {paidJobs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">
                                        {t('no_bookings')}
                                    </td>
                                </tr>
                            ) : (
                                [...paidJobs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(job => (
                                    <tr key={job.id} className="dark:text-gray-300 group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{new Date(job.date).toLocaleDateString()}</td>
                                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{t(job.category)}</td>
                                      <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${job.paymentMethod === 'CASH' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                          {job.paymentMethod === 'CASH' ? <Banknote size={10} /> : <CreditCard size={10} />}
                                          {job.paymentMethod}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4">{formatPrice(job.price || 0)}</td>
                                      <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">{formatPrice((job.price || 0) - PLATFORM_FEE_FLAT)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <WithdrawalModal isOpen={showWithdrawalModal} onClose={() => setShowWithdrawalModal(false)} availableBalance={walletBalance} onWithdraw={onWithdrawFunds} />
        </div>
    );
  }

  if (currentView === 'schedule') {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nav_schedule')}</h2>
              <button onClick={() => setShowAvailabilityModal(true)} className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-all active:scale-95"><Settings size={18} /> {t('manage_availability')}</button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {activeJobs.map(job => (
                        <div key={job.id} className="p-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2"><h4 className="text-lg font-bold text-gray-900 dark:text-white">{job.customerName}</h4><Badge status={job.status} /></div>
                                    <p className="text-gray-600 dark:text-gray-400 mb-2">{job.description}</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                      <MapPin size={14} />
                                      {job.address}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setSelectedChatBooking(job)} className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"><MessageSquare size={18} /></button>
                                    {job.status === 'ACCEPTED' && (
                                        <>
                                            <button onClick={() => setBookingToCancel(job.id)} className="px-4 py-2 border border-red-300 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 font-medium">{t('cancel_job')}</button>
                                            <button onClick={() => onUpdateStatus(job.id, 'IN_PROGRESS')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md shadow-indigo-500/20">{t('start_job')}</button>
                                        </>
                                    )}
                                    {job.status === 'IN_PROGRESS' && (
                                        <>
                                            <button onClick={() => setBookingToCancel(job.id)} className="px-4 py-2 border border-red-300 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 font-medium">{t('cancel_job')}</button>
                                            <button onClick={() => setBookingToComplete(job)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-md shadow-green-500/20">{t('complete_job')}</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {activeJobs.length === 0 && (
                      <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                        <Calendar size={48} className="mx-auto mb-4 opacity-10" />
                        <p>{t('no_scheduled_jobs')}</p>
                      </div>
                    )}
                </div>
            </div>
            <ChatModal isOpen={!!selectedChatBooking} onClose={() => setSelectedChatBooking(null)} booking={selectedChatBooking} currentUser={user} onSendMessage={onSendMessage} />
            <AvailabilityModal isOpen={showAvailabilityModal} onClose={() => setShowAvailabilityModal(false)} currentAvailability={user.availability} onSave={onUpdateAvailability} />
            <ConfirmationModal 
                isOpen={!!bookingToCancel} 
                onClose={() => setBookingToCancel(null)} 
                onConfirm={() => { if (bookingToCancel) onCancelJob(bookingToCancel); }} 
                title={t('cancel_job')} 
                message={t('cancel_job_confirm')} 
                confirmLabel={t('yes_cancel')} 
                cancelLabel={t('no_keep')} 
                isDestructive 
            />
            <CompletionModal 
                isOpen={!!bookingToComplete} 
                onClose={() => setBookingToComplete(null)} 
                onConfirm={(price) => { if (bookingToComplete) onUpdateStatus(bookingToComplete.id, 'COMPLETED', price); }} 
                initialPrice={bookingToComplete?.price}
            />
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label={t('active_jobs')} value={activeJobs.length} icon={Briefcase} color="bg-blue-500" />
        <StatCard label={t('completed_jobs')} value={paidJobs.length} icon={CheckCircle} color="bg-green-500" />
        <StatCard label={t('my_rating')} value={user.rating ? user.rating.toFixed(1) : "N/A"} icon={Star} color="bg-yellow-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 shrink-0"><h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('nav_job_board')}</h3></div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
              {availableDirectRequests.length > 0 && (
                  <>
                      <div className="px-6 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">{t('direct_requests')}</div>
                      {availableDirectRequests.map(job => {
                          const myOffer = job.offers?.find(o => o.providerId === user.id);
                          return (
                          <div key={job.id} className="p-6 bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/20 transition-colors border-l-4 border-indigo-500">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white">{job.customerName}</h4>
                                <Badge status={job.status} />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{job.description}</p>
                            <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
                               <MapPin size={12} />
                               {job.address}
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => onDeclineJob(job.id)} 
                                    className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-white dark:hover:bg-gray-700 flex items-center justify-center gap-2"
                                >
                                    <ArrowUpRight size={16} /> {t('decline_job')}
                                </button>
                                <button 
                                    onClick={() => setJobToRefuse(job.id)} 
                                    className="flex-1 py-2 border border-red-200 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center gap-2"
                                >
                                    <X size={16} /> {t('refuse_job')}
                                </button>
                                {job.status === 'PENDING' && (
                                    <button onClick={() => setOfferBookingId(job.id)} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">{t('make_offer')}</button>
                                )}
                                {job.status === 'OFFER_MADE' && myOffer && (
                                    <div className="flex-1 text-center py-2 text-indigo-600 font-bold text-sm bg-white rounded-lg border border-indigo-100">
                                        {formatPrice(myOffer.minPrice)} - {formatPrice(myOffer.maxPrice)}
                                    </div>
                                )}
                            </div>
                          </div>
                      )})}
                  </>
              )}
              
              <div className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-xs font-bold uppercase tracking-wider">{t('open_jobs')}</div>
              {availablePoolJobs.length === 0 && myPendingOffers.length === 0 ? (
                 <div className="p-8 text-center text-gray-500 dark:text-gray-400"><Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" /><p>{t('no_jobs_available')}</p></div>
              ) : (
                 <>
                    {/* Jobs I already bid on */}
                    {myPendingOffers.map(job => {
                        const myOffer = job.offers?.find(o => o.providerId === user.id);
                        return (
                        <div key={job.id} className="p-6 bg-blue-50/20 dark:bg-blue-900/5 hover:bg-blue-50/40 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white">{job.customerName}</h4>
                                <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold uppercase">{t('offer_sent')}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{job.description}</p>
                            <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
                               <MapPin size={12} /> {job.address}
                            </div>
                            <div className="flex items-center justify-between text-indigo-600">
                                <span className="text-xs font-medium">{t('waiting_approval')}...</span>
                                {myOffer && <span className="font-bold">{formatPrice(myOffer.minPrice)} - {formatPrice(myOffer.maxPrice)}</span>}
                            </div>
                        </div>
                    )})}

                    {/* New open jobs */}
                    {availablePoolJobs.map(job => (
                        <div key={job.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-l-4 border-transparent hover:border-indigo-500">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white">{job.customerName}</h4>
                                {job.aiPriceRange && (
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-[10px] font-bold border border-purple-100 dark:border-purple-800 animate-pulse">
                                        <Sparkles size={12} />
                                        {job.aiPriceRange}
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{job.description}</p>
                            <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
                               <MapPin size={12} />
                               {job.address}
                            </div>
                            <button onClick={() => setOfferBookingId(job.id)} className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">{t('make_offer')}</button>
                        </div>
                    ))}
                 </>
              )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 shrink-0"><h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('active_jobs')}</h3></div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
              {activeJobs.map(job => (
                <div key={job.id} className="p-6 group">
                  <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{job.customerName}</h4>
                      <Badge status={job.status} />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{job.description}</p>
                  <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <button onClick={() => setSelectedChatBooking(job)} className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors"><MessageSquare size={18} /></button>
                        <button onClick={() => setBookingToCancel(job.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"><Trash2 size={18} /></button>
                      </div>
                      <div className="text-right">
                          <div className="font-bold text-indigo-600 dark:text-indigo-400">{formatPrice(job.price)}</div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase">{t('ACCEPTED')}</div>
                      </div>
                  </div>
                </div>
              ))}
              {activeJobs.length === 0 && (
                  <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                      <Briefcase size={40} className="opacity-10 mb-2" />
                      <p>{t('no_bookings')}</p>
                  </div>
              )}
          </div>
        </div>
      </div>
      <ConfirmationModal 
            isOpen={!!bookingToCancel} 
            onClose={() => setBookingToCancel(null)} 
            onConfirm={() => { if (bookingToCancel) onCancelJob(bookingToCancel); }} 
            title={t('cancel_job')} 
            message={t('cancel_job_confirm')} 
            confirmLabel={t('yes_cancel')} 
            cancelLabel={t('no_keep')} 
            isDestructive 
      />
      <ConfirmationModal 
            isOpen={!!jobToRefuse} 
            onClose={() => setJobToRefuse(null)} 
            onConfirm={() => { if (jobToRefuse) onCancelJob(jobToRefuse); }} 
            title={t('refuse_job')} 
            message={t('refuse_job_confirm')} 
            confirmLabel={t('refuse_job')} 
            cancelLabel={t('no_keep')} 
            isDestructive 
      />
      <OfferModal 
        isOpen={!!offerBookingId} 
        onClose={() => setOfferBookingId(null)} 
        onSubmit={handleMakeOfferSubmit}
        suggestedRange={bookingToBid?.aiPriceRange}
      />
    </div>
  );
};
