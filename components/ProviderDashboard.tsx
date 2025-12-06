

import React, { useState } from 'react';
import { User, ServiceRequest, Availability } from '../types';
import { Badge, StatCard, ChatModal, StarRating, WithdrawalModal, ConfirmationModal, OfferModal, useLanguage, useCurrency } from './Shared';
import { Briefcase, DollarSign, Star, Clock, MapPin, CheckCircle, MessageSquare, CreditCard, Banknote, Calendar, Wallet, TrendingUp, Settings, X, Save, ArrowUpRight, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  user: User;
  bookings: ServiceRequest[];
  currentView: string;
  onUpdateStatus: (bookingId: string, status: ServiceRequest['status']) => void;
  onAcceptJob: (bookingId: string) => void;
  onSendMessage: (bookingId: string, text: string) => void;
  onUpdateAvailability: (availability: Availability) => void;
  onWithdrawFunds: (amount: number, method: string) => void;
  onDeclineJob: (bookingId: string) => void;
  onCancelJob: (bookingId: string) => void;
  onMakeOffer: (bookingId: string, price: number) => void;
}

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
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6 animate-scale-in border dark:border-gray-700">
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
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('start_time')}</label><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('end_time')}</label><input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" /></div>
          </div>
          <button onClick={() => { onSave({ workingDays, startTime, endTime }); onClose(); }} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 flex items-center justify-center gap-2"><Save size={18} />{t('save')}</button>
        </div>
      </div>
    </div>
  );
};

