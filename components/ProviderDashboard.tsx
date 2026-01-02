
import React, { useState, useMemo, useEffect } from 'react';
import { User, ServiceRequest, Availability, Message } from '../types';
import { Badge, StatCard, ChatModal, WithdrawalModal, useLanguage, useCurrency, MessagesView, OfferModal, JobCompletionModal, ProfileView, EditProfileModal } from './Shared';
import { 
  Briefcase, 
  DollarSign, 
  Star, 
  Clock, 
  MapPin, 
  MessageSquare, 
  Calendar as CalendarIcon, 
  Wallet, 
  TrendingUp, 
  Settings, 
  Receipt, 
  List, 
  ChevronRight, 
  CheckCircle2, 
  PlayCircle, 
  Info, 
  Check, 
  Play, 
  ChevronLeft, 
  Zap, 
  ShieldCheck, 
  AlertCircle, 
  X, 
  Clock3,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  History,
  Activity,
  ArrowRight,
  Banknote,
  Globe,
  MoreVertical,
  Navigation
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Props {
  user: User;
  bookings: ServiceRequest[];
  currentView: string;
  onUpdateStatus: (bookingId: string, status: ServiceRequest['status'], price?: number) => void;
  onAcceptJob: (bookingId: string) => void;
  onSendMessage: (bookingId: string, text: string) => void;
  onMarkRead: (bookingId: string) => void;
  onUpdateAvailability: (availability: Availability) => void;
  onWithdrawFunds: (amount: number, method: string) => void;
  onDeclineJob: (bookingId: string) => void;
  onCancelJob: (bookingId: string) => void;
  onMakeOffer: (bookingId: string, min: number, max: number) => void;
  onUpdateUser: (user: User) => void;
  onSettleFee?: (feeId: string) => void;
}

const PLATFORM_FEE_FLAT = 500;

export const ProviderDashboard: React.FC<Props> = ({ 
  user, 
  bookings, 
  onUpdateStatus, 
  onAcceptJob, 
  onSendMessage, 
  onMarkRead, 
  onUpdateAvailability, 
  onWithdrawFunds, 
  onDeclineJob, 
  onCancelJob, 
  onMakeOffer, 
  currentView, 
  onUpdateUser,
  onSettleFee
}) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  
  // Modals
  const [selectedChatBooking, setSelectedChatBooking] = useState<ServiceRequest | null>(null);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [offerBookingId, setOfferBookingId] = useState<string | null>(null);
  const [completionBooking, setCompletionBooking] = useState<ServiceRequest | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Calendar State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Generate date ribbon (14 days)
  const dateRibbon = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d;
    });
  }, []);

  // Data Filtering
  const myJobs = useMemo(() => bookings.filter(b => b.providerId === user.id), [bookings, user.id]);
  const activeJobs = useMemo(() => myJobs.filter(b => b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS'), [myJobs]);
  
  const jobsForSelectedDate = useMemo(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return activeJobs.filter(j => j.scheduledDateTime.startsWith(dateStr))
      .sort((a, b) => new Date(a.scheduledDateTime).getTime() - new Date(b.scheduledDateTime).getTime());
  }, [activeJobs, selectedDate]);

  const poolJobs = useMemo(() => {
    return bookings.filter(b => 
      b.status === 'PENDING' && 
      (b.providerId === user.id || (!b.providerId && b.category === user.category))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [bookings, user.id, user.category]);

  const totalFeesOwed = useMemo(() => { 
    return (user.feeRequests || []).filter(f => f.status === 'PENDING').reduce((acc, f) => acc + f.amount, 0); 
  }, [user.feeRequests]);

  const walletBalance = useMemo(() => {
    const cardJobs = myJobs.filter(j => j.paymentStatus === 'PAID' && j.paymentMethod === 'CARD');
    const totalCardRevenue = cardJobs.reduce((acc, j) => {
      const net = Math.max(0, (j.price || 0) - PLATFORM_FEE_FLAT);
      return acc + net;
    }, 0);
    const withdrawn = (user.withdrawals || []).filter(w => w.status === 'APPROVED' || w.status === 'PENDING').reduce((acc, w) => acc + w.amount, 0);
    return Math.max(0, totalCardRevenue - withdrawn);
  }, [myJobs, user.withdrawals]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayEarnings = myJobs
        .filter(j => j.paymentStatus === 'PAID' && j.date.startsWith(date))
        .reduce((sum, j) => {
           const amt = j.paymentMethod === 'CARD' ? Math.max(0, (j.price || 0) - PLATFORM_FEE_FLAT) : (j.price || 0);
           return sum + amt;
        }, 0);
      return {
        name: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
        earnings: dayEarnings
      };
    });
  }, [myJobs]);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard label={t('gross_revenue')} value={formatPrice(myJobs.reduce((a,b)=>a+(b.price||0),0))} icon={TrendingUp} color="bg-indigo-500" />
              <StatCard label={t('unpaid_fees')} value={formatPrice(totalFeesOwed)} icon={Receipt} color="bg-orange-500" />
              <StatCard label={t('my_rating')} value={user.rating?.toFixed(1) || '0.0'} icon={Star} color="bg-yellow-500" />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col min-h-[400px] overflow-hidden">
              <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50/20">
                  <h3 className="font-black dark:text-white flex items-center gap-2.5 uppercase tracking-[0.2em] text-[10px] text-indigo-600 leading-none"><List size={18} /> {t('nav_job_board')}</h3>
                  <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-800 px-3 py-1.5 rounded-full uppercase tracking-widest">{poolJobs.length} {t('open_jobs')}</span>
              </div>
              <div className="flex-1 overflow-y-auto divide-y dark:divide-gray-700 scrollbar-thin">
                {poolJobs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 p-16 opacity-30">
                      <Briefcase size={60} className="mb-4" />
                      <p className="text-sm font-black italic uppercase tracking-widest">{t('no_jobs_available')}</p>
                  </div>
                ) : poolJobs.map(job => (
                  <div key={job.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-900/40 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="min-w-0">
                        <h4 className="font-black text-base dark:text-white uppercase truncate leading-none tracking-tight mb-2">{job.customerName}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><MapPin size={16} className="text-indigo-500" /> {job.address}</span>
                          <span className="flex items-center gap-1.5"><CalendarIcon size={16} className="text-indigo-500" /> {new Date(job.scheduledDateTime).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Badge status={job.status} />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-bold italic mb-5 line-clamp-2">"{job.description}"</p>
                    <div className="flex gap-3">
                      <button onClick={() => setOfferBookingId(job.id)} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"> <DollarSign size={16} /> {t('make_offer')} </button>
                      <button onClick={() => onAcceptJob(job.id)} className="px-6 py-3 bg-white dark:bg-gray-800 border-2 dark:border-gray-700 text-indigo-600 dark:text-indigo-400 font-black rounded-xl text-[9px] uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95">{t('confirm')}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-10 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
              <div>
                <h2 className="text-3xl font-black dark:text-white uppercase tracking-tighter">{t('nav_schedule')}</h2>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">{activeJobs.length} {t('active_jobs')} në total</p>
              </div>
              <div className="flex items-center gap-3">
                 <div className="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2.5 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex items-center gap-3">
                    <CalendarIcon size={18} className="text-indigo-600" />
                    <span className="text-xs font-black dark:text-white uppercase tracking-tight">{selectedDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                 </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-[2rem] border dark:border-gray-700 shadow-sm overflow-hidden">
               <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2">
                  {dateRibbon.map((date, idx) => {
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    const isToday = date.toDateString() === new Date().toDateString();
                    const hasJobs = activeJobs.some(j => j.scheduledDateTime.startsWith(date.toISOString().split('T')[0]));
                    
                    return (
                      <button 
                        key={idx} 
                        onClick={() => setSelectedDate(date)}
                        className={`flex flex-col items-center min-w-[70px] py-4 rounded-[1.5rem] transition-all relative group ${
                          isSelected 
                            ? 'bg-indigo-600 text-white shadow-xl scale-105' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-400'
                        }`}
                      >
                         <span className={`text-[8px] font-black uppercase tracking-widest mb-2 ${isSelected ? 'text-indigo-100' : 'text-gray-400'}`}>
                           {date.toLocaleDateString(undefined, { weekday: 'short' })}
                         </span>
                         <span className="text-lg font-black leading-none">{date.getDate()}</span>
                         {isToday && !isSelected && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-600 rounded-full" />}
                         {hasJobs && (
                           <div className={`mt-2 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'}`} />
                         )}
                      </button>
                    );
                  })}
               </div>
            </div>

            <div className="space-y-6 relative pl-4 md:pl-8 before:content-[''] before:absolute before:left-[19px] md:before:left-[35px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gray-100 dark:before:bg-gray-800">
               {jobsForSelectedDate.length === 0 ? (
                 <div className="ml-10 py-20 bg-white dark:bg-gray-800 rounded-[2rem] border border-dashed dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 opacity-40">
                    <Clock size={48} className="mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Nuk ka punë të planifikuara për këtë ditë</p>
                 </div>
               ) : (
                 jobsForSelectedDate.map((job, idx) => {
                   const time = new Date(job.scheduledDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                   const isInProgress = job.status === 'IN_PROGRESS';
                   
                   return (
                     <div key={job.id} className="relative group animate-slide-in-right" style={{ animationDelay: `${idx * 0.1}s` }}>
                        <div className={`absolute left-[-26px] md:left-[-42px] top-6 w-6 h-6 rounded-full border-4 border-white dark:border-gray-900 shadow-sm z-10 transition-colors ${
                          isInProgress ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-600'
                        }`} />

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border dark:border-gray-700 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row gap-6 items-start md:items-center">
                           <div className="flex-shrink-0 min-w-[80px]">
                              <p className="text-xl font-black dark:text-white tracking-tighter mb-1">{time}</p>
                              <Badge status={job.status} />
                           </div>

                           <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-base font-black dark:text-white uppercase truncate tracking-tight">{job.customerName}</h4>
                                <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 rounded-md">{t(job.category)}</span>
                              </div>
                              <div className="flex items-center gap-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                 <span className="flex items-center gap-1.5"><MapPin size={14} className="text-indigo-600" /> {job.address}</span>
                                 <span className="flex items-center gap-1.5"><DollarSign size={14} className="text-indigo-600" /> {formatPrice(job.price || 0)}</span>
                              </div>
                              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 font-bold italic line-clamp-1 group-hover:line-clamp-none transition-all">"{job.description}"</p>
                           </div>

                           <div className="flex flex-wrap items-center gap-2 w-full md:w-auto mt-4 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 dark:border-gray-700">
                              <button onClick={() => setSelectedChatBooking(job)} className="p-3.5 bg-gray-50 dark:bg-gray-900 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-2xl transition-all relative">
                                <MessageSquare size={20} />
                                {job.messages.filter(m => !m.isRead && m.senderId !== user.id).length > 0 && (
                                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-md">
                                    {job.messages.filter(m => !m.isRead && m.senderId !== user.id).length}
                                  </span>
                                )}
                              </button>
                              
                              <button className="p-3.5 bg-gray-50 dark:bg-gray-900 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-2xl transition-all">
                                <Navigation size={20} />
                              </button>

                              {job.status === 'ACCEPTED' && (
                                <button onClick={() => onUpdateStatus(job.id, 'IN_PROGRESS')} className="flex-1 md:flex-none px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                                  <Play size={16} fill="currentColor" /> {t('start_job')}
                                </button>
                              )}
                              {job.status === 'IN_PROGRESS' && (
                                <button onClick={() => setCompletionBooking(job)} className="flex-1 md:flex-none px-6 py-3.5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-lg hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                                  <CheckCircle2 size={16} /> {t('finish_job')}
                                </button>
                              )}
                           </div>
                        </div>
                     </div>
                   );
                 })
               )}
            </div>
          </div>
        );

      case 'earnings':
        return (
          <div className="space-y-10 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500"><Wallet size={120} /></div>
                 <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md"><CreditCard size={24}/></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{t('available_withdraw')}</span>
                 </div>
                 <h3 className="text-4xl font-black leading-none mb-3">{formatPrice(walletBalance)}</h3>
                 <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{t('earnings_calculation_info')}</p>
                 <button onClick={() => setShowWithdrawalModal(true)} disabled={walletBalance <= 0} className="mt-8 w-full py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">{t('withdraw_funds')}</button>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500"><Receipt size={120} /></div>
                 <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md"><AlertCircle size={24}/></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{t('total_owed')}</span>
                 </div>
                 <h3 className="text-4xl font-black leading-none mb-3">{formatPrice(totalFeesOwed)}</h3>
                 <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Pending Platform Commissions</p>
                 <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-black/10 p-3 rounded-xl border border-white/10">
                   <Info size={16} /> <span>Pay fees to keep account active</span>
                 </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] border-2 border-indigo-50 dark:border-gray-700 shadow-sm relative overflow-hidden group flex flex-col justify-between">
                 <div className="absolute top-0 right-0 p-6 text-indigo-600 opacity-5 group-hover:scale-110 transition-transform duration-500"><Activity size={120} /></div>
                 <div>
                   <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl text-indigo-600"><TrendingUp size={24}/></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Projected Net</span>
                   </div>
                   <h3 className="text-4xl font-black leading-none mb-3 dark:text-white">
                      {formatPrice(myJobs.filter(j => j.status === 'ACCEPTED').reduce((acc, b) => acc + Math.max(0, (b.price || 0) - PLATFORM_FEE_FLAT), 0))}
                   </h3>
                   <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">From {activeJobs.length} Active Jobs (Net)</p>
                 </div>
                 <div className="mt-8 flex gap-2">
                    <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-3 rounded-xl">
                       <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Total Jobs</p>
                       <p className="text-lg font-black dark:text-white leading-none">{user.jobsCompleted}</p>
                    </div>
                    <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-3 rounded-xl">
                       <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Avg Rating</p>
                       <p className="text-lg font-black dark:text-white leading-none">{user.rating?.toFixed(1)}</p>
                    </div>
                 </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/40 text-orange-600 rounded-xl"><DollarSign size={18}/></div>
                  <h3 className="text-[11px] font-black uppercase tracking-widest dark:text-white">Pending Platform Fees</h3>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto divide-y dark:divide-gray-700 scrollbar-thin max-h-[300px]">
                {(user.feeRequests || []).filter(f => f.status !== 'PAID').length === 0 ? (
                  <div className="p-20 text-center text-gray-400">
                    <CheckCircle2 size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No outstanding fees</p>
                  </div>
                ) : (
                  (user.feeRequests || [])
                    .filter(f => f.status !== 'PAID')
                    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(fee => (
                      <div key={fee.id} className="p-6 flex flex-col sm:flex-row justify-between items-center gap-6 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-all group">
                        <div className="flex items-center gap-4 w-full">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${fee.status === 'VERIFYING' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'} transition-transform group-hover:scale-110`}>
                              <Receipt size={24}/>
                          </div>
                          <div>
                              <p className="text-xs font-black dark:text-white uppercase leading-none mb-2">{t(fee.bookingCategory)}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{new Date(fee.date).toLocaleDateString()}</span>
                                <Badge status={fee.status} />
                              </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                          <span className="text-xl font-black text-indigo-600 whitespace-nowrap">{formatPrice(fee.amount)}</span>
                          {fee.status === 'PENDING' && (
                            <button onClick={() => onSettleFee?.(fee.id)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">
                              {t('pay_platform')}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        );

      case 'profile':
        return <ProfileView user={user} onEdit={() => setShowEditModal(true)} />;

      default:
        return <div className="p-20 text-center text-gray-400 uppercase font-black text-xs tracking-widest">{t('view_not_found')}</div>;
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {renderContent()}

      <ChatModal isOpen={!!selectedChatBooking} onClose={() => setSelectedChatBooking(null)} booking={selectedChatBooking} currentUser={user} onSendMessage={onSendMessage} onMarkRead={onMarkRead} />
      <WithdrawalModal isOpen={showWithdrawalModal} onClose={() => setShowWithdrawalModal(false)} availableBalance={walletBalance} onWithdraw={onWithdrawFunds} />
      <OfferModal isOpen={!!offerBookingId} onClose={() => setOfferBookingId(null)} onSubmit={(min, max) => offerBookingId && onMakeOffer(offerBookingId, min, max)} />
      <JobCompletionModal isOpen={!!completionBooking} onClose={() => setCompletionBooking(null)} booking={completionBooking} onComplete={(id, price) => onUpdateStatus(id, 'COMPLETED', price)} />
      <EditProfileModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} user={user} onSave={onUpdateUser} />
    </div>
  );
};
