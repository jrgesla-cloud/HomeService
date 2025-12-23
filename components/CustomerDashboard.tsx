
import React, { useState, useRef, useEffect } from 'react';
import { ServiceRequest, AIAnalysisResult, User, PaymentMethod, CategoryItem, ServiceOffer } from '../types';
import { analyzeServiceRequest } from '../services/geminiService';
import { Badge, ChatModal, RatingModal, StarRating, PaymentModal, ConfirmationModal, useLanguage, useCurrency, LocationPicker } from './Shared';
import { Sparkles, ArrowRight, MapPin, Calendar, Search, Loader2, Star, Check, MessageSquare, Mail, Phone, Shield, CreditCard, Banknote, XCircle, X, DollarSign, CheckCircle, PlusCircle, Users, LayoutGrid, User as UserIcon, Settings, ShieldCheck, ChevronRight, Clock } from 'lucide-react';

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
  onAcceptOffer: (bookingId: string, offerId?: string) => void;
  onDeclineOffer: (bookingId: string, offerId?: string) => void;
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
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState(user.address || '');

  const [selectedChatBooking, setSelectedChatBooking] = useState<ServiceRequest | null>(null);
  const [selectedRatingBooking, setSelectedRatingBooking] = useState<ServiceRequest | null>(null);
  const [selectedPaymentBooking, setSelectedPaymentBooking] = useState<ServiceRequest | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<ServiceRequest | null>(null);

  const activeView = currentView === 'dashboard' ? 'browse' : currentView;

  const filteredCategories = searchQuery.trim() 
    ? serviceCategories.filter(cat => 
        t(cat.name).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    if (user.address && !address) {
        setAddress(user.address);
    }
  }, [user.address]);

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
        providerId: providerId,
        aiPriceRange: aiSuggestion?.estimatedPriceRange // Store range for providers
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
    setAddress(user.address || '');
  };

  const openBooking = (categoryName: string = '') => {
    setSelectedCategory(categoryName || serviceCategories[0]?.name || '');
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
                
                <div className="space-y-4">
                  <div className="relative" ref={searchContainerRef}>
                      <div className="flex gap-2">
                          <div className="relative flex-1">
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
                                className="w-full px-5 py-4 rounded-xl text-gray-900 dark:text-white dark:bg-white/10 dark:placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 dark:focus:ring-white/20 border-0"
                            />
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                          </div>
                          <button 
                              onClick={handleAISearch}
                              disabled={isAnalyzing}
                              className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-colors disabled:opacity-70 flex items-center shadow-lg"
                          >
                              {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                          </button>
                      </div>

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

                  <div className="flex justify-center md:justify-start pt-2">
                    <button 
                      onClick={() => openBooking()} 
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold transition-all shadow-md group border border-indigo-400/50"
                    >
                      <PlusCircle size={20} className="group-hover:scale-110 transition-transform" />
                      {t('book_service')}
                    </button>
                  </div>
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
                                <p className="text-green-300 text-xs mt-1 font-bold">{t('ai_suggested_range')} {aiSuggestion.estimatedPriceRange}</p>
                            </div>
                            <button 
                                onClick={() => openBooking(aiSuggestion.category)}
                                className="ml-auto bg-white text-indigo-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-100 shadow-sm"
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
                        <div key={booking.id} className="p-6 flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                                        <span className="flex items-center gap-1">
                                          <MapPin className="w-3 h-3" /> 
                                          {booking.address}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {booking.providerName ? (
                                    <>
                                        <div className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-full">
                                            <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">{booking.providerName[0]}</div>
                                            <span className="text-gray-700 dark:text-gray-300">{t('pro_assigned')} {booking.providerName}</span>
                                        </div>

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
                            
                            {/* Offers Section */}
                            {(booking.status === 'PENDING' || booking.status === 'OFFER_MADE') && booking.offers && booking.offers.length > 0 && (
                                <div className="mt-2 bg-gray-50 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700 animate-fade-in">
                                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Users size={14} /> {booking.offers.length} {t('popular_services')}
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {booking.offers.filter(o => o.status === 'PENDING').map(offer => (
                                            <div key={offer.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col justify-between hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <img src={offer.providerAvatar || `https://ui-avatars.com/api/?name=${offer.providerName}`} className="w-10 h-10 rounded-full object-cover" alt="" />
                                                        <div>
                                                            <div className="font-bold text-gray-900 dark:text-white text-sm">{offer.providerName}</div>
                                                            <div className="flex items-center gap-1 text-xs text-yellow-500">
                                                                <Star size={10} fill="currentColor" />
                                                                <span className="font-medium">{offer.providerRating ? offer.providerRating.toFixed(1) : t('new')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{formatPrice(offer.minPrice)} - {formatPrice(offer.maxPrice)}</div>
                                                        <div className="text-[10px] text-gray-400">{new Date(offer.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => onDeclineOffer(booking.id, offer.id)} 
                                                        className="flex-1 py-1.5 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                                    >
                                                        {t('cancel')}
                                                    </button>
                                                    <button 
                                                        onClick={() => onAcceptOffer(booking.id, offer.id)} 
                                                        className="flex-1 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 shadow-sm"
                                                    >
                                                        {t('accept_offer')}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
      )}

      {activeView === 'profile' && (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            <div className="px-8 pb-8">
              <div className="relative flex justify-between items-end -mt-12 mb-6">
                <div className="relative">
                  <img 
                    src={user.avatarUrl} 
                    className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-gray-800 shadow-lg" 
                    alt={user.name} 
                  />
                  {user.isVerified && (
                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full shadow-md border-2 border-white dark:border-gray-800">
                      <ShieldCheck size={14} />
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => onViewChange('profile')}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                >
                  <Settings size={18} />
                  {t('edit_profile')}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1 capitalize">
                      <Badge status={user.role} />
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 mx-1"></span>
                      {t('role_customer')}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
                      <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                        <Mail size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('email')}</p>
                        <p className="font-medium">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
                      <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                        <Phone size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('phone')}</p>
                        <p className="font-medium">{user.phone || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
                      <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('address')}</p>
                        <p className="font-medium">{user.address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-900/30 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                       <LayoutGrid size={18} className="text-indigo-600" />
                       {t('nav_overview')}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                          <p className="text-xs text-gray-500 mb-1">{t('total_bookings')}</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">{bookings.length}</p>
                       </div>
                       <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                          <p className="text-xs text-gray-500 mb-1">{t('ACCEPTED')}</p>
                          <p className="text-xl font-bold text-indigo-600">{bookings.filter(b => b.status === 'ACCEPTED').length}</p>
                       </div>
                    </div>
                  </div>

                  <div className="p-6 bg-indigo-600 rounded-2xl text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                    <h3 className="font-bold mb-2 flex items-center gap-2">
                       <ShieldCheck size={18} />
                       HomeHero Trust
                    </h3>
                    <p className="text-xs text-indigo-100 leading-relaxed">
                       You are a valued member of our community. All your bookings are protected by our satisfaction guarantee.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl shadow-2xl p-0 animate-scale-in border dark:border-gray-700 my-8 overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                           {bookingStep === 1 ? <LayoutGrid size={20} /> : <Users size={20} />}
                        </div>
                        <div>
                           <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                               {bookingStep === 1 ? t('book_service') : t('choose_provider')}
                           </h3>
                           <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                             {bookingStep === 1 ? t('select_service_desc') : t('select_provider')}
                           </p>
                        </div>
                    </div>
                    <button onClick={resetBookingModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"><X size={24} /></button>
                </div>

                <div className="p-6">
                {bookingStep === 1 ? (
                    <form onSubmit={handleBookingDetailsSubmit} className="space-y-6">
                        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">{t('service_label')}</th>
                                        <th className="px-6 py-4">{t('base_price')}</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {serviceCategories.map(cat => (
                                        <tr 
                                          key={cat.id} 
                                          className={`transition-colors cursor-pointer group ${selectedCategory === cat.name ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                                          onClick={() => setSelectedCategory(cat.name)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                   <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                                                   <span className={`font-bold ${selectedCategory === cat.name ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-200'}`}>
                                                     {t(cat.name)}
                                                   </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-600 dark:text-gray-400">
                                                {formatPrice(cat.basePrice)}/h
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all ${
                                                  selectedCategory === cat.name 
                                                  ? 'border-indigo-600 bg-indigo-600 text-white' 
                                                  : 'border-gray-300 dark:border-gray-600'
                                                }`}>
                                                  {selectedCategory === cat.name && <Check size={14} />}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{t('issue_description')}</label>
                                <textarea 
                                  required 
                                  rows={5} 
                                  value={description} 
                                  onChange={(e) => setDescription(e.target.value)} 
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none shadow-inner" 
                                  placeholder={t('ai_search_placeholder')}
                                />
                            </div>
                            
                            <div className="space-y-5">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{t('address')}</label>
                                <LocationPicker 
                                  address={address} 
                                  setAddress={setAddress} 
                                />
                                
                                {aiSuggestion && selectedCategory === aiSuggestion.category && (
                                    <div className="p-4 bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800 rounded-xl flex items-start gap-3 animate-fade-in shadow-sm">
                                        <Sparkles size={20} className="text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
                                        <div className="text-xs leading-relaxed text-purple-700 dark:text-purple-300">
                                            <p className="font-bold mb-1 text-sm">{t('ai_suggested_range')} {aiSuggestion.estimatedPriceRange}</p>
                                            <p className="opacity-90 italic">"{aiSuggestion.reasoning}"</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-6 flex gap-4 border-t border-gray-100 dark:border-gray-700">
                            <button type="button" onClick={resetBookingModal} className="px-8 py-3.5 text-gray-600 dark:text-gray-400 font-bold hover:text-gray-900 dark:hover:text-white transition-colors text-sm uppercase tracking-widest">{t('cancel')}</button>
                            <button type="submit" className="flex-1 px-8 py-3.5 text-white bg-indigo-600 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 uppercase text-sm tracking-widest flex items-center justify-center gap-3 group">
                                {t('choose_provider')}
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="max-h-[500px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            <button 
                                onClick={() => finalizeBooking()} 
                                className="w-full text-left p-6 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-400 transition-all group flex items-center justify-between"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:rotate-6 transition-all shadow-sm">
                                        <Sparkles size={32} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white text-xl">{t('any_provider')}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('recommended')} • Fastest assignment</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-full border border-indigo-100 dark:border-indigo-700 shadow-md transform group-hover:translate-x-1 transition-all">
                                   <ChevronRight size={24} className="text-indigo-600" />
                                </div>
                            </button>

                            <div className="grid grid-cols-1 gap-4">
                                {availableProviders.map(provider => (
                                    <button
                                        key={provider.id}
                                        onClick={() => finalizeBooking(provider.id)}
                                        className="w-full text-left p-6 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-xl transition-all bg-white dark:bg-gray-800/40 group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                           <div className="bg-indigo-600 text-white p-1.5 rounded-full shadow-lg"><Check size={16} /></div>
                                        </div>
                                        
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-5">
                                                <div className="relative">
                                                   <img src={provider.avatarUrl} alt={provider.name} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white dark:ring-gray-700 shadow-sm" />
                                                   <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white text-xl group-hover:text-indigo-600 transition-colors">{provider.name}</h4>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <div className="flex items-center gap-1.5 text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-0.5 rounded-md">
                                                            <Star size={16} fill="currentColor" />
                                                            <span className="font-bold text-gray-800 dark:text-gray-200">{provider.rating ? provider.rating.toFixed(1) : t('new')}</span>
                                                        </div>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                                        <span className="text-gray-500 dark:text-gray-400 font-bold text-sm uppercase tracking-tight">{provider.jobsCompleted} {t('completed_jobs')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-black text-gray-900 dark:text-white">{formatPrice(provider.hourlyRate || 0)}<span className="text-xs font-bold text-gray-400">/h</span></div>
                                                {provider.isVerified && <div className="flex items-center justify-end gap-1.5 text-[10px] text-green-600 dark:text-green-400 font-bold uppercase tracking-widest mt-1"><ShieldCheck size={14} /> {t('verified')}</div>}
                                            </div>
                                        </div>

                                        {provider.availability && (
                                            <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 dark:border-gray-700/50 pt-4">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    <Clock size={12} className="text-indigo-500" />
                                                    {t('nav_schedule')}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                                                    <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-md border border-gray-100 dark:border-gray-600/50">
                                                        <Calendar size={12} className="text-indigo-400" />
                                                        <span className="font-medium">{provider.availability.workingDays.join(', ')}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-md border border-gray-100 dark:border-gray-600/50">
                                                        <Clock size={12} className="text-indigo-400" />
                                                        <span className="font-medium">{provider.availability.startTime} - {provider.availability.endTime}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                            
                            {availableProviders.length === 0 && (
                              <div className="p-16 text-center text-gray-400 bg-gray-50/50 dark:bg-gray-900/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center gap-4">
                                <Users size={48} className="opacity-10" />
                                <p className="font-bold text-lg">{t('no_jobs_available')}</p>
                              </div>
                            )}
                        </div>
                        <div className="pt-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
                             <button type="button" onClick={() => setBookingStep(1)} className="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 transition-colors uppercase tracking-widest">
                                <ChevronRight size={20} className="rotate-180" />
                                {t('back')}
                             </button>
                             <p className="text-[10px] text-gray-400 font-medium italic">* Secure payment guaranteed by HomeHero Shield</p>
                        </div>
                    </div>
                )}
                </div>
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
