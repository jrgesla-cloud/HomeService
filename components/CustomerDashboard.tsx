
import React, { useState, useMemo } from 'react';
import { ServiceRequest, AIAnalysisResult, User, PaymentMethod, CategoryItem, ServiceOffer } from '../types';
import { analyzeServiceRequest } from '../services/geminiService';
import { Badge, ChatModal, RatingModal, PaymentModal, useLanguage, useCurrency, MessagesView, ProfileView, EditProfileModal } from './Shared';
import { Sparkles, MapPin, Calendar, Search, Loader2, Star, MessageSquare, X, PlusCircle, ShieldCheck, ChevronRight, ChevronLeft, Clock, Hammer, Play, Zap, User as UserIcon, LayoutGrid, CheckCircle2, Info, Gavel } from 'lucide-react';

interface Props {
  user: User;
  bookings: ServiceRequest[];
  onCreateBooking: (booking: Omit<ServiceRequest, 'id' | 'status' | 'date' | 'providerName' | 'messages' | 'rating' | 'review' | 'paymentStatus'>) => void;
  onSendMessage: (bookingId: string, text: string) => void;
  onMarkRead: (bookingId: string) => void; 
  onRateService: (bookingId: string, rating: number, review: string) => void;
  onProcessPayment: (bookingId: string, method: PaymentMethod) => void;
  onCancelBooking: (bookingId: string) => void;
  currentView: string;
  onViewChange: (view: string) => void;
  onUpdateUser: (user: User) => void;
  serviceCategories: CategoryItem[];
  providers: User[];
  onAcceptOffer: (bookingId: string, offerId?: string) => void;
  onDeclineOffer: (bookingId: string, offerId?: string) => void;
}

