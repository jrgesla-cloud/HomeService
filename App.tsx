
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User, UserRole, ServiceRequest, PaymentMethod, PlatformContent, Availability, Withdrawal, CategoryItem, AppNotification, ServiceOffer, Message, FeeRequest } from './types';
import { Sidebar, TopBar, ToastContainer, ToastMessage, SupportChatWidget, Footer, VerificationModal, LanguageProvider, useLanguage, ThemeProvider, CurrencyProvider, EditProfileModal, MessagesView } from './components/Shared';
import { CustomerDashboard } from './components/CustomerDashboard';
import { ProviderDashboard } from './components/ProviderDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { 
  Hammer, 
  Users, 
  Briefcase, 
  LayoutDashboard, 
  UserPlus, 
  Phone, 
  Lock, 
  MapPin, 
  Mail, 
  User as UserIcon,
  AtSign
} from 'lucide-react';

// --- Mock Data ---
const MOCK_USERS_DATA: User[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'CUSTOMER', avatarUrl: 'https://picsum.photos/200', address: '123 Rruga e Durrësit', phone: '+355 69 123 4567', isVerified: true, notifications: [] },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'PROVIDER', avatarUrl: 'https://picsum.photos/201', category: 'cat_plumbing', rating: 4.8, jobsCompleted: 124, hourlyRate: 850, address: '456 Rruga e Kavajës', phone: '+355 68 987 6543', availability: { workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], startTime: '08:00', endTime: '16:00' }, withdrawals: [], isVerified: true, notifications: [], feeRequests: [] },
  { id: '3', name: 'Charlie Dave', email: 'charlie@example.com', role: 'PROVIDER', avatarUrl: 'https://picsum.photos/202', category: 'cat_electrical', rating: 4.9, jobsCompleted: 89, hourlyRate: 950, address: '789 Bulevardi Zogu I', phone: '+355 67 456 7890', availability: { workingDays: ['Mon', 'Wed', 'Fri'], startTime: '09:00', endTime: '17:00' }, withdrawals: [], isVerified: true, notifications: [], feeRequests: [] },
  { id: '4', name: 'Admin User', email: 'admin@homehero.com', role: 'ADMIN', avatarUrl: 'https://picsum.photos/203', isVerified: true, notifications: [] },
];

const MOCK_BOOKINGS: ServiceRequest[] = [
  { id: 'b1', customerId: '1', customerName: 'Alice Johnson', providerId: '2', providerName: 'Bob Smith', category: 'cat_plumbing', description: 'Rrjedhje uji në lavaman', status: 'COMPLETED', date: '2023-10-15T10:00:00', scheduledDateTime: '2023-10-16T11:00:00', price: 1200, address: '123 Rruga e Durrësit', messages: [], rating: 5, review: 'Punë e shkëlqyer!', paymentStatus: 'PAID', paymentMethod: 'CARD', offers: [] },
];

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'cat1', name: 'cat_plumbing', icon: '🚰', basePrice: 800 },
  { id: 'cat2', name: 'cat_electrical', icon: '⚡', basePrice: 900 },
  { id: 'cat3', name: 'cat_cleaning', icon: '🧹', basePrice: 400 },
  { id: 'cat4', name: 'cat_hvac', icon: '❄️', basePrice: 1000 },
  { id: 'cat5', name: 'cat_landscaping', icon: '🌳', basePrice: 600 },
  { id: 'cat6', name: 'cat_moving', icon: '📦', basePrice: 700 },
  { id: 'cat7', name: 'cat_general', icon: '🔧', basePrice: 500 },
];

const DEFAULT_CONTENT: PlatformContent = {
  aboutUs: "footer_about_content", termsAndConditions: "footer_terms_content", privacyPolicy: "footer_privacy_content",
  faq: [{ question: "faq_q1", answer: "faq_a1" }, { question: "faq_q2", answer: "faq_a2" }],
  contact: { phone: "+355 4 123 4567", email: "support@homehero.al", address: "Tiranë, Shqipëri" },
  socialMedia: { facebook: "https://facebook.com", instagram: "https://instagram.com", twitter: "https://twitter.com" }
};

