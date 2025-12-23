
import React, { useState, useEffect } from 'react';
import { User, UserRole, ServiceRequest, ServiceCategory, PaymentMethod, PlatformContent, Availability, Withdrawal, CategoryItem, AppNotification, ServiceOffer, FeeRequest } from './types';
import { Sidebar, TopBar, ToastContainer, ToastMessage, SupportChatWidget, Footer, VerificationModal, LanguageProvider, useLanguage, LanguageSwitcher, ThemeProvider, ThemeSwitcher, CurrencyProvider, CurrencySwitcher, EditProfileModal } from './components/Shared';
import { CustomerDashboard } from './components/CustomerDashboard';
import { ProviderDashboard } from './components/ProviderDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Hammer, Users, Briefcase, LayoutDashboard, UserPlus, LogIn } from 'lucide-react';

// --- Mock Data ---

const MOCK_USERS_DATA: User[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'CUSTOMER', avatarUrl: 'https://picsum.photos/200', address: '123 Rruga e Durrësit', phone: '+355 69 123 4567', isVerified: true, notifications: [] },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'PROVIDER', avatarUrl: 'https://picsum.photos/201', category: 'cat_plumbing', rating: 4.8, jobsCompleted: 124, hourlyRate: 85, address: '456 Rruga e Kavajës', phone: '+355 68 987 6543', availability: { workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], startTime: '08:00', endTime: '16:00' }, withdrawals: [], isVerified: true, notifications: [], feeRequests: [] },
  { id: '3', name: 'Charlie Dave', email: 'charlie@example.com', role: 'PROVIDER', avatarUrl: 'https://picsum.photos/202', category: 'cat_electrical', rating: 4.9, jobsCompleted: 89, hourlyRate: 95, address: '789 Bulevardi Zogu I', phone: '+355 67 456 7890', availability: { workingDays: ['Mon', 'Wed', 'Fri'], startTime: '09:00', endTime: '17:00' }, withdrawals: [], isVerified: true, notifications: [], feeRequests: [] },
  { id: '4', name: 'Admin User', email: 'admin@homehero.com', role: 'ADMIN', avatarUrl: 'https://picsum.photos/203', isVerified: true, notifications: [] },
  { id: '5', name: 'Mario Rossi', email: 'mario@example.com', role: 'PROVIDER', avatarUrl: 'https://picsum.photos/204', category: 'cat_plumbing', rating: 3.5, jobsCompleted: 12, hourlyRate: 60, address: '123 Rruga e Elbasanit', phone: '+355 69 555 1234', availability: { workingDays: ['Mon', 'Tue', 'Thu'], startTime: '10:00', endTime: '18:00' }, withdrawals: [], isVerified: true, notifications: [], feeRequests: [] },
];

const MOCK_BOOKINGS: ServiceRequest[] = [
  { id: 'b1', customerId: '1', customerName: 'Alice Johnson', providerId: '2', providerName: 'Bob Smith', category: 'cat_plumbing', description: 'Rrjedhje uji në lavaman', status: 'COMPLETED', date: '2023-10-15T10:00:00', price: 120, address: '123 Rruga e Durrësit', messages: [], rating: 5, review: 'Punë e shkëlqyer!', paymentStatus: 'PAID', paymentMethod: 'CARD', offers: [] },
  { id: 'b2', customerId: '1', customerName: 'Alice Johnson', category: 'cat_electrical', description: 'Instalim ventilatori', status: 'PENDING', date: '2023-10-20T14:00:00', price: 0, address: '123 Rruga e Durrësit', messages: [], paymentStatus: 'UNPAID', offers: [] },
];

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'cat1', name: 'cat_plumbing', icon: '🚰', basePrice: 80 },
  { id: 'cat2', name: 'cat_electrical', icon: '⚡', basePrice: 90 },
  { id: 'cat3', name: 'cat_cleaning', icon: '🧹', basePrice: 40 },
  { id: 'cat4', name: 'cat_hvac', icon: '❄️', basePrice: 100 },
  { id: 'cat5', name: 'cat_landscaping', icon: '🌳', basePrice: 60 },
  { id: 'cat6', name: 'cat_moving', icon: '📦', basePrice: 70 },
  { id: 'cat7', name: 'cat_general', icon: '🔧', basePrice: 50 },
];

const DEFAULT_CONTENT: PlatformContent = {
  aboutUs: "footer_about_content",
  termsAndConditions: "footer_terms_content",
  privacyPolicy: "footer_privacy_content",
  faq: [
    { question: "faq_q1", answer: "faq_a1" },
    { question: "faq_q2", answer: "faq_a2" }
  ],
  contact: {
    phone: "+355 4 123 4567",
    email: "support@homehero.al",
    address: "Tiranë, Shqipëri"
  },
  socialMedia: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    twitter: "https://twitter.com"
  }
};