export const CustomerDashboard: React.FC<Props> = ({ user, bookings, onCreateBooking, onSendMessage, onMarkRead, onRateService, onProcessPayment, onCancelBooking, currentView, onViewChange, onUpdateUser, serviceCategories, providers, onAcceptOffer, onDeclineOffer }) => {
  const { t, language } = useLanguage();
  const { formatPrice } = useCurrency();
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AIAnalysisResult | null>(null);
  
  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStep, setBookingStep] = useState<1 | 2>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState(user.address || '');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [targetProviderId, setTargetProviderId] = useState<string | undefined>(undefined);

  // Other Modal States
  const [selectedChatBooking, setSelectedChatBooking] = useState<ServiceRequest | null>(null);
  const [paymentBooking, setPaymentBooking] = useState<ServiceRequest | null>(null);
  const [ratingBooking, setRatingBooking] = useState<ServiceRequest | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewingOffersBooking, setViewingOffersBooking] = useState<ServiceRequest | null>(null);

  // Filters
  const [providerFilter, setProviderFilter] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');

  // Map 'dashboard' to the categories landing page
  const activeView = currentView === 'dashboard' ? 'categories' : currentView;
  
  // Categorize bookings for better display
  const pendingOfferBookings = useMemo(() => bookings.filter(b => b.status === 'OFFER_MADE'), [bookings]);
  const activeJobs = useMemo(() => bookings.filter(b => b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS'), [bookings]);

  const handleAISearch = async () => {
    if (!searchQuery.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeServiceRequest(searchQuery, language);
      if (result) {
          setDescription(searchQuery);
          setSelectedCategory(result.category);
          setAiSuggestion(result);
          setTargetProviderId(undefined);
          setBookingStep(1);
          setShowBookingModal(true);
      }
    } catch (e) { console.error(e); }
    finally { setIsAnalyzing(false); }
  };

  const finalizeBooking = (providerId?: string) => {
    const finalPid = providerId || targetProviderId;
    onCreateBooking({ 
      customerId: user.id, 
      customerName: user.name, 
      category: selectedCategory, 
      description, 
      price: 0, 
      address, 
      scheduledDateTime: `${bookingDate}T${bookingTime}:00`, 
      providerId: finalPid,
      aiPriceRange: aiSuggestion?.estimatedPriceRange 
    });
    resetBookingModal();
    onViewChange('history');
  };

  const resetBookingModal = () => { 
    setShowBookingModal(false); 
    setBookingStep(1); 
    setAiSuggestion(null); 
    setTargetProviderId(undefined);
    setDescription('');
    setBookingDate('');
    setBookingTime('');
  };

  const handleCategorySelect = (catName: string) => {
    const cat = serviceCategories.find(c => c.name === catName);
    setSelectedCategory(catName); 
    setTargetProviderId(undefined);
    setBookingStep(1);
    setShowBookingModal(true); 
  };

  const openBooking = (cat: string = '', providerId?: string) => { 
    setSelectedCategory(cat || serviceCategories[0]?.name || ''); 
    setTargetProviderId(providerId);
    setBookingStep(1);
    setShowBookingModal(true); 
  };

  const renderViewContent = () => {
    switch (activeView) {
      case 'profile':
        return <ProfileView user={user} onEdit={() => setShowEditModal(true)} />;

      case 'categories':
        return (
          <div className="space-y-8 animate-fade-in">
             <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-[2rem] p-6 md:p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10 translate-x-1/4 -translate-y-1/4"><Sparkles size={250} /></div>
                <div className="relative z-10 max-w-3xl">
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-[0.2em] mb-3">
                      HomeHero AI
                    </span>
                    <h2 className="text-2xl md:text-4xl font-black mb-6 leading-[1.1] tracking-tighter">
                      {t('find_perfect_pro')}
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                              type="text" 
                              value={searchQuery} 
                              onChange={e => setSearchQuery(e.target.value)} 
                              onKeyDown={e => e.key === 'Enter' && handleAISearch()}
                              placeholder={t('ai_search_placeholder')} 
                              className="w-full pl-11 pr-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/10 border-0 shadow-xl font-bold text-sm placeholder:text-gray-400" 
                            />
                        </div>
                        <button 
                          onClick={handleAISearch} 
                          disabled={isAnalyzing}
                          className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-black uppercase tracking-wider text-xs hover:scale-[1.02] transition-all flex items-center justify-center shadow-xl active:scale-95 disabled:opacity-70"
                        >
                            {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles className="mr-2" size={18} />}
                            {t('ai_search_btn')}
                        </button>
                    </div>
                </div>
             </div>

             {pendingOfferBookings.length > 0 && (
               <section className="animate-slide-in-right">
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-600 rounded-lg">
                      <Zap size={16} className="fill-purple-600" />
                    </div>
                    <h3 className="text-sm font-black dark:text-white uppercase tracking-tight">Propozime të Reja</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingOfferBookings.map(b => (
                      <div key={b.id} className="bg-white dark:bg-gray-800 p-4 rounded-3xl border-2 border-purple-100 dark:border-purple-900/40 shadow-sm flex items-center justify-between group hover:border-purple-500 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/40 text-purple-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                            <Gavel size={24} />
                          </div>
                          <div>
                            <h4 className="font-black dark:text-white text-sm uppercase tracking-tight">{t(b.category)}</h4>
                            <p className="text-[8px] font-black text-purple-600 uppercase tracking-widest mt-1">
                               {b.offers?.length} Ofertë të reja
                            </p>
                          </div>
                        </div>
                        <button onClick={() => setViewingOffersBooking(b)} className="px-4 py-2 bg-purple-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg hover:bg-purple-700 active:scale-95 transition-all">
                          Shiko
                        </button>
                      </div>
                    ))}
                  </div>
               </section>
             )}

             <section>
                <div className="flex justify-between items-center mb-6 px-2">
                    <h2 className="text-lg font-black dark:text-white uppercase tracking-tight flex items-center gap-2">
                      <LayoutGrid size={22} className="text-indigo-600" />
                      {t('popular_services')}
                    </h2>
                    <button onClick={() => onViewChange('providers')} className="text-indigo-600 font-black uppercase text-[8px] tracking-widest hover:underline">
                      {t('nav_users')} →
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                    {serviceCategories.map(cat => (
                      <button 
                        key={cat.id} 
                        onClick={() => handleCategorySelect(cat.name)}
                        className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col items-center text-center space-y-2 active:scale-95"
                      >
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-[1.75rem] flex items-center justify-center text-3xl md:text-4xl shadow-inner group-hover:scale-110 transition-transform relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          {cat.icon}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black dark:text-white uppercase text-[10px] md:text-xs tracking-tight truncate">{t(cat.name)}</h4>
                          <p className="text-[7px] md:text-[8px] text-indigo-600 font-black uppercase tracking-widest mt-0.5 opacity-60">
                            {formatPrice(cat.basePrice)}
                          </p>
                        </div>
                      </button>
                    ))}
                </div>
             </section>
          </div>
        );
      
      case 'providers':
        const filteredProviders = providers.filter(p => 
          (catFilter === 'ALL' || p.category === catFilter) &&
          (p.name.toLowerCase().includes(providerFilter.toLowerCase()))
        );
        return (
          <div className="space-y-10 animate-fade-in">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-3">
                  <button onClick={() => onViewChange('dashboard')} className="p-2.5 bg-white dark:bg-gray-800 border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors shadow-sm">
                    <ChevronLeft size={20} className="text-gray-400" />
                  </button>
                  <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">{t('select_provider')}</h2>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                   <div className="relative flex-1">
                     <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                     <input value={providerFilter} onChange={e => setProviderFilter(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl text-xs font-black uppercase" placeholder={t('nav_users')} />
                   </div>
                   <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest">
                      <option value="ALL">{t('all_statuses')}</option>
                      {serviceCategories.map(c => <option key={c.id} value={c.name}>{t(c.name)}</option>)}
                   </select>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProviders.map(p => (
                  <div key={p.id} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl transition-all group flex flex-col justify-between">
                     <div className="flex gap-5 mb-6">
                        <img src={p.avatarUrl} className="w-20 h-20 rounded-xl object-cover border dark:border-gray-700 shadow-sm" />
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2 mb-1.5">
                              <h4 className="font-black dark:text-white truncate uppercase text-base tracking-tight">{p.name}</h4>
                              {p.isVerified && <ShieldCheck size={20} className="text-indigo-600" />}
                           </div>
                           <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{t(p.category || '')}</p>
                           <div className="flex items-center gap-2.5 mt-3">
                              <Star size={16} className="text-yellow-400 fill-yellow-400" />
                              <span className="text-sm font-black dark:text-white">{p.rating?.toFixed(1) || 'N/A'}</span>
                              <span className="text-[10px] text-gray-400 font-bold ml-1">({p.jobsCompleted || 0} {t('completed_jobs')})</span>
                           </div>
                        </div>
                     </div>
                     <div className="space-y-5">
                        <div className="flex justify-between items-center py-3 border-y border-gray-50 dark:border-gray-700/50">
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('enter_price')}</span>
                           <span className="text-lg font-black text-indigo-600">{formatPrice(p.hourlyRate || 0)}/h</span>
                        </div>
                        <button onClick={() => openBooking(p.category, p.id)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3">
                           <PlusCircle size={20} /> {t('book_service')}
                        </button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        );

      case 'history':
        return (
          <div className="space-y-8 animate-fade-in">
              <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight mb-4 px-2">{t('booking_history')}</h2>
              {bookings.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 p-24 rounded-3xl text-center text-gray-400 border border-dashed dark:border-gray-700">
                  <Clock size={80} className="mx-auto mb-6 opacity-10" />
                  <p className="font-black text-lg italic uppercase tracking-widest">{t('no_bookings')}</p>
                </div>
              ) : bookings.map(b => (
                  <div key={b.id} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-lg">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <span className="text-xl font-black dark:text-white uppercase tracking-tight">{t(b.category)}</span>
                              <Badge status={b.status} />
                              {b.offers && b.offers.length > 0 && b.status === 'OFFER_MADE' && (
                                <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                  <Zap size={10} className="fill-purple-700" />
                                  {b.offers.length} {t('offers_count')}
                                </span>
                              )}
                            </div>
                            <p className="text-base text-gray-600 dark:text-gray-400 mb-5 leading-relaxed font-bold italic">"{b.description}"</p>
                            <div className="flex flex-wrap gap-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                               <span className="flex items-center gap-2"><Calendar size={20} className="text-indigo-600" /> {new Date(b.scheduledDateTime).toLocaleDateString()}</span>
                               <span className="flex items-center gap-2"><MapPin size={20} className="text-indigo-600" /> {b.address}</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto pt-6 md:pt-0">
                            {b.status === 'OFFER_MADE' && (
                              <button onClick={() => setViewingOffersBooking(b)} className="px-6 py-3 bg-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-purple-700 active:scale-95 transition-all flex items-center gap-2">
                                <Zap size={16}/> {t('accept_offer')}
                              </button>
                            )}
                            {b.status === 'COMPLETED' && b.paymentStatus === 'UNPAID' && (
                              <button onClick={() => setPaymentBooking(b)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">
                                {t('pay_now')}
                              </button>
                            )}
                            {b.status === 'COMPLETED' && !b.rating && (
                              <button onClick={() => setRatingBooking(b)} className="px-6 py-3 bg-white dark:bg-gray-800 border-2 border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-50 transition-all">
                                {t('rate_service')}
                              </button>
                            )}
                            {b.providerId && (
                              <button onClick={() => { setSelectedChatBooking(b); onMarkRead(b.id); }} className="p-4 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl hover:scale-110 transition-transform relative">
                                <MessageSquare size={26} />
                                {b.messages.filter(m => !m.isRead && m.senderId !== user.id).length > 0 && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-md">{b.messages.filter(m => !m.isRead && m.senderId !== user.id).length}</span>}
                              </button>
                            )}
                            {(b.status === 'PENDING' || b.status === 'OFFER_MADE') && (
                              <button onClick={() => onCancelBooking(b.id)} className="p-4 text-red-500 bg-red-50 dark:bg-red-900/30 rounded-xl hover:scale-110 transition-transform">
                                <X size={26} />
                              </button>
                            )}
                        </div>
                      </div>
                  </div>
              ))}
          </div>
        );

      case 'messages':
        return <MessagesView user={user} bookings={bookings} onSendMessage={onSendMessage} onMarkRead={onMarkRead} />;

      default:
        return null;
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">
            {t('welcome_back')}, {user.name.split(' ')[0]}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-black text-sm mt-2 uppercase tracking-widest">
            {t('find_perfect_pro')}
          </p>
        </div>
        <div className="flex bg-white dark:bg-gray-800 rounded-2xl p-1.5 shadow-sm border border-gray-100 dark:border-gray-700">
          <button onClick={() => onViewChange('dashboard')} className={`px-6 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${activeView === 'categories' ? 'bg-indigo-600 text-white shadow-xl' : 'text-gray-500 hover:text-indigo-600'}`}>{t('nav_overview')}</button>
          <button onClick={() => onViewChange('providers')} className={`px-6 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${activeView === 'providers' ? 'bg-indigo-600 text-white shadow-xl' : 'text-gray-500 hover:text-indigo-600'}`}>{t('nav_users')}</button>
          <button onClick={() => onViewChange('history')} className={`px-6 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${activeView === 'history' ? 'bg-indigo-600 text-white shadow-xl' : 'text-gray-500 hover:text-indigo-600'}`}>{t('nav_history')}</button>
          <button onClick={() => onViewChange('messages')} className={`px-6 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${activeView === 'messages' ? 'bg-indigo-600 text-white shadow-xl' : 'text-gray-500 hover:text-indigo-600'}`}>{t('nav_messages')}</button>
        </div>
      </div>

      {viewingOffersBooking && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
           <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-2xl shadow-2xl p-10 flex flex-col border dark:border-gray-700 animate-scale-in">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight flex items-center gap-3">
                    <Zap size={28} className="text-purple-600 fill-purple-600" />
                    Krahasoni Ofertat
                  </h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{t(viewingOffersBooking.category)} • {viewingOffersBooking.offers?.length || 0} Propozime aktive</p>
                </div>
                <button onClick={() => setViewingOffersBooking(null)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><X size={28}/></button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 scrollbar-thin pr-4 max-h-[500px]">
                {viewingOffersBooking.offers?.map(offer => (
                   <div key={offer.id} className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-[2rem] border-2 border-transparent hover:border-indigo-500 transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 px-4 py-2 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity">
                        Sugjerim
                      </div>
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div className="flex items-center gap-6">
                          <img src={offer.providerAvatar || 'https://picsum.photos/100'} className="w-20 h-20 rounded-[1.5rem] object-cover border-4 border-white dark:border-gray-800 shadow-xl" />
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                               <p className="text-xl font-black dark:text-white uppercase tracking-tight leading-none">{offer.providerName}</p>
                               <div className="flex items-center gap-1.5 bg-yellow-400 text-white px-2 py-0.5 rounded text-[10px] font-black">
                                 <Star size={12} className="fill-white" /> {offer.providerRating || 'N/A'}
                               </div>
                            </div>
                            <div className="flex items-center gap-4 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                               <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-indigo-600" /> {t('verified')}</span>
                               <span>•</span>
                               <span className="flex items-center gap-1.5"><Hammer size={14} className="text-indigo-600" /> Specialist</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right bg-white dark:bg-gray-800 p-5 rounded-2xl border dark:border-gray-700 shadow-sm min-w-[160px]">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('offer_price')}</p>
                          <p className="text-2xl font-black text-indigo-600">
                             {formatPrice(offer.minPrice)} - {formatPrice(offer.maxPrice)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-8 pt-6 border-t dark:border-gray-700 flex justify-end items-center gap-6">
                        <button onClick={() => onDeclineOffer(viewingOffersBooking.id, offer.id)} className="text-[10px] font-black uppercase text-gray-400 hover:text-red-500 transition-colors tracking-widest">Refuzo</button>
                        <button onClick={() => { onAcceptOffer(viewingOffersBooking.id, offer.id); setViewingOffersBooking(null); }} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all flex items-center gap-3 group/btn active:scale-95">
                          <CheckCircle2 size={20} /> Prano Ofertën
                        </button>
                      </div>
                   </div>
                ))}
              </div>
              <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center gap-3">
                <Info size={18} className="text-indigo-600 shrink-0" />
                <p className="text-[9px] font-bold text-gray-600 dark:text-indigo-400 uppercase tracking-widest leading-relaxed">
                  Zgjidhni një ofertë për të vazhduar. Pagesa bëhet vetëm pasi shërbimi të përfundojë.
                </p>
              </div>
           </div>
        </div>
      )}

      {renderViewContent()}

      {showBookingModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl">
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] w-full max-w-lg shadow-2xl p-8 animate-scale-in border dark:border-gray-700">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black dark:text-white uppercase tracking-tight">{bookingStep === 1 ? t('book_service') : t('choose_provider')}</h3>
                  <button onClick={resetBookingModal} className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><X size={24}/></button>
                </div>
                {bookingStep === 1 ? (
                    <form onSubmit={e => { e.preventDefault(); if (targetProviderId) finalizeBooking(targetProviderId); else setBookingStep(2); }} className="space-y-5">
                        {targetProviderId && (
                          <div className="p-5 bg-indigo-50 dark:bg-indigo-900/30 rounded-[1.25rem] flex items-center gap-5 border border-indigo-100 dark:border-indigo-800 shadow-sm">
                             <img src={providers.find(p => p.id === targetProviderId)?.avatarUrl} className="w-14 h-14 rounded-xl border dark:border-gray-700 shadow-md object-cover" />
                             <div>
                                <p className="text-[9px] font-black uppercase text-indigo-600 tracking-widest leading-none mb-1.5">{t('pro_assigned')}</p>
                                <p className="text-base font-black dark:text-white">{providers.find(p => p.id === targetProviderId)?.name}</p>
                             </div>
                          </div>
                        )}
                        {!targetProviderId && (
                          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border-2 border-dashed border-purple-200 dark:border-purple-800 flex items-center gap-4">
                             <Zap size={24} className="text-purple-600" />
                             <p className="text-[10px] font-black text-purple-700 dark:text-purple-400 uppercase tracking-widest leading-tight">
                               Punë e hapur: Kjo kërkesë do t'u dërgohet të gjithë profesionistëve në platformë.
                             </p>
                          </div>
                        )}
                        <div>
                          <label className="block text-[9px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">{t('service_label')}</label>
                          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full px-5 py-3.5 text-xs border-2 border-gray-50 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-4 focus:ring-indigo-500 font-black tracking-tight" disabled={!!targetProviderId}>
                            {serviceCategories.map(c => <option key={c.id} value={c.name}>{t(c.name)}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">{t('issue_description')}</label>
                          <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full px-5 py-3.5 text-xs border-2 border-gray-50 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-4 focus:ring-indigo-500 resize-none font-bold leading-relaxed" placeholder="..." rows={4} />
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                              <label className="block text-[9px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">{t('preferred_date')}</label>
                              <input type="date" required value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="w-full px-5 py-3.5 text-[10px] border-2 border-gray-50 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-4 focus:ring-indigo-500 font-black" />
                            </div>
                            <div>
                              <label className="block text-[9px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">{t('preferred_time')}</label>
                              <input type="time" required value={bookingTime} onChange={e => setBookingTime(e.target.value)} className="w-full px-5 py-3.5 text-[10px] border-2 border-gray-50 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-4 focus:ring-indigo-500 font-black" />
                            </div>
                        </div>
                        <div>
                          <label className="block text-[9px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">{t('address')}</label>
                          <input required value={address} onChange={e => setAddress(e.target.value)} className="w-full px-5 py-3.5 text-xs border-2 border-gray-50 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-4 focus:ring-indigo-500 font-black" placeholder="..." />
                        </div>
                        <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-indigo-700 transition-all mt-4 active:scale-[0.98]">
                          {targetProviderId ? t('book_service') : 'Dërgo Kërkesën te të Gjithë'}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-5">
                        <button onClick={() => finalizeBooking()} className="w-full text-left p-6 rounded-[1.5rem] border-2 border-dashed border-indigo-100 dark:border-indigo-900/40 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 group transition-all">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl"><Sparkles size={28} /></div>
                            <div>
                              <p className="text-base font-black dark:text-white uppercase tracking-tight leading-none">{t('any_provider')}</p>
                              <p className="text-[9px] text-indigo-600 font-black tracking-widest uppercase mt-2.5">{t('recommended')}</p>
                            </div>
                          </div>
                        </button>
                        <p className="text-[9px] font-black uppercase text-gray-400 ml-1 tracking-widest">{t('select_provider')}</p>
                        <div className="max-h-64 overflow-y-auto pr-2 scrollbar-thin space-y-3.5">
                          {providers.filter(p => p.category === selectedCategory).map(p => (
                              <button key={p.id} onClick={() => finalizeBooking(p.id)} className="w-full text-left p-5 rounded-[1.25rem] border-2 border-gray-50 dark:border-gray-700 hover:border-indigo-500 flex items-center justify-between transition-all bg-white dark:bg-gray-900/50 hover:shadow-lg">
                                  <div className="flex items-center gap-4">
                                    <img src={p.avatarUrl} className="w-12 h-12 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm object-cover" />
                                    <div>
                                      <p className="text-sm font-black dark:text-white uppercase tracking-tight">{p.name}</p>
                                      <div className="flex items-center gap-1 mt-1">
                                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                        <span className="text-[9px] font-bold text-gray-500">{p.rating?.toFixed(1)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <span className="text-[11px] font-black dark:text-white bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border-2 border-gray-100 dark:border-gray-700">{formatPrice(p.hourlyRate || 0)}/h</span>
                              </button>
                          ))}
                        </div>
                        <button onClick={() => setBookingStep(1)} className="w-full py-3 text-gray-400 font-black uppercase tracking-widest text-[9px] hover:text-indigo-600 transition-colors">{t('back')}</button>
                    </div>
                )}
            </div>
        </div>
      )}

      <PaymentModal isOpen={!!paymentBooking} onClose={() => setPaymentBooking(null)} booking={paymentBooking} onProcessPayment={onProcessPayment} />
      <RatingModal isOpen={!!ratingBooking} onClose={() => setRatingBooking(null)} booking={ratingBooking} onSubmit={onRateService} />
      <ChatModal isOpen={!!selectedChatBooking} onClose={() => setSelectedChatBooking(null)} booking={selectedChatBooking} currentUser={user} onSendMessage={onSendMessage} onMarkRead={onMarkRead} />
      <EditProfileModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} user={user} onSave={onUpdateUser} />
    </div>
  );
};