export const ProviderDashboard: React.FC<Props> = ({ user, bookings, onUpdateStatus, onAcceptJob, onSendMessage, onUpdateAvailability, onWithdrawFunds, onDeclineJob, onCancelJob, onMakeOffer, currentView }) => {
  const { t } = useLanguage();
  const { formatPrice, convertPrice } = useCurrency();
  const [selectedChatBooking, setSelectedChatBooking] = useState<ServiceRequest | null>(null);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [offerBookingId, setOfferBookingId] = useState<string | null>(null);

  const myJobs = bookings.filter(b => b.providerId === user.id);
  const activeJobs = myJobs.filter(b => b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS' || b.status === 'OFFER_MADE');
  
  // Categorize Available Jobs
  const availableDirectRequests = bookings.filter(b => b.status === 'PENDING' && b.providerId === user.id);
  const availablePoolJobs = bookings.filter(b => b.status === 'PENDING' && !b.providerId && b.category === user.category);

  const PLATFORM_FEE_PERCENT = 0.15;
  const paidJobs = myJobs.filter(j => j.status === 'COMPLETED' && j.paymentStatus === 'PAID');
  
  const totalGrossEarnings = paidJobs.reduce((acc, curr) => acc + (curr.price || 150), 0);
  const totalFees = totalGrossEarnings * PLATFORM_FEE_PERCENT;
  const netEarnings = totalGrossEarnings - totalFees;
  const withdrawals = user.withdrawals || [];
  const totalWithdrawn = withdrawals.filter(w => w.status !== 'REJECTED').reduce((acc, w) => acc + w.amount, 0);
  const availableBalance = netEarnings - totalWithdrawn;

  const earningsByMonth = paidJobs.reduce((acc, job) => {
    const month = new Date(job.date).toLocaleString('default', { month: 'short' });
    if (!acc[month]) acc[month] = 0;
    acc[month] += (job.price || 150);
    return acc;
  }, {} as Record<string, number>);
  
  // Convert chart data based on currency
  const chartData = Object.entries(earningsByMonth).map(([name, amount]) => ({ 
    name, 
    amount: convertPrice(amount) 
  }));

  const handleMakeOfferSubmit = (price: number) => {
    if (offerBookingId) {
      onMakeOffer(offerBookingId, price);
      setOfferBookingId(null);
    }
  };

  if (currentView === 'earnings') {
    return (
        <div className="space-y-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('financial_overview')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label={t('gross_revenue')} value={formatPrice(totalGrossEarnings)} icon={DollarSign} color="bg-indigo-500" />
                <StatCard label={t('platform_fees')} value={formatPrice(totalFees)} icon={Wallet} color="bg-orange-500" />
                <StatCard label={t('net_earnings')} value={formatPrice(netEarnings)} icon={TrendingUp} color="bg-green-500" />
                 <StatCard label={t('withdrawn')} value={formatPrice(totalWithdrawn)} icon={ArrowUpRight} color="bg-purple-500" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{t('revenue')}</h3>
                    <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" /><XAxis dataKey="name" stroke="#9CA3AF" /><YAxis stroke="#9CA3AF" /><Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }} /><Bar dataKey="amount" fill="#10B981" barSize={40} /></BarChart>
                         </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-bold mb-2">{t('my_wallet')}</h3>
                        <div className="flex justify-between items-center text-sm"><span className="text-indigo-200">{t('available_withdraw')}</span></div>
                        <div className="font-bold text-4xl mt-2 mb-4">{formatPrice(availableBalance)}</div>
                    </div>
                    <button onClick={() => setShowWithdrawalModal(true)} disabled={availableBalance <= 0} className="w-full py-3 bg-white text-indigo-700 rounded-xl font-bold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"><Wallet size={20} /> {t('withdraw_funds')}</button>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700"><h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('job_transactions')}</h3></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold">
                            <tr><th className="px-6 py-4">{t('date')}</th><th className="px-6 py-4">{t('service_label')}</th><th className="px-6 py-4">{t('gross_revenue')}</th><th className="px-6 py-4">{t('net_earnings')}</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {paidJobs.map(job => (
                                <tr key={job.id} className="dark:text-gray-300"><td className="px-6 py-4 text-gray-500 dark:text-gray-400">{new Date(job.date).toLocaleDateString()}</td><td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{t(job.category)}</td><td className="px-6 py-4">{formatPrice(job.price||0)}</td><td className="px-6 py-4 font-bold text-green-600 dark:text-green-400">{formatPrice((job.price||0)*0.85)}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Withdrawal History */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700"><h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('withdrawal_history')}</h3></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold">
                            <tr>
                                <th className="px-6 py-4">{t('date')}</th>
                                <th className="px-6 py-4">{t('amount')}</th>
                                <th className="px-6 py-4">{t('method')}</th>
                                <th className="px-6 py-4">{t('status')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                             {withdrawals.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">{t('no_withdrawals')}</td></tr>
                             ) : (
                                withdrawals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(w => (
                                    <tr key={w.id} className="dark:text-gray-300">
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{new Date(w.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{formatPrice(w.amount)}</td>
                                        <td className="px-6 py-4">{w.method}</td>
                                        <td className="px-6 py-4"><Badge status={w.status} /></td>
                                    </tr>
                                ))
                             )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <WithdrawalModal isOpen={showWithdrawalModal} onClose={() => setShowWithdrawalModal(false)} availableBalance={availableBalance} onWithdraw={onWithdrawFunds} />
        </div>
    );
  }

  if (currentView === 'schedule') {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('my_schedule')}</h2>
              <button onClick={() => setShowAvailabilityModal(true)} className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"><Settings size={18} /> {t('manage_availability')}</button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {activeJobs.map(job => (
                        <div key={job.id} className="p-6">
                            <div className="flex justify-between items-start gap-4 mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2"><h4 className="text-lg font-bold text-gray-900 dark:text-white">{job.customerName}</h4><Badge status={job.status} /></div>
                                    <p className="text-gray-600 dark:text-gray-400 mb-2">{job.description}</p>
                                    {job.status === 'OFFER_MADE' && (
                                      <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{t('offer_sent')}: {formatPrice(job.price)}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setSelectedChatBooking(job)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"><MessageSquare size={16} /></button>
                                    {(job.status === 'ACCEPTED' || job.status === 'OFFER_MADE') && (
                                        <>
                                            <button onClick={() => setBookingToCancel(job.id)} className="px-4 py-2 border border-red-300 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">{t('cancel_job')}</button>
                                            {job.status === 'ACCEPTED' && <button onClick={() => onUpdateStatus(job.id, 'IN_PROGRESS')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{t('start_job')}</button>}
                                        </>
                                    )}
                                    {job.status === 'IN_PROGRESS' && <button onClick={() => onUpdateStatus(job.id, 'COMPLETED')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">{t('complete_job')}</button>}
                                </div>
                            </div>
                        </div>
                    ))}
                    {activeJobs.length === 0 && (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        {t('no_scheduled_jobs')}
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
                title={t('cancel_booking_title')} 
                message={t('cancel_job_confirm')} 
                confirmLabel={t('yes_cancel')} 
                cancelLabel={t('no_keep')} 
                isDestructive 
            />
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label={t('active_jobs')} value={activeJobs.length} icon={Briefcase} color="bg-blue-500" />
        <StatCard label={t('completed_jobs')} value={myJobs.filter(j => j.status === 'COMPLETED').length} icon={CheckCircle} color="bg-green-500" />
        <StatCard label={t('my_rating')} value={user.rating ? user.rating.toFixed(1) : "N/A"} icon={Star} color="bg-yellow-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[500px]">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 shrink-0"><h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('nav_job_board')}</h3></div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
              {availableDirectRequests.length > 0 && (
                  <>
                      <div className="px-6 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">{t('direct_requests')}</div>
                      {availableDirectRequests.map(job => (
                          <div key={job.id} className="p-6 bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/20 transition-colors border-l-4 border-indigo-500">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{job.customerName}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{job.description}</p>
                            <div className="flex gap-3">
                                <button onClick={() => onDeclineJob(job.id)} className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-white dark:hover:bg-gray-700">{t('decline_job')}</button>
                                <button onClick={() => setOfferBookingId(job.id)} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">{t('make_offer')}</button>
                            </div>
                          </div>
                      ))}
                  </>
              )}
              
              <div className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-xs font-bold uppercase tracking-wider">{t('open_jobs')}</div>
              {availablePoolJobs.length === 0 ? (
                 <div className="p-8 text-center text-gray-500 dark:text-gray-400"><Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" /><p>{t('no_jobs_available')}</p></div>
              ) : (
                 availablePoolJobs.map(job => (
                    <div key={job.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{job.customerName}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{job.description}</p>
                        <button onClick={() => setOfferBookingId(job.id)} className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">{t('make_offer')}</button>
                    </div>
                 ))
              )}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[500px]">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 shrink-0"><h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('active_jobs')}</h3></div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
              {activeJobs.map(job => (
                <div key={job.id} className="p-6">
                  <div className="flex justify-between items-start mb-2"><h4 className="font-semibold text-gray-900 dark:text-white">{job.customerName}</h4><Badge status={job.status} /></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{job.description}</p>
                  {job.status === 'OFFER_MADE' && (
                     <div className="flex gap-2 mt-4 items-center">
                        <Clock size={16} className="text-blue-500" />
                        <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{t('waiting_approval')} ({formatPrice(job.price)})</span>
                     </div>
                  )}
                  {job.status === 'ACCEPTED' && (
                     <div className="flex gap-2 mt-4">
                        <button onClick={() => setBookingToCancel(job.id)} className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 underline">{t('cancel_job')}</button>
                     </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
      <ConfirmationModal 
            isOpen={!!bookingToCancel} 
            onClose={() => setBookingToCancel(null)} 
            onConfirm={() => { if (bookingToCancel) onCancelJob(bookingToCancel); }} 
            title={t('cancel_booking_title')} 
            message={t('cancel_job_confirm')} 
            confirmLabel={t('yes_cancel')} 
            cancelLabel={t('no_keep')} 
            isDestructive 
      />
      <OfferModal 
        isOpen={!!offerBookingId} 
        onClose={() => setOfferBookingId(null)} 
        onSubmit={handleMakeOfferSubmit} 
      />
    </div>
  );
};