const PLATFORM_FEE_FLAT = 5; // Internal base in EUR

const LoginScreen: React.FC<{ 
  onLogin: (role: UserRole) => void; 
  onRegister: (name: string, email: string, phone: string, role: UserRole, category?: string) => void; 
  categories: CategoryItem[];
}> = ({ onLogin, onRegister, categories }) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [regData, setRegData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    role: 'CUSTOMER' as UserRole, 
    password: '',
    category: categories[0]?.name || ''
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (regData.name && regData.email && regData.role) {
      onRegister(
        regData.name, 
        regData.email, 
        regData.phone, 
        regData.role, 
        regData.role === 'PROVIDER' ? regData.category : undefined
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 transition-colors">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full relative border dark:border-gray-700">
        <div className="absolute top-4 right-4 flex items-center gap-2">
             <LanguageSwitcher />
             <CurrencySwitcher />
             <ThemeSwitcher />
        </div>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Hammer className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">HomeHero</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {mode === 'LOGIN' ? t('login_subtitle') : t('register_subtitle')}
          </p>
        </div>

        <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg mb-6">
          <button 
            onClick={() => setMode('LOGIN')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'LOGIN' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
            {t('sign_in')}
          </button>
          <button 
            onClick={() => setMode('REGISTER')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'REGISTER' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
            {t('register')}
          </button>
        </div>
        
        {mode === 'LOGIN' ? (
          <div className="space-y-4 animate-fade-in">
            <button onClick={() => onLogin('CUSTOMER')} className="w-full flex items-center justify-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-indigo-50 dark:hover:bg-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group">
              <Users className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
              <span className="font-semibold text-gray-700 dark:text-gray-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">{t('continue_as')} {t('role_customer')}</span>
            </button>
            <button onClick={() => onLogin('PROVIDER')} className="w-full flex items-center justify-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-indigo-50 dark:hover:bg-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group">
              <Briefcase className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
              <span className="font-semibold text-gray-700 dark:text-gray-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">{t('continue_as')} {t('role_provider')}</span>
            </button>
            <button onClick={() => onLogin('ADMIN')} className="w-full flex items-center justify-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-indigo-50 dark:hover:bg-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group">
              <LayoutDashboard className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
              <span className="font-semibold text-gray-700 dark:text-gray-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">{t('continue_as')} {t('role_admin')}</span>
            </button>
            <p className="mt-4 text-xs text-center text-gray-400 dark:text-gray-500">{t('demo_mode')}</p>
          </div>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('full_name')}</label>
              <input 
                required
                type="text"
                placeholder="Emri Mbiemri"
                value={regData.name}
                onChange={e => setRegData({...regData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email')}</label>
              <input 
                required
                type="email"
                placeholder="email@example.com"
                value={regData.email}
                onChange={e => setRegData({...regData, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phone')}</label>
              <input 
                required
                type="tel"
                placeholder="+355 6X XXX XXXX"
                value={regData.phone}
                onChange={e => setRegData({...regData, phone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('account_type')}</label>
              <select 
                value={regData.role}
                onChange={e => setRegData({...regData, role: e.target.value as UserRole})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="CUSTOMER">{t('i_want_hire')}</option>
                <option value="PROVIDER">{t('i_want_work')}</option>
              </select>
            </div>

            {regData.role === 'PROVIDER' && (
              <div className="animate-scale-in origin-top">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('category_label')}</label>
                <select 
                  value={regData.category}
                  onChange={e => setRegData({...regData, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-white"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.icon} {t(cat.name)}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('password')}</label>
              <input 
                required
                type="password"
                placeholder="••••••••"
                value={regData.password}
                onChange={e => setRegData({...regData, password: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold transition-colors mt-2"
            >
              <UserPlus size={20} />
              {t('create_account')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

function HomeHeroApp() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS_DATA);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<ServiceRequest[]>(MOCK_BOOKINGS);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [platformContent, setPlatformContent] = useState<PlatformContent>(DEFAULT_CONTENT);
  const [serviceCategories, setServiceCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const { t } = useLanguage();

  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  const handleLogin = (role: UserRole) => {
    const user = users.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const notifyUser = (
    userId: string, 
    titleKey: string, 
    messageKey: string, 
    params: Record<string, string | number> = {},
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' = 'INFO', 
    relatedId?: string
  ) => {
    const toastId = Date.now().toString() + Math.random();
    const toastType = type.toLowerCase() as 'info' | 'success' | 'warning' | 'error';
    
    setToasts(prev => [...prev, { 
      id: toastId, 
      title: t(titleKey, params), 
      message: t(messageKey, params), 
      type: toastType 
    }]);
    
    setTimeout(() => removeToast(toastId), 6000);

    const newNotification: AppNotification = {
      id: `n${Date.now()}-${Math.random()}`,
      titleKey,
      messageKey,
      params,
      date: new Date().toISOString(),
      isRead: false,
      type,
      relatedId 
    };

    setUsers(prevUsers => prevUsers.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          notifications: [newNotification, ...(u.notifications || [])]
        };
      }
      return u;
    }));

    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, notifications: [newNotification, ...(prev.notifications || [])] } : null);
    }
  };

  const notifyAdmin = (titleKey: string, messageKey: string, params: Record<string, string | number> = {}, relatedId?: string) => {
      const admin = users.find(u => u.role === 'ADMIN');
      if (admin) {
          notifyUser(admin.id, titleKey, messageKey, params, 'INFO', relatedId);
      }
  };

  const handleMarkNotificationsAsRead = () => {
    if (!currentUser) return;
    
    setUsers(prevUsers => prevUsers.map(u => {
      if (u.id === currentUser.id) {
        const updatedNotifs = (u.notifications || []).map(n => ({ ...n, isRead: true }));
        return { ...u, notifications: updatedNotifs };
      }
      return u;
    }));
    
    setCurrentUser(prev => {
        if (!prev) return null;
        const updatedNotifs = (prev.notifications || []).map(n => ({ ...n, isRead: true }));
        return { ...prev, notifications: updatedNotifs };
    });
  };

  const handleNotificationClick = (notification: AppNotification) => {
      if (!currentUser) return;

      setUsers(prevUsers => prevUsers.map(u => {
        if (u.id === currentUser.id) {
            const updatedNotifs = (u.notifications || []).map(n => n.id === notification.id ? {...n, isRead: true} : n);
            return { ...u, notifications: updatedNotifs };
        }
        return u;
      }));
      
      setCurrentUser(prev => {
        if (!prev) return null;
        const updatedNotifs = (prev.notifications || []).map(n => n.id === notification.id ? {...n, isRead: true} : n);
        return { ...prev, notifications: updatedNotifs };
      });

      if (notification.relatedId) {
          if (currentUser.role === 'CUSTOMER') {
              if (notification.relatedId.startsWith('b')) {
                  setActiveTab('history');
              } else if (notification.relatedId === 'profile') {
                  setActiveTab('profile');
              }
          } else if (currentUser.role === 'PROVIDER') {
              if (notification.relatedId.startsWith('b')) {
                 setActiveTab('schedule');
              } else if (notification.relatedId.startsWith('w')) {
                  setActiveTab('earnings');
              } else if (notification.relatedId === 'schedule') {
                  setActiveTab('schedule');
              } else if (notification.relatedId.startsWith('f')) {
                  setActiveTab('earnings');
              }
          } else if (currentUser.role === 'ADMIN') {
              if (notification.relatedId.startsWith('w')) {
                  setActiveTab('finance');
              } else if (notification.relatedId.startsWith('b')) {
                  setActiveTab('bookings');
              } else if (notification.relatedId.startsWith('u')) {
                  setActiveTab('users');
              } else if (notification.relatedId.startsWith('f')) {
                  setActiveTab('finance');
              }
          }
      }
  };

  const handleRegister = (name: string, email: string, phone: string, role: UserRole, category?: string) => {
    const newUser: User = {
      id: `u${Date.now()}`,
      name,
      email,
      role,
      phone,
      category,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      isVerified: false,
      notifications: [],
      feeRequests: role === 'PROVIDER' ? [] : undefined,
      rating: role === 'PROVIDER' ? 0 : undefined,
      jobsCompleted: role === 'PROVIDER' ? 0 : undefined,
      hourlyRate: role === 'PROVIDER' ? (serviceCategories.find(c => c.name === category)?.basePrice || 50) : undefined
    };

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
    setPendingUser(newUser);
    setShowVerificationModal(true);
    const toastId = Date.now().toString();
    setToasts(prev => [...prev, { id: toastId, title: t('verify_email'), message: `${t('verify_code_sent')} ${email}: ${code}`, type: 'info' }]);
  };

  const verifyAccount = (code: string) => {
    if (code === verificationCode && pendingUser) {
      const verifiedUser = { ...pendingUser, isVerified: true };
      setUsers([...users, verifiedUser]);
      setCurrentUser(verifiedUser);
      setShowVerificationModal(false);
      setPendingUser(null);
      setVerificationCode('');
      setActiveTab('dashboard');
      notifyUser(verifiedUser.id, 'notification_welcome_title', 'notification_welcome_body', {}, 'SUCCESS', 'profile');
      notifyAdmin('notification_admin_new_user', 'notification_admin_new_user_body', { role: verifiedUser.role, name: verifiedUser.name }, verifiedUser.id);
    } else {
      setToasts(prev => [...prev, { id: Date.now().toString(), title: t('error'), message: 'Kodi i pasaktë.', type: 'error' }]);
    }
  };

  const resendVerification = () => {
    if (pendingUser) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setVerificationCode(code);
      setToasts(prev => [...prev, { id: Date.now().toString(), title: t('resend_code'), message: `Code: ${code}`, type: 'info' }]);
    }
  };

  const handleCreateBooking = (newBookingData: any) => {
    const provider = users.find(u => u.id === newBookingData.providerId);
    
    const newBooking: ServiceRequest = {
      ...newBookingData,
      id: `b${Date.now()}`,
      status: 'PENDING',
      date: new Date().toISOString(),
      messages: [],
      paymentStatus: 'UNPAID',
      offers: [],
      providerName: provider ? provider.name : undefined 
    };
    setBookings(prev => [newBooking, ...prev]);
    
    notifyUser(newBooking.customerId, 'notification_booking_received', 'notification_booking_received_body', {}, 'SUCCESS', newBooking.id);
    notifyAdmin('notification_admin_new_booking', 'notification_admin_new_booking_body', { category: t(newBooking.category), name: newBooking.customerName }, newBooking.id);

    if (newBooking.providerId) {
         notifyUser(newBooking.providerId, 'notification_direct_request', 'notification_direct_request_body', { name: newBooking.customerName }, 'INFO', newBooking.id);
    } else {
        const matchingProviders = users.filter(u => u.role === 'PROVIDER' && u.category === newBooking.category);
        matchingProviders.forEach(p => {
             notifyUser(p.id, 'notification_job_available_title', 'notification_job_available_body', { category: t(newBooking.category), name: newBooking.customerName }, 'INFO', newBooking.id);
        });
    }
  };

  const handleAcceptJob = (bookingId: string) => {
    if (!currentUser || currentUser.role !== 'PROVIDER') return;
    let customerId = '';
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        customerId = b.customerId;
        return { ...b, status: 'ACCEPTED', providerId: currentUser.id, providerName: currentUser.name };
      }
      return b;
    }));
    if (customerId) notifyUser(customerId, 'notification_job_accepted_title', 'notification_job_accepted_body', { name: currentUser.name }, 'SUCCESS', bookingId);
  };

  const handleMakeOffer = (bookingId: string, minPrice: number, maxPrice: number) => {
    if (!currentUser || currentUser.role !== 'PROVIDER') return;
    
    const newOffer: ServiceOffer = {
        id: `off-${Date.now()}`,
        providerId: currentUser.id,
        providerName: currentUser.name,
        providerRating: currentUser.rating,
        providerAvatar: currentUser.avatarUrl,
        minPrice: minPrice,
        maxPrice: maxPrice,
        timestamp: new Date().toISOString(),
        status: 'PENDING'
    };

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return { 
          ...b, 
          status: 'OFFER_MADE', 
          offers: [...(b.offers || []), newOffer]
        };
      }
      return b;
    }));
    
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
       notifyUser(booking.customerId, 'notification_new_offer', 'notification_new_offer_body', { name: currentUser.name, amount: `${minPrice} - ${maxPrice}` }, 'INFO', bookingId);
    }
    notifyUser(currentUser.id, 'notification_offer_sent_title', 'notification_offer_sent_body', {}, 'SUCCESS', bookingId);
  };

  const handleAcceptOffer = (bookingId: string, offerId?: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    // Use offerId to find the selected offer, or use existing logic if it was a direct booking (which shouldn't have offers array but might have legacy fields)
    const selectedOffer = booking.offers?.find(o => o.id === offerId);

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        if (selectedOffer) {
          return { 
            ...b, 
            status: 'ACCEPTED', 
            providerId: selectedOffer.providerId, 
            providerName: selectedOffer.providerName, 
            price: selectedOffer.minPrice, // Placeholder until finalization
            offers: b.offers?.map(o => o.id === offerId ? { ...o, status: 'ACCEPTED' as const } : { ...o, status: 'REJECTED' as const })
          };
        }
        return { ...b, status: 'ACCEPTED' };
      }
      return b;
    }));
    
    const pName = selectedOffer ? selectedOffer.providerName : booking.providerName;
    const pId = selectedOffer ? selectedOffer.providerId : booking.providerId;

    if (pId) notifyUser(pId, 'notification_provider_accepted_title', 'notification_provider_accepted_body', { name: booking.customerName }, 'SUCCESS', bookingId);
    notifyUser(booking.customerId, 'notification_offer_accepted_title', 'notification_offer_accepted_body', {}, 'SUCCESS', bookingId);
  };

  const handleDeclineOffer = (bookingId: string, offerId?: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        if (offerId) {
            const updatedOffers = b.offers?.map(o => o.id === offerId ? { ...o, status: 'REJECTED' as const } : o);
            // If all offers are rejected, maybe set status back to pending
            const anyPending = updatedOffers?.some(o => o.status === 'PENDING');
            return { 
                ...b, 
                status: anyPending ? 'OFFER_MADE' as const : 'PENDING' as const,
                offers: updatedOffers
            };
        }
        return { 
            ...b, 
            status: 'PENDING', 
            providerId: undefined, 
            providerName: undefined,
            price: 0 
        };
      }
      return b;
    }));

    const off = booking.offers?.find(o => o.id === offerId);
    if (off) notifyUser(off.providerId, 'notification_offer_declined_title', 'notification_offer_declined_body', {}, 'WARNING', bookingId);
    else if (booking.providerId) notifyUser(booking.providerId, 'notification_offer_declined_title', 'notification_offer_declined_body', {}, 'WARNING', bookingId);
    
    notifyUser(booking.customerId, 'notification_offer_declined_customer_title', 'notification_offer_declined_customer_body', {}, 'INFO', bookingId);
  };

  const handleProviderDeclineJob = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setBookings(prev => prev.map(b => {
        if (b.id === bookingId) {
            return { 
                ...b, 
                providerId: undefined, 
                providerName: undefined, 
                status: 'PENDING',
                // Also clear specific offers from this provider if any
                offers: b.offers?.filter(o => o.providerId !== currentUser?.id)
            }; 
        }
        return b;
    }));
    notifyUser(booking.customerId, 'notification_job_declined_title', 'notification_job_declined_body', {}, 'WARNING', bookingId);
  };

  const handleProviderCancelJob = (bookingId: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
        notifyUser(booking.customerId, 'notification_provider_cancelled_title', 'notification_provider_cancelled_body', {}, 'ERROR', bookingId);
        notifyAdmin('notification_job_cancelled_admin', 'notification_job_cancelled_admin_body', { role: 'Provider', name: booking.providerName || '' }, bookingId);
    }
  };

  const handleUpdateStatus = (bookingId: string, status: ServiceRequest['status'], finalPrice?: number) => {
    const booking = bookings.find(b => b.id === bookingId);
    
    if (booking) {
        if (status === 'COMPLETED') {
            notifyUser(booking.customerId, 'notification_job_completed_title', 'notification_job_completed_body', { category: t(booking.category) }, 'SUCCESS', bookingId);
        } else if (status === 'IN_PROGRESS') {
            notifyUser(booking.customerId, 'notification_job_started_title', 'notification_job_started_body', {}, 'INFO', bookingId);
        }
    }
    
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        const updated: ServiceRequest = { ...b, status };
        if (finalPrice !== undefined) updated.price = finalPrice;
        return updated;
      }
      return b;
    }));
  };

  const handleSendMessage = (bookingId: string, text: string) => {
    if (!currentUser) return;
    const booking = bookings.find(b => b.id === bookingId);
    const newMessage = {
      id: `m${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text,
      timestamp: new Date().toISOString()
    };
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return { ...b, messages: [...(b.messages || []), newMessage] };
      }
      return b;
    }));
  };

  const handleRateService = (bookingId: string, rating: number, review: string) => {
    let updatedBooking: ServiceRequest | undefined;
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        updatedBooking = { ...b, rating, review };
        return updatedBooking;
      }
      return b;
    }));
    if (updatedBooking && updatedBooking.providerId) {
      const providerId = updatedBooking.providerId;
      notifyUser(providerId, 'notification_new_rating_title', 'notification_new_rating_body', { stars: rating }, 'SUCCESS', bookingId);

      const relevantBookings = bookings.map(b => b.id === bookingId ? { ...b, rating } : b).filter(b => b.providerId === providerId && b.rating !== undefined);
      const totalRating = relevantBookings.reduce((sum, b) => sum + (b.rating || 0), 0);
      const averageRating = totalRating / relevantBookings.length;
      setUsers(prevUsers => prevUsers.map(u => {
        if (u.id === providerId) return { ...u, rating: averageRating };
        return u;
      }));
      if (currentUser && currentUser.id === providerId) setCurrentUser(prev => prev ? { ...prev, rating: averageRating } : null);
    }
  };

  const handleProcessPayment = (bookingId: string, method: PaymentMethod) => {
     setBookings(prev => prev.map(b => {
        if (b.id === bookingId) return { ...b, paymentStatus: 'PAID', paymentMethod: method };
        return b;
     }));
     const booking = bookings.find(b => b.id === bookingId);
     if (booking) {
         notifyUser(booking.customerId, 'notification_payment_success_title', 'notification_payment_success_body', { method }, 'SUCCESS', bookingId);
         
         if (booking.providerId) {
            notifyUser(booking.providerId, 'notification_payment_received_title', 'notification_payment_received_body', { category: t(booking.category) }, 'SUCCESS', bookingId);
            
            // Handle cash fee logic (Flat fee of 5 EUR)
            if (method === 'CASH') {
                const feeAmount = PLATFORM_FEE_FLAT; 
                const newFeeRequest: FeeRequest = {
                    id: `f${Date.now()}`,
                    providerId: booking.providerId,
                    bookingId: booking.id,
                    amount: feeAmount,
                    date: new Date().toISOString(),
                    status: 'PENDING',
                    bookingCategory: booking.category
                };
                
                setUsers(prev => prev.map(u => {
                    if (u.id === booking.providerId) {
                        return { ...u, feeRequests: [...(u.feeRequests || []), newFeeRequest] };
                    }
                    return u;
                }));
                notifyAdmin('notification_admin_transaction', 'notification_admin_transaction_body', { amount: booking.price, customer: booking.customerName, provider: booking.providerName || 'N/A' }, bookingId);
            }
         }
         if (method !== 'CASH') {
            notifyAdmin('notification_admin_transaction', 'notification_admin_transaction_body', { amount: booking.price, customer: booking.customerName, provider: booking.providerName || 'N/A' }, bookingId);
         }
     }
  };

  const handleCancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
         notifyUser(booking.customerId, 'notification_booking_cancelled_title', 'notification_booking_cancelled_body', {}, 'INFO', bookingId);
         if (booking.providerId) notifyUser(booking.providerId, 'notification_customer_cancelled_title', 'notification_customer_cancelled_body', {}, 'WARNING', bookingId);
         notifyAdmin('notification_job_cancelled_admin', 'notification_job_cancelled_admin_body', { role: 'Customer', name: booking.customerName }, bookingId);
    }
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
  };

  const handleAddProvider = (providerData: any) => {
     const newProvider: User = { ...providerData, id: `u${Date.now()}`, role: 'PROVIDER', rating: 0, jobsCompleted: 0, avatarUrl: `https://picsum.photos/seed/${Date.now()}/200`, withdrawals: [], isVerified: true, notifications: [], feeRequests: [] };
     setUsers(prev => [...prev, newProvider]);
     notifyAdmin('notification_admin_new_user', 'notification_admin_new_user_body', { role: 'Provider', name: newProvider.name }, newProvider.id);
  };

  const handleUpdateContent = (newContent: PlatformContent) => {
      setPlatformContent(newContent);
      if (currentUser) {
          notifyUser(currentUser.id, 'notification_content_updated', 'notification_content_updated_body', {}, 'SUCCESS', 'content');
      }
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser && currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
        notifyUser(updatedUser.id, 'notification_profile_updated_title', 'notification_profile_updated_body', {}, 'SUCCESS', 'profile');
    }
  };

  const handleUpdateAvailability = (availability: Availability) => {
    if (currentUser && currentUser.role === 'PROVIDER') {
      const updatedUser = { ...currentUser, availability };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
      notifyUser(currentUser.id, 'notification_avail_updated_title', 'notification_avail_updated_body', {}, 'SUCCESS', 'schedule');
    }
  };

  const handleWithdrawFunds = (amount: number, method: string) => {
    if (currentUser && currentUser.role === 'PROVIDER') {
      const newWithdrawal: Withdrawal = { id: `w${Date.now()}`, providerId: currentUser.id, providerName: currentUser.name, amount, date: new Date().toISOString(), status: 'PENDING', method };
      const updatedUser = { ...currentUser, withdrawals: [...(currentUser.withdrawals || []), newWithdrawal] };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
      notifyUser(currentUser.id, 'notification_withdrawal_request_title', 'notification_withdrawal_request_body', { amount }, 'INFO', newWithdrawal.id);
      notifyAdmin('notification_admin_withdrawal', 'notification_admin_withdrawal_body', { name: currentUser.name, amount }, newWithdrawal.id);
    }
  };

  const handleProcessWithdrawal = (withdrawalId: string, action: 'APPROVE' | 'REJECT', amount?: number) => {
    let targetProviderId = '';
    let finalAmount = 0;

    setUsers(prevUsers => prevUsers.map(user => {
      if (user.withdrawals && user.withdrawals.some(w => w.id === withdrawalId)) {
        targetProviderId = user.id;
        const updatedWithdrawals = user.withdrawals.map(w => {
            if (w.id === withdrawalId) {
                finalAmount = amount ?? w.amount;
                return { 
                  ...w, 
                  status: action === 'APPROVE' ? 'APPROVED' as const : 'REJECTED' as const,
                  amount: finalAmount
                };
            }
            return w;
        });
        return { ...user, withdrawals: updatedWithdrawals };
      }
      return user;
    }));

    if (targetProviderId) {
        if (action === 'APPROVE') notifyUser(targetProviderId, 'notification_withdrawal_approved_title', 'notification_withdrawal_approved_body', { amount: finalAmount }, 'SUCCESS', withdrawalId);
        else notifyUser(targetProviderId, 'notification_withdrawal_rejected_title', 'notification_withdrawal_rejected_body', { amount: finalAmount }, 'ERROR', withdrawalId);
    }
  };

  const handleAdminRequestFee = (providerId: string, feeId: string) => {
    let feeAmount = 0;
    let category = '';
    
    setUsers(prevUsers => prevUsers.map(u => {
        if (u.id === providerId && u.feeRequests) {
            const updatedRequests = u.feeRequests.map(r => {
                if (r.id === feeId) {
                    feeAmount = r.amount;
                    category = r.bookingCategory;
                    return { ...r, status: 'REQUESTED' as const };
                }
                return r;
            });
            return { ...u, feeRequests: updatedRequests };
        }
        return u;
    }));

    notifyUser(providerId, 'notification_fee_request_title', 'notification_fee_request_body', { amount: feeAmount, category: t(category) }, 'WARNING', feeId);
    
    const admin = users.find(u => u.role === 'ADMIN');
    if (admin) {
        const toastId = Date.now().toString();
        setToasts(prev => [...prev, { id: toastId, title: t('success'), message: t('fee_requested_toast'), type: 'success' }]);
        setTimeout(() => removeToast(toastId), 4000);
    }
  };

  const handleAdminMarkFeePaid = (providerId: string, feeId: string, status: 'PAID' | 'REJECTED') => {
      let feeAmount = 0;
      let category = '';
      
      setUsers(prevUsers => prevUsers.map(u => {
        if (u.id === providerId && u.feeRequests) {
            const updatedRequests = u.feeRequests.map(r => {
                if (r.id === feeId) {
                    feeAmount = r.amount;
                    category = r.bookingCategory;
                    return { ...r, status };
                }
                return r;
            });
            return { ...u, feeRequests: updatedRequests };
        }
        return u;
      }));

      if (status === 'REJECTED') {
          notifyUser(providerId, 'notification_withdrawal_rejected_title', 'notification_fee_rejected_body', { amount: feeAmount, category: t(category) }, 'ERROR', feeId);
      } else {
          notifyUser(providerId, 'notification_payment_success_title', 'notification_payment_received_body', { category: t(category) }, 'SUCCESS', feeId);
      }
  };

  const handleProviderPayFee = (feeId: string) => {
    if (!currentUser) return;
    
    let feeAmount = 0;
    setUsers(prevUsers => prevUsers.map(u => {
        if (u.id === currentUser.id && u.feeRequests) {
            const updatedRequests = u.feeRequests.map(r => {
                if (r.id === feeId) {
                    feeAmount = r.amount;
                    return { ...r, status: 'VERIFYING' as const };
                }
                return r;
            });
            return { ...u, feeRequests: updatedRequests };
        }
        return u;
    }));

    if (currentUser && currentUser.id) {
        setCurrentUser(prev => {
            if (!prev || !prev.feeRequests) return prev;
            const updatedRequests = prev.feeRequests.map(r => r.id === feeId ? { ...r, status: 'VERIFYING' as const } : r);
            return { ...prev, feeRequests: updatedRequests };
        });
    }

    notifyAdmin('notification_admin_fee_submitted', 'notification_admin_fee_submitted_body', { amount: feeAmount, name: currentUser.name }, feeId);
  };

  const handleProviderPayAllFees = () => {
    if (!currentUser) return;
    
    let totalFeeAmount = 0;
    setUsers(prevUsers => prevUsers.map(u => {
        if (u.id === currentUser.id && u.feeRequests) {
            const updatedRequests = u.feeRequests.map(r => {
                if (r.status === 'PENDING' || r.status === 'REQUESTED') {
                    totalFeeAmount += r.amount;
                    return { ...r, status: 'VERIFYING' as const };
                }
                return r;
            });
            return { ...u, feeRequests: updatedRequests };
        }
        return u;
    }));

    if (currentUser && currentUser.id) {
        setCurrentUser(prev => {
            if (!prev || !prev.feeRequests) return prev;
            const updatedRequests = prev.feeRequests.map(r => (r.status === 'PENDING' || r.status === 'REQUESTED') ? { ...r, status: 'VERIFYING' as const } : r);
            return { ...prev, feeRequests: updatedRequests };
        });
    }

    if (totalFeeAmount > 0) {
        notifyAdmin('notification_admin_fee_submitted', 'notification_admin_fee_submitted_body', { amount: totalFeeAmount, name: currentUser.name }, 'all_fees');
    }
  };

  const handleAdminSendMessageToUser = (userId: string, message: string) => {
    notifyUser(userId, 'notification_admin_direct_title', message, {}, 'INFO');
    setToasts(prev => [...prev, { id: Date.now().toString(), title: t('success'), message: t('message_sent_success'), type: 'success' }]);
  };

  const handleAddCategory = (categoryData: any) => {
      setServiceCategories(prev => [...prev, { ...categoryData, id: `cat${Date.now()}` }]);
      notifyAdmin('notification_category_added', 'notification_category_added_body', {}, 'services');
  };

  const handleUpdateCategory = (updatedCategory: CategoryItem) => {
    setServiceCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
    notifyAdmin('notification_category_updated', 'notification_category_updated_body', { name: t(updatedCategory.name) }, 'services');
  };

  const handleDeleteCategory = (categoryId: string) => setServiceCategories(prev => prev.filter(c => c.id !== categoryId));
  
  if (!currentUser) {
    return (
      <CurrencyProvider>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <LoginScreen onLogin={handleLogin} onRegister={handleRegister} categories={serviceCategories} />
        <VerificationModal 
          isOpen={showVerificationModal} 
          email={pendingUser?.email || ''} 
          onVerify={verifyAccount}
          onResend={resendVerification}
          onClose={() => { setShowVerificationModal(false); setPendingUser(null); setVerificationCode(''); }}
        />
      </CurrencyProvider>
    );
  }

  const activeUser = users.find(u => u.id === currentUser.id) || currentUser;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <SupportChatWidget user={activeUser} />
      
      <Sidebar 
        role={activeUser.role} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar 
          onOpenSidebar={() => setIsSidebarOpen(true)}
          notifications={activeUser.notifications}
          onMarkNotificationsRead={handleMarkNotificationsAsRead}
          onNotificationClick={handleNotificationClick}
          user={activeUser}
          onAvatarClick={() => setShowEditProfileModal(true)}
        />

        <main className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {activeUser.role === 'CUSTOMER' && (
                <CustomerDashboard 
                    user={activeUser} 
                    bookings={bookings.filter(b => b.customerId === activeUser.id)}
                    onCreateBooking={handleCreateBooking}
                    onSendMessage={handleSendMessage}
                    onRateService={handleRateService}
                    onProcessPayment={handleProcessPayment}
                    onCancelBooking={handleCancelBooking}
                    currentView={activeTab}
                    onViewChange={setActiveTab}
                    onUpdateUser={handleUpdateUser}
                    serviceCategories={serviceCategories}
                    providers={users.filter(u => u.role === 'PROVIDER')}
                    onAcceptOffer={handleAcceptOffer}
                    onDeclineOffer={handleDeclineOffer}
                />
                )}
                {activeUser.role === 'PROVIDER' && (
                <ProviderDashboard 
                    user={activeUser} 
                    bookings={bookings}
                    currentView={activeTab}
                    onUpdateStatus={handleUpdateStatus}
                    onAcceptJob={handleAcceptJob}
                    onSendMessage={handleSendMessage}
                    onUpdateAvailability={handleUpdateAvailability}
                    onWithdrawFunds={handleWithdrawFunds}
                    onDeclineJob={handleProviderDeclineJob}
                    onCancelJob={handleProviderCancelJob}
                    onMakeOffer={handleMakeOffer}
                    onPayFee={handleProviderPayFee}
                    onPayAllFees={handleProviderPayAllFees}
                />
                )}
                {activeUser.role === 'ADMIN' && (
                <AdminDashboard 
                    currentUser={activeUser}
                    users={users}
                    bookings={bookings}
                    currentView={activeTab}
                    onAddProvider={handleAddProvider}
                    platformContent={platformContent}
                    onUpdateContent={handleUpdateContent}
                    onProcessWithdrawal={handleProcessWithdrawal}
                    serviceCategories={serviceCategories}
                    onAddCategory={handleAddCategory}
                    onUpdateCategory={handleUpdateCategory}
                    onDeleteCategory={handleDeleteCategory}
                    onRequestFee={handleAdminRequestFee}
                    onMarkFeePaid={handleAdminMarkFeePaid}
                    onAdminSendMessageToUser={handleAdminSendMessageToUser}
                    onSendMessage={handleSendMessage}
                />
                )}
            </div>
          </div>
          <Footer content={platformContent} />
        </main>
      </div>

      <EditProfileModal 
          isOpen={showEditProfileModal} 
          onClose={() => setShowEditProfileModal(false)} 
          user={activeUser} 
          onSave={(u) => { handleUpdateUser(u); setShowEditProfileModal(false); }} 
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <CurrencyProvider>
          <HomeHeroApp />
        </CurrencyProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
