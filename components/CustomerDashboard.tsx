

import React, { useState, useRef, useEffect } from 'react';
import { ServiceRequest, AIAnalysisResult, User, PaymentMethod, CategoryItem } from '../types';
import { analyzeServiceRequest } from '../services/geminiService';
import { Badge, ChatModal, RatingModal, StarRating, PaymentModal, ConfirmationModal, useLanguage, useCurrency } from './Shared';
import { Sparkles, ArrowRight, MapPin, Calendar, Search, Loader2, Star, Check, MessageSquare, Mail, Phone, Shield, CreditCard, Banknote, XCircle, X, DollarSign, CheckCircle } from 'lucide-react';

interface Props {
  user: User;
  bookings: ServiceRequest[];
  onCreateBooking: (booking: Omit<ServiceRequest, 'id' | 'status' | 'date' | 'providerName' | 'messages' | 'rating' | 'review' | 'paymentStatus'>) => void;
  onSendMessage: (bookingId: string, text: string) => void;
  onRateService: (bookingId: string, rating: number, review: string) => void;
  onProcessPayment: (bookingId: string, method: PaymentMethod) => void;
  onCancelBooking: (bookingId: string) => void;
  currentView: string;
  onViewChange: (view: string) => void;
  onUpdateUser: (user: User) => void;
  serviceCategories: CategoryItem[];
  providers: User[];
  onAcceptOffer: (bookingId: string) => void;
  onDeclineOffer: (bookingId: string) => void;
}