const COMMISSION_FEE = 500; // Flat 500 Lek

const LoginScreen: React.FC<{ 
  onLogin: (role: UserRole) => void; 
  onRegister: (data: any) => void; 
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
    address: '',
    category: categories[0]?.name || 'cat_general' 
  });

  const handleRegSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(regData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-2xl max-w-lg w-full relative border dark:border-gray-700 animate-scale-in">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200 dark:shadow-none">
            <Hammer className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">HomeHero</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">{mode === 'LOGIN' ? t('login_subtitle') : t('register_subtitle')}</p>
        </div>

        <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-xl mb-8">
          <button onClick={() => setMode('LOGIN')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'LOGIN' ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>{t('sign_in')}</button>
          <button onClick={() => setMode('REGISTER')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'REGISTER' ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>{t('register')}</button>
        </div>

        {mode === 'LOGIN' ? (
          <div className="space-y-4">
            <button onClick={() => onLogin('CUSTOMER')} className="w-full flex items-center justify-between p-4 border dark:border-gray-700 rounded-2xl hover:bg-indigo-50 dark:hover:bg-gray-700/50 transition-all group font-bold">
              <div className="flex items-center gap-3"><AtSign className="w-6 h-6 text-indigo-600" /> <span className="dark:text-white">{t('role_customer')}</span></div>
              <div className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">→</div>
            </button>
            <button onClick={() => onLogin('PROVIDER')} className="w-full flex items-center justify-between p-4 border dark:border-gray-700 rounded-2xl hover:bg-indigo-50 dark:hover:bg-gray-700/50 transition-all group font-bold">
              <div className="flex items-center gap-3"><Briefcase className="w-6 h-6 text-indigo-600" /> <span className="dark:text-white">{t('role_provider')}</span></div>
              <div className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">→</div>
            </button>
            <button onClick={() => onLogin('ADMIN')} className="w-full flex items-center justify-between p-4 border dark:border-gray-700 rounded-2xl hover:bg-indigo-50 dark:hover:bg-gray-700/50 transition-all group font-bold">
              <div className="flex items-center gap-3"><LayoutDashboard className="w-6 h-6 text-indigo-600" /> <span className="dark:text-white">{t('role_admin')}</span></div>
              <div className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">→</div>
            </button>
          </div>
        ) : (
          <form onSubmit={handleRegSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto px-1 scrollbar-thin">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">{t('full_name')}</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input required type="text" placeholder="Emri Mbiemri" value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-0 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">{t('phone')}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input required type="tel" placeholder="+355 6X..." value={regData.phone} onChange={e => setRegData({...regData, phone: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-0 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">{t('email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input required type="email" placeholder="email@example.com" value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-0 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">{t('password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input required type="password" placeholder="••••••••" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-0 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">{t('address')}</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input required type="text" placeholder="Tirana, Albania" value={regData.address} onChange={e => setRegData({...regData, address: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-0 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">{t('account_type')}</label>
              <select value={regData.role} onChange={e => setRegData({...regData, role: e.target.value as UserRole})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-0 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white">
                <option value="CUSTOMER">{t('i_want_hire')}</option>
                <option value="PROVIDER">{t('i_want_work')}</option>
              </select>
            </div>

            {regData.role === 'PROVIDER' && (
              <div className="animate-fade-in">
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">{t('category_label')}</label>
                <select value={regData.category} onChange={e => setRegData({...regData, category: e.target.value})} className="w-full px-4 py-3 bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-100 dark:border-indigo-800 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white font-bold">
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.icon} {t(cat.name)}</option>
                  ))}
                </select>
              </div>
            )}

            <button type="submit" className="w-full flex items-center justify-center gap-2 p-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 shadow-xl shadow-indigo-100 dark:shadow-none transition-all active:scale-[0.98] mt-4">
              <UserPlus size={20} /> {t('create_account')}
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

  const activeUser = useMemo(() => users.find(u => u.id === currentUser?.id) || currentUser, [users, currentUser]);

  const unreadMessagesCount = useMemo(() => {
    if (!activeUser) return 0;
    const myBookings = activeUser.role === 'ADMIN' ? bookings : bookings.filter(b => b.customerId === activeUser.id || b.providerId === activeUser.id);
    return myBookings.reduce((count, booking) => count + booking.messages.filter(m => !m.isRead && m.senderId !== activeUser.id).length, 0);
  }, [bookings, activeUser]);

  const handleLogin = (role: UserRole) => { 
    const user = users.find(u => u.role === role); 
    if (user) { 
      setCurrentUser(user); 
      setActiveTab('dashboard'); 
    } 
  };

  const handleLogout = () => setCurrentUser(null);
  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const notifyUser = useCallback((userId: string, titleKey: string, messageKey: string, params: Record<string, string | number> = {}, type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' = 'INFO', relatedId?: string) => {
    const toastId = Date.now().toString() + Math.random();
    setToasts(prev => [...prev, { id: toastId, title: t(titleKey, params), message: t(messageKey, params), type: type.toLowerCase() as any }]);
    setTimeout(() => removeToast(toastId), 5000);
    const newNotification: AppNotification = { id: `n${Date.now()}`, titleKey, messageKey, params, date: new Date().toISOString(), isRead: false, type, relatedId };
    setUsers(p => p.map(u => u.id === userId ? { ...u, notifications: [newNotification, ...(u.notifications || [])] } : u));
    if (currentUser?.id === userId) setCurrentUser(prev => prev ? { ...prev, notifications: [newNotification, ...(prev.notifications || [])] } : null);
  }, [currentUser, t]);

  const notifyAdmin = (titleKey: string, messageKey: string, params: Record<string, string | number> = {}, relatedId?: string) => {
    const admin = users.find(u => u.role === 'ADMIN');
    if (admin) notifyUser(admin.id, titleKey, messageKey, params, 'INFO', relatedId);
  };

  const handleMarkNotificationsAsRead = () => {
    if (!activeUser) return;
    setUsers(p => p.map(u => u.id === activeUser.id ? { ...u, notifications: (u.notifications || []).map(n => ({ ...n, isRead: true })) } : u));
    setCurrentUser(p => p ? { ...p, notifications: (p.notifications || []).map(n => ({ ...n, isRead: true })) } : null);
  };

  const handleMarkSingleNotificationRead = (notificationId: string) => {
    if (!activeUser) return;
    setUsers(p => p.map(u => u.id === activeUser.id ? { ...u, notifications: (u.notifications || []).map(n => n.id === notificationId ? { ...n, isRead: true } : n) } : u));
    setCurrentUser(p => p ? { ...p, notifications: (p.notifications || []).map(n => n.id === notificationId ? { ...n, isRead: true } : n) } : null);
  };

  const handleNotificationClick = (notification: AppNotification) => {
    handleMarkSingleNotificationRead(notification.id);
    if (notification.relatedId && activeUser) {
        if (activeUser.role === 'CUSTOMER') setActiveTab('history');
        else if (activeUser.role === 'PROVIDER') setActiveTab('schedule');
        else if (activeUser.role === 'ADMIN') setActiveTab('bookings');
    }
  };

  const handleRegister = (data: any) => {
    const newUser: User = { 
        id: `u${Date.now()}`, 
        name: data.name, 
        email: data.email, 
        role: data.role, 
        phone: data.phone, 
        category: data.role === 'PROVIDER' ? data.category : undefined, 
        address: data.address,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`, 
        isVerified: false, 
        notifications: [], 
        feeRequests: data.role === 'PROVIDER' ? [] : undefined, 
        rating: data.role === 'PROVIDER' ? 0 : undefined, 
        jobsCompleted: data.role === 'PROVIDER' ? 0 : undefined, 
        hourlyRate: data.role === 'PROVIDER' ? 500 : undefined,
        withdrawals: []
    };
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code); 
    setPendingUser(newUser); 
    setShowVerificationModal(true);
    setToasts(p => [...p, { id: Date.now().toString(), title: t('verify_email'), message: `${t('verify_code_sent')} ${data.email}: ${code}`, type: 'info' }]);
  };

  const resendVerification = () => { if (pendingUser) setToasts(p => [...p, { id: Date.now().toString(), title: t('verify_email'), message: `${t('verify_code_sent')} ${pendingUser.email}: ${verificationCode}`, type: 'info' }]); };

  const verifyAccount = (code: string) => {
    if (code === verificationCode && pendingUser) {
      const verifiedUser = { ...pendingUser, isVerified: true };
      setUsers([...users, verifiedUser]); 
      setCurrentUser(verifiedUser); 
      setShowVerificationModal(false); 
      setPendingUser(null); 
      setActiveTab('dashboard');
      notifyUser(verifiedUser.id, 'notification_welcome_title', 'notification_welcome_body', {}, 'SUCCESS');
      notifyAdmin('notification_admin_new_user', 'notification_admin_new_user_body', { role: verifiedUser.role, name: verifiedUser.name }, verifiedUser.id);
    } else {
      setToasts(p => [...p, { id: Date.now().toString(), title: t('error'), message: 'Kodi i pasaktë.', type: 'error' }]);
    }
  };

  const handleCreateBooking = (newBookingData: any) => {
    const provider = users.find(u => u.id === newBookingData.providerId);
    const newBooking: ServiceRequest = { ...newBookingData, id: `b${Date.now()}`, status: 'PENDING', date: new Date().toISOString(), messages: [], paymentStatus: 'UNPAID', offers: [], providerName: provider ? provider.name : undefined };
    setBookings(prev => [newBooking, ...prev]);
    notifyUser(newBooking.customerId, 'notification_booking_received', 'notification_booking_received_body', {}, 'SUCCESS', newBooking.id);
    notifyAdmin('notification_admin_new_booking', 'notification_admin_new_booking_body', { category: t(newBooking.category), name: newBooking.customerName }, newBooking.id);
    if (newBooking.providerId) notifyUser(newBooking.providerId, 'notification_direct_request', 'notification_direct_request_body', { name: newBooking.customerName }, 'INFO', newBooking.id);
  };

  const handleSendMessage = (bookingId: string, text: string) => {
    if (!activeUser) return;
    const newMessage: Message = { id: `m${Date.now()}`, senderId: activeUser.id, senderName: activeUser.name, text, timestamp: new Date().toISOString(), isRead: false };
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, messages: [...(b.messages || []), newMessage] } : b));
    
    // Trigger notification for recipient
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      const recipientId = activeUser.id === booking.customerId ? booking.providerId : booking.customerId;
      if (recipientId) {
        notifyUser(recipientId, 'notification_new_message', 'notification_new_message_body', { name: activeUser.name, text: text.substring(0, 30) + (text.length > 30 ? '...' : '') }, 'INFO', bookingId);
      }
    }
  };

  const handleMarkMessagesRead = (bookingId: string) => {
    if (!activeUser) return;
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, messages: b.messages.map(m => m.senderId !== activeUser.id ? { ...m, isRead: true } : m) } : b));
  };

  const handleUpdateStatus = (bookingId: string, status: ServiceRequest['status'], finalPrice?: number) => {
    const b = bookings.find(b => b.id === bookingId);
    if (b) {
        if (status === 'COMPLETED') notifyUser(b.customerId, 'notification_job_completed_title', 'notification_job_completed_body', { category: t(b.category) }, 'SUCCESS', bookingId);
        else if (status === 'IN_PROGRESS') notifyUser(b.customerId, 'notification_job_started_title', 'notification_job_started_body', {}, 'INFO', bookingId);
    }
    setBookings(p => p.map(b => b.id === bookingId ? { ...b, status, price: finalPrice !== undefined ? finalPrice : b.price } : b));
  };

  const handleRateService = (bookingId: string, rating: number, review: string) => { setBookings(p => p.map(b => b.id === bookingId ? { ...b, rating, review } : b)); };
  
  const handleProcessPayment = (bookingId: string, method: PaymentMethod) => { 
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    setBookings(p => p.map(b => b.id === bookingId ? { ...b, paymentStatus: 'PAID', paymentMethod: method } : b));
    if (booking.providerId && method === 'CASH') {
      const commissionAmount = COMMISSION_FEE;
      const newFee: FeeRequest = { id: `f${Date.now()}`, providerId: booking.providerId, bookingId: bookingId, amount: commissionAmount, date: new Date().toISOString(), status: 'PENDING', bookingCategory: booking.category };
      setUsers(p => p.map(u => u.id === booking.providerId ? { ...u, feeRequests: [...(u.feeRequests || []), newFee] } : u));
      notifyUser(booking.providerId, 'notification_fee_request_title', 'notification_fee_request_body', { amount: commissionAmount, category: t(booking.category) }, 'WARNING', bookingId);
    }
    notifyUser(booking.customerId, 'notification_payment_success_title', 'notification_payment_success_body', { method }, 'SUCCESS');
    if (booking.providerId) notifyUser(booking.providerId, 'notification_payment_received_title', 'notification_payment_received_body', { category: t(booking.category) }, 'SUCCESS');
  };

  const handleCancelBooking = (bookingId: string) => { setBookings(p => p.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b)); };
  const handleAcceptJob = (bookingId: string) => {
    if (!activeUser) return;
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'ACCEPTED', providerId: activeUser.id, providerName: activeUser.name } : b));
    const b = bookings.find(b => b.id === bookingId);
    if (b) notifyUser(b.customerId, 'notification_job_accepted_title', 'notification_job_accepted_body', { name: activeUser.name }, 'SUCCESS', bookingId);
  };

  const handleAcceptOffer = (bookingId: string, offerId?: string) => {
    setBookings(prev => prev.map(b => {
        if (b.id === bookingId) {
            const offer = b.offers?.find(o => o.id === offerId);
            if (offer) {
                notifyUser(offer.providerId, 'notification_provider_accepted_title', 'notification_provider_accepted_body', {}, 'SUCCESS', bookingId);
                return { ...b, status: 'ACCEPTED', providerId: offer.providerId, providerName: offer.providerName, price: offer.minPrice }; 
            }
        }
        return b;
    }));
  };

  const handleDeclineOffer = (bookingId: string, offerId?: string) => { 
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, offers: b.offers?.filter(o => o.id !== offerId) } : b)); 
    notifyUser(activeUser!.id, 'notification_offer_declined_customer_title', 'notification_offer_declined_customer_body', {}, 'INFO');
  };

  const handleProviderDeclineJob = (bookingId: string) => { setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'PENDING', providerId: undefined, providerName: undefined } : b)); };
  const handleProviderCancelJob = (bookingId: string) => { setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b)); };
  
  const handleMakeOffer = (bookingId: string, min: number, max: number) => {
    const newOffer: ServiceOffer = { id: `off${Date.now()}`, providerId: activeUser?.id || '', providerName: activeUser?.name || '', minPrice: min, maxPrice: max, timestamp: new Date().toISOString(), status: 'PENDING' };
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'OFFER_MADE', offers: [...(b.offers || []), newOffer] } : b));
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) notifyUser(booking.customerId, 'notification_new_offer', 'notification_new_offer_body', { name: activeUser!.name, amount: `${min} - ${max}` }, 'INFO', bookingId);
  };

  const handleUpdateContent = (content: PlatformContent) => {
    setPlatformContent(content);
    notifyUser(activeUser!.id, 'notification_content_updated', 'notification_content_updated_body', {}, 'SUCCESS');
  };

  const handleProcessWithdrawal = (withdrawalId: string, action: 'APPROVE' | 'REJECT', amount?: number) => {
    setUsers(prevUsers => prevUsers.map(u => ({
      ...u,
      withdrawals: u.withdrawals?.map(w => {
        if (w.id === withdrawalId) {
          const status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
          notifyUser(w.providerId, status === 'APPROVED' ? 'notification_withdrawal_approved_title' : 'notification_withdrawal_rejected_title', status === 'APPROVED' ? 'notification_withdrawal_approved_body' : 'notification_withdrawal_rejected_body', { amount: w.amount }, status === 'APPROVED' ? 'SUCCESS' : 'ERROR');
          return { ...w, status };
        }
        return w;
      })
    })));
  };

  const handleManageFee = (providerId: string, feeId: string, action: 'APPROVE' | 'REJECT' | 'UPDATE' | 'REMIND', newAmount?: number) => {
    setUsers(prev => prev.map(u => {
      if (u.id === providerId) {
        return {
          ...u,
          feeRequests: u.feeRequests?.map(f => {
            if (f.id === feeId) {
              if (action === 'APPROVE') return { ...f, status: 'PAID' as const };
              if (action === 'REJECT') return { ...f, status: 'PENDING' as const };
              if (action === 'UPDATE' && newAmount !== undefined) return { ...f, amount: newAmount };
              return f;
            }
            return f;
          })
        };
      }
      return u;
    }));
    
    if (action === 'APPROVE') notifyUser(providerId, 'notification_fee_reconciled_title', 'notification_fee_reconciled_body', {}, 'SUCCESS');
    if (action === 'REJECT') notifyUser(providerId, 'error', 'Komisioni u refuzua. Ju lutem kontrolloni të dhënat dhe provoni përsëri.', {}, 'ERROR');
    if (action === 'UPDATE') notifyUser(providerId, 'notification_content_updated', 'Vlera e komisionit u ndryshua nga administratori.', {}, 'INFO');
    if (action === 'REMIND') notifyUser(providerId, 'notification_fee_request_title', 'Kujtesë: Keni një komision të prapambetur për shërbimin. Ju lutem kryeni likuidimin.', { amount: 500 }, 'WARNING');
  };

  const handleSettleFee = (feeId: string) => {
    if (!activeUser) return;
    setUsers(prev => prev.map(u => {
      if (u.id === activeUser.id) {
        return {
          ...u,
          feeRequests: u.feeRequests?.map(f => f.id === feeId ? { ...f, status: 'VERIFYING' } : f)
        };
      }
      return u;
    }));
    notifyAdmin('notification_admin_fee_settlement', 'notification_admin_fee_settlement_body', { name: activeUser.name });
  };

  const handleWithdrawFunds = (amount: number, method: string) => {
    if (!activeUser || activeUser.role !== 'PROVIDER') return;
    const newWithdrawal: Withdrawal = { id: `w${Date.now()}`, providerId: activeUser.id, providerName: activeUser.name, amount, date: new Date().toISOString(), status: 'PENDING', method };
    setUsers(p => p.map(u => u.id === activeUser.id ? { ...u, withdrawals: [...(u.withdrawals || []), newWithdrawal] } : u));
    notifyAdmin('notification_admin_withdrawal', 'notification_admin_withdrawal_body', { name: activeUser.name, amount });
  };

  const myBookings = useMemo(() => {
    if (!activeUser) return [];
    if (activeUser.role === 'ADMIN') return bookings;
    return bookings.filter(b => b.customerId === activeUser.id || b.providerId === activeUser.id);
  }, [bookings, activeUser]);

  if (!activeUser) return <CurrencyProvider><ToastContainer toasts={toasts} removeToast={removeToast} /><LoginScreen onLogin={handleLogin} onRegister={handleRegister} categories={serviceCategories} /><VerificationModal isOpen={showVerificationModal} email={pendingUser?.email || ''} onVerify={verifyAccount} onResend={resendVerification} onClose={() => { setShowVerificationModal(false); setPendingUser(null); }} /></CurrencyProvider>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <SupportChatWidget user={activeUser} />
      <Sidebar role={activeUser.role} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} unreadMessagesCount={unreadMessagesCount} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onOpenSidebar={() => setIsSidebarOpen(true)} notifications={activeUser.notifications} onMarkNotificationsRead={handleMarkNotificationsAsRead} onMarkSingleRead={handleMarkSingleNotificationRead} onNotificationClick={handleNotificationClick} user={activeUser} onAvatarClick={() => setActiveTab('profile')} />
        <main className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              {activeTab === 'messages' ? (
                <MessagesView user={activeUser} bookings={myBookings} onSendMessage={handleSendMessage} onMarkRead={handleMarkMessagesRead} />
              ) : (
                <>
                  {activeUser.role === 'CUSTOMER' && <CustomerDashboard user={activeUser} bookings={bookings.filter(b => b.customerId === activeUser.id)} onCreateBooking={handleCreateBooking} onSendMessage={handleSendMessage} onMarkRead={handleMarkMessagesRead} onRateService={handleRateService} onProcessPayment={handleProcessPayment} onCancelBooking={handleCancelBooking} currentView={activeTab} onViewChange={setActiveTab} onUpdateUser={u => setUsers(p => p.map(us => us.id === u.id ? u : us))} serviceCategories={serviceCategories} providers={users.filter(u => u.role === 'PROVIDER')} onAcceptOffer={handleAcceptOffer} onDeclineOffer={handleDeclineOffer} />}
                  {activeUser.role === 'PROVIDER' && <ProviderDashboard user={activeUser} bookings={bookings} currentView={activeTab} onUpdateStatus={handleUpdateStatus} onAcceptJob={handleAcceptJob} onSendMessage={handleSendMessage} onMarkRead={handleMarkMessagesRead} onUpdateAvailability={a => setUsers(p => p.map(u => u.id === activeUser.id ? {...u, availability: a} : u))} onWithdrawFunds={handleWithdrawFunds} onDeclineJob={handleProviderDeclineJob} onCancelJob={handleProviderCancelJob} onUpdateUser={u => setUsers(p => p.map(us => us.id === u.id ? u : us))} onMakeOffer={handleMakeOffer} onSettleFee={handleSettleFee} />}
                  {activeUser.role === 'ADMIN' && <AdminDashboard currentUser={activeUser} users={users} bookings={bookings} currentView={activeTab} onAddUser={u => setUsers([...users, {...u, id: `u${Date.now()}`} as User])} onRemoveUser={id => setUsers(users.filter(u => u.id !== id))} platformContent={platformContent} onUpdateContent={handleUpdateContent} onProcessWithdrawal={handleProcessWithdrawal} serviceCategories={serviceCategories} onAddCategory={c => setServiceCategories([...serviceCategories, {...c, id: `cat${Date.now()}`}])} onDeleteCategory={id => setServiceCategories(serviceCategories.filter(c => c.id !== id))} onAdminSendMessageToUser={(u,m) => {}} onSendMessage={handleSendMessage} onMarkRead={handleMarkMessagesRead} onManageFee={handleManageFee} />}
                </>
              )}
            </div>
          </div>
          <Footer content={platformContent} serviceCategories={serviceCategories} />
        </main>
      </div>
    </div>
  );
}

export default function App() { return (<ThemeProvider><LanguageProvider><CurrencyProvider><HomeHeroApp /></CurrencyProvider></LanguageProvider></ThemeProvider>); }