export const CustomerDashboard: React.FC<Props> = ({ user, bookings, onCreateBooking, onSendMessage, onRateService, onProcessPayment, onCancelBooking, currentView, onViewChange, onUpdateUser, serviceCategories, providers, onAcceptOffer, onDeclineOffer }) => {
  const { t, language } = useLanguage();
  const { formatPrice } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AIAnalysisResult | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStep, setBookingStep] = useState<1 | 2>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');

  const [selectedChatBooking, setSelectedChatBooking] = useState<ServiceRequest | null>(null);
  const [selectedRatingBooking, setSelectedRatingBooking] = useState<ServiceRequest | null>(null);
  const [selectedPaymentBooking, setSelectedPaymentBooking] = useState<ServiceRequest | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<ServiceRequest | null>(null);

  const activeView = currentView === 'dashboard' ? 'browse' : currentView;

  // Filter categories based on search query
  const filteredCategories = searchQuery.trim() 
    ? serviceCategories.filter(cat => 
        t(cat.name).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAISearch = async () => {
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    setIsAnalyzing(true);
    setAiSuggestion(null);
    try {
      const result = await analyzeServiceRequest(searchQuery, language);
      setAiSuggestion(result);
      if (result) {
          setDescription(searchQuery);
          setSelectedCategory(result.category);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBookingDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategory && description && address) {
        setBookingStep(2); // Move to Provider Selection
    }
  };

  const finalizeBooking = (providerId?: string) => {
    onCreateBooking({
        customerId: user.id,
        customerName: user.name,
        category: selectedCategory,
        description,
        price: 0, 
        address,
        providerId: providerId
    });
    resetBookingModal();
    onViewChange('history');
  };

  const resetBookingModal = () => {
    setShowBookingModal(false);
    setBookingStep(1);
    setSearchQuery('');
    setAiSuggestion(null);
    setDescription('');
    setAddress('');
    setSelectedProviderId(null);
  };

  const openBooking = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setShowSuggestions(false);
    setShowBookingModal(true);
  };

  const availableProviders = providers.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('welcome_back')}, {user.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('find_perfect_pro')}</p>
        </div>
        <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700">
          <button onClick={() => onViewChange('dashboard')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeView === 'browse' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>{t('nav_browse')}</button>
          <button onClick={() => onViewChange('history')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeView === 'history' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>{t('nav_history')}</button>
          <button onClick={() => onViewChange('profile')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeView === 'profile' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>{t('nav_profile')}</button>
        </div>
      </div>

      {activeView === 'browse' && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl relative overflow-visible">
             <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl overflow-hidden pointer-events-none"></div>
            
            <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-2 mb-4 text-indigo-100">
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                    <span className="font-semibold tracking-wide uppercase text-xs">AI-Powered</span>
                </div>
                <h2 className="text-3xl font-bold mb-4">{t('find_perfect_pro')}</h2>
                
                <div className="relative" ref={searchContainerRef}>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleAISearch();
                                    setShowSuggestions(false);
                                }
                            }}
                            placeholder={t('ai_search_placeholder')}
                            className="flex-1 px-5 py-4 rounded-xl text-gray-900 dark:text-white dark:bg-white/10 dark:placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 dark:focus:ring-white/20 border-0"
                        />
                        <button 
                            onClick={handleAISearch}
                            disabled={isAnalyzing}
                            className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-colors disabled:opacity-70 flex items-center"
                        >
                            {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Real-time Suggestions Dropdown */}
                    {showSuggestions && searchQuery.trim() && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-20 animate-scale-in origin-top">
                            {filteredCategories.length > 0 && (
                                <div className="p-2">
                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 uppercase tracking-wider">{t('nav_services')}</div>
                                    {filteredCategories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => openBooking(cat.name)}
                                            className="w-full text-left px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg flex items-center gap-3 transition-colors"
                                        >
                                            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-sm">
                                                {cat.icon}
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-white">{t(cat.name)}</span>
                                            <span className="text-xs text-gray-400 ml-auto">{t('book_service')}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            
                            <div className="border-t border-gray-100 dark:border-gray-700 p-2">
                                <button
                                    onClick={handleAISearch}
                                    className="w-full text-left px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg flex items-center gap-3 transition-colors group"
                                >
                                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
                                        <Sparkles size={14} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{t('ai_search_btn')}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                                            "{searchQuery}"
                                        </p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                
                {aiSuggestion && (
                    <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 animate-fade-in">
                        <div className="flex items-start gap-3">
                            <div className="bg-green-400/20 p-2 rounded-lg">
                                <Check className="w-5 h-5 text-green-300" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{t(aiSuggestion.category)}</h3>
                                <p className="text-indigo-100 text-sm mt-1">{aiSuggestion.reasoning}</p>
                            </div>
                            <button 
                                onClick={() => openBooking(aiSuggestion.category)}
                                className="ml-auto bg-white text-indigo-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-100"
                            >
                                {t('book_service')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('popular_services')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {serviceCategories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => openBooking(cat.name)}
                        className="group bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all text-left"
                    >
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                            <span className="text-2xl">{cat.icon}</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{t(cat.name)}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('starting_from')} {formatPrice(cat.basePrice)}/hr</p>
                    </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeView === 'history' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('booking_history')}</h3>
            </div>
            {bookings.length === 0 ? (
                <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                    <Search className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p>{t('no_bookings')}</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-lg font-semibold text-gray-900 dark:text-white">{t(booking.category)}</span>
                                    <Badge status={booking.status} />
                                    {booking.rating && (
                                        <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-md">
                                            <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                            <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">{booking.rating}</span>
                                        </div>
                                    )}
                                    {booking.paymentStatus === 'PAID' && (
                                        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${
                                            booking.paymentMethod === 'CASH' ? 'text-green-800 bg-green-100 dark:text-green-300 dark:bg-green-900/30' : 'text-indigo-800 bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-900/30'
                                        }`}>
                                            <Check size={12} /> {t('PAID')}
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{booking.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(booking.date).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {booking.address}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {booking.providerName ? (
                                  <>
                                    <div className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-full">
                                        <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">{booking.providerName[0]}</div>
                                        <span className="text-gray-700 dark:text-gray-300">{t('pro_assigned')} {booking.providerName}</span>
                                    </div>
                                    
                                    {booking.status === 'OFFER_MADE' && (
                                        <div className="flex gap-2">
                                            <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 flex items-center gap-2">
                                                <DollarSign size={16} className="text-blue-600" />
                                                <span className="font-bold text-blue-700 dark:text-blue-300">{formatPrice(booking.price)}</span>
                                            </div>
                                            <button onClick={() => onDeclineOffer(booking.id)} className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
                                                <X size={20} />
                                            </button>
                                            <button onClick={() => onAcceptOffer(booking.id)} className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm">
                                                {t('accept_offer')}
                                            </button>
                                        </div>
                                    )}

                                    {booking.status === 'COMPLETED' && booking.paymentStatus === 'UNPAID' && (
                                        <button onClick={() => setSelectedPaymentBooking(booking)} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2">
                                            <CreditCard size={16} /> {t('pay_now')}
                                        </button>
                                    )}
                                    {booking.status === 'COMPLETED' && !booking.rating && (
                                        <button onClick={() => setSelectedRatingBooking(booking)} className="px-3 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors text-sm font-medium flex items-center gap-2">
                                            <Star size={16} /> {t('rate_service')}
                                        </button>
                                    )}
                                    <button onClick={() => setSelectedChatBooking(booking)} className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors"><MessageSquare size={20} /></button>
                                  </>
                                ) : (
                                    <span className="text-sm text-gray-400 dark:text-gray-500 italic">{t('waiting_provider')}</span>
                                )}
                                {(booking.status === 'PENDING' || booking.status === 'ACCEPTED') && (
                                    <button onClick={() => setBookingToCancel(booking)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"><XCircle size={20} /></button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      )}

      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 animate-scale-in border dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('book_service')} {t(selectedCategory)}</h3>
                    <button onClick={resetBookingModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X size={24} /></button>
                </div>

                {bookingStep === 1 ? (
                    <form onSubmit={handleBookingDetailsSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('service_label')}</label>
                            <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                            {serviceCategories.map(cat => (<option key={cat.id} value={cat.name}>{t(cat.name)}</option>))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('issue_description')}</label>
                            <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('address')}</label>
                            <input required type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div className="pt-4 flex gap-3">
                            <button type="button" onClick={resetBookingModal} className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">{t('cancel')}</button>
                            <button type="submit" className="flex-1 px-4 py-3 text-white bg-indigo-600 rounded-xl font-medium hover:bg-indigo-700 transition-colors">{t('choose_provider')}</button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('select_provider')}</div>
                        <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                            {/* Option 1: Any Provider */}
                            <button 
                                onClick={() => finalizeBooking()} 
                                className="w-full text-left p-4 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-400 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                        <Sparkles size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">{t('any_provider')}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('recommended')}</p>
                                    </div>
                                </div>
                            </button>

                            {/* Provider List */}
                            {availableProviders.map(provider => (
                                <button
                                    key={provider.id}
                                    onClick={() => finalizeBooking(provider.id)}
                                    className="w-full text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all bg-white dark:bg-gray-700/30"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <img src={provider.avatarUrl} alt={provider.name} className="w-12 h-12 rounded-full object-cover" />
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white">{provider.name}</h4>
                                                <div className="flex items-center gap-1 text-sm text-yellow-500">
                                                    <Star size={14} fill="currentColor" />
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">{provider.rating ? provider.rating.toFixed(1) : t('new')}</span>
                                                    <span className="text-gray-400 dark:text-gray-500 text-xs">({provider.jobsCompleted} jobs)</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-gray-900 dark:text-white">{formatPrice(provider.hourlyRate || 0)}/hr</div>
                                            {provider.isVerified && <div className="flex items-center justify-end gap-1 text-[10px] text-green-600 dark:text-green-400 font-medium"><Shield size={10} /> {t('verified')}</div>}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="pt-2">
                             <button type="button" onClick={() => setBookingStep(1)} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline">{t('back')}</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}

      <ChatModal isOpen={!!selectedChatBooking} onClose={() => setSelectedChatBooking(null)} booking={selectedChatBooking} currentUser={user} onSendMessage={onSendMessage} />
      <RatingModal isOpen={!!selectedRatingBooking} onClose={() => setSelectedRatingBooking(null)} booking={selectedRatingBooking} onSubmit={onRateService} />
      <PaymentModal isOpen={!!selectedPaymentBooking} onClose={() => setSelectedPaymentBooking(null)} booking={selectedPaymentBooking} onProcessPayment={onProcessPayment} />
      <ConfirmationModal 
        isOpen={!!bookingToCancel} 
        onClose={() => setBookingToCancel(null)} 
        onConfirm={() => { if (bookingToCancel) onCancelBooking(bookingToCancel.id); }} 
        title={t('cancel_booking_title')} 
        message={t('cancel_booking_msg')} 
        confirmLabel={t('yes_cancel')} 
        cancelLabel={t('no_keep')} 
        isDestructive 
      />
    </div>
  );
};