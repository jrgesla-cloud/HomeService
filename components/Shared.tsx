
import React, { useState, useEffect, useRef, createContext, useContext, useMemo } from 'react';
import { 
  LayoutDashboard, 
  User, 
  Users,
  Briefcase, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Hammer, 
  DollarSign,
  Star,
  CheckCircle,
  Clock,
  MapPin,
  Search,
  Send,
  MessageSquare,
  CreditCard,
  Lock,
  Banknote,
  Mail,
  MessageCircleQuestion,
  Headphones,
  Instagram,
  Facebook,
  Twitter,
  Phone,
  FileText,
  HelpCircle,
  Info,
  Wallet,
  ArrowRight,
  Grid,
  ShieldCheck,
  Globe,
  Moon,
  Sun,
  Euro,
  Coins,
  Bell,
  Trash2,
  Camera,
  Navigation,
  Loader2,
  Sparkles,
  ChevronRight,
  Calendar,
  CheckCircle2,
  CreditCard as CardIcon,
  Check,
  Languages,
  Play,
  PlayCircle,
  AlertCircle,
  AlertTriangle,
  SendHorizontal,
  AtSign,
  BriefcaseBusiness,
  Edit2,
  Copy,
  Receipt as ReceiptIcon,
  Building2,
  Printer,
  Download,
  ChevronDown,
  ChevronLeft,
  Smile,
  Paperclip
} from 'lucide-react';
import { UserRole, ServiceRequest, User as UserType, PaymentMethod, Message, PlatformContent, AppNotification, CategoryItem } from '../types';
import { translations, Language } from '../translations';

// --- Theme Context ---
type Theme = 'light' | 'dark';
interface ThemeContextType { theme: Theme; toggleTheme: () => void; }
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  return <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(t => t === 'light' ? 'dark' : 'light') }}>{children}</ThemeContext.Provider>;
};
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

// --- Currency Context ---
export type Currency = 'EUR' | 'ALL';
interface CurrencyContextType { currency: Currency; setCurrency: (c: Currency) => void; formatPrice: (amount: number) => string; convertPrice: (amount: number) => number; }
const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);
export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>(() => (localStorage.getItem('currency') as Currency) || 'ALL');
  const RATE = 1;
  useEffect(() => { localStorage.setItem('currency', currency); }, [currency]);
  const convertPrice = (amount: number) => currency === 'ALL' ? (amount || 0) * RATE : (amount || 0);
  const formatPrice = (amount: number) => {
    const val = amount || 0;
    if (currency === 'ALL') return `${val.toLocaleString('sq-AL', { maximumFractionDigits: 0 })} L`; 
    return `€${(val / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  return <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertPrice }}>{children}</CurrencyContext.Provider>;
};
export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
  return context;
};

// --- Language Context ---
interface LanguageContextType { language: Language; setLanguage: (lang: Language) => void; t: (key: string, params?: Record<string, string | number>) => string; }
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('language') as Language) || 'sq');
  useEffect(() => { localStorage.setItem('language', language); }, [language]);
  const t = (key: string, params?: Record<string, string | number>) => {
    // @ts-ignore
    let text = translations[language][key] || key;
    if (params) { Object.entries(params).forEach(([pk, pv]) => { text = text.replace(new RegExp(`{${pk}}`, 'g'), String(pv)); }); }
    return text;
  };
  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
};
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};

// --- Shared Components ---

export const Badge: React.FC<{ status: string }> = ({ status }) => {
  const { t } = useLanguage();
  const colors: Record<string, string> = {
    CUSTOMER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    PROVIDER: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    OFFER_MADE: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    ACCEPTED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    IN_PROGRESS: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    PAID: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    UNPAID: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    VERIFYING: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
      {t(status)}
    </span>
  );
};

export const StatCard: React.FC<{ label: string; value: string | number; icon: any; color: string }> = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-2.5 group hover:shadow-md transition-all active:scale-[0.98]">
    <div className={`w-9 h-9 md:w-10 md:h-10 ${color} rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 dark:shadow-none group-hover:scale-105 transition-transform`}>
      <Icon size={18} strokeWidth={2.5} />
    </div>
    <div className="min-w-0">
      <p className="text-[7px] font-black uppercase text-gray-400 tracking-[0.15em] leading-none mb-1">{label}</p>
      <p className="text-base md:text-lg font-black text-gray-900 dark:text-white leading-none tracking-tight truncate">{value}</p>
    </div>
  </div>
);

export const StarRating: React.FC<{ rating: number; max?: number; onRate?: (r: number) => void }> = ({ rating, max = 5, onRate }) => (
  <div className="flex gap-1">
    {[...Array(max)].map((_, i) => (
      <button key={i} onClick={() => onRate?.(i + 1)} disabled={!onRate} className={`${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} transition-colors`}>
        <Star size={onRate ? 20 : 12} />
      </button>
    ))}
  </div>
);

/**
 * Reusable ChatThread component to handle message display and sending
 */
export const ChatThread: React.FC<{ 
  booking: ServiceRequest; 
  currentUser: UserType; 
  onSendMessage: (bid: string, txt: string) => void;
  showHeader?: boolean;
  onClose?: () => void;
}> = ({ booking, currentUser, onSendMessage, showHeader = false, onClose }) => {
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [booking.messages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(booking.id, message);
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 overflow-hidden">
      {showHeader && (
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xs">
              {booking.category[0].toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-black dark:text-white uppercase tracking-tight leading-none">{t(booking.category)}</p>
              <p className="text-[9px] text-gray-500 font-bold mt-1.5 truncate max-w-[180px]">
                {currentUser.role === 'CUSTOMER' ? (booking.providerName || t('waiting_provider')) : booking.customerName}
              </p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
              <X size={20} className="dark:text-white"/>
            </button>
          )}
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin bg-gray-50/30 dark:bg-gray-900/10">
        {booking.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-30">
            <MessageSquare size={48} className="mb-4 text-indigo-600" />
            <p className="text-[10px] font-black uppercase tracking-widest">{t('start_conversation')}</p>
          </div>
        ) : booking.messages.map((m, idx) => {
          const isMe = m.senderId === currentUser.id;
          const showName = idx === 0 || booking.messages[idx - 1].senderId !== m.senderId;
          
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                {showName && !isMe && (
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">{m.senderName}</p>
                )}
                <div className={`px-4 py-3 rounded-2xl shadow-sm text-xs leading-relaxed ${
                  isMe 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-none border dark:border-gray-600'
                }`}>
                  <p className="font-medium whitespace-pre-wrap">{m.text}</p>
                </div>
                <p className="text-[7px] mt-1.5 opacity-40 font-bold uppercase tracking-tighter">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
          <button type="button" className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"><Smile size={20}/></button>
          <input 
            type="text" 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            placeholder={t('start_conversation')} 
            className="flex-1 bg-transparent border-0 py-2 text-xs focus:ring-0 dark:text-white placeholder:text-gray-400 font-medium" 
          />
          <button type="button" className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"><Paperclip size={20}/></button>
          <button 
            type="submit" 
            disabled={!message.trim()}
            className={`p-2.5 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-30 disabled:scale-100 ${
              message.trim() ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400 dark:bg-gray-800'
            }`}
          >
            <SendHorizontal size={20}/>
          </button>
        </form>
      </div>
    </div>
  );
};

export const ChatModal: React.FC<{ isOpen: boolean; onClose: () => void; booking: ServiceRequest | null; currentUser: UserType; onSendMessage: (bid: string, txt: string) => void; onMarkRead: (bid: string) => void }> = ({ isOpen, onClose, booking, currentUser, onSendMessage, onMarkRead }) => {
  useEffect(() => {
    if (isOpen && booking) {
      onMarkRead(booking.id);
    }
  }, [isOpen, booking?.messages.length, onMarkRead, booking]);

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md h-[600px] shadow-2xl flex flex-col overflow-hidden border dark:border-gray-700 animate-scale-in">
        <ChatThread 
          booking={booking} 
          currentUser={currentUser} 
          onSendMessage={onSendMessage} 
          showHeader 
          onClose={onClose} 
        />
      </div>
    </div>
  );
};

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export const ToastContainer: React.FC<{ toasts: ToastMessage[]; removeToast: (id: string) => void }> = ({ toasts, removeToast }) => (
  <div className="fixed top-6 right-6 z-[100] space-y-2 w-72 pointer-events-none">
    {toasts.map((t) => (
      <div key={t.id} className={`pointer-events-auto p-4 rounded-xl shadow-xl border-l-4 animate-slide-in flex gap-3 ${t.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' : t.type === 'error' ? 'bg-red-50 border-red-500 text-red-800' : t.type === 'warning' ? 'bg-yellow-50 border-yellow-500 text-yellow-800' : 'bg-blue-50 border-blue-500 text-blue-800'}`}>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black uppercase tracking-tight leading-none">{t.title}</p>
          <p className="text-[9px] font-medium opacity-80 mt-2 leading-tight">{t.message}</p>
        </div>
        <button onClick={() => removeToast(t.id)} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"><X size={14}/></button>
      </div>
    ))}
  </div>
);

export const Sidebar: React.FC<{ 
  role: UserRole; 
  activeTab: string; 
  setActiveTab: (t: string) => void; 
  onLogout: () => void; 
  isOpen: boolean; 
  setIsOpen: (o: boolean) => void; 
  unreadMessagesCount: number;
}> = ({ role, activeTab, setActiveTab, onLogout, isOpen, setIsOpen, unreadMessagesCount }) => {
  const { t } = useLanguage();
  
  const menuItems = [
    { id: 'dashboard', label: t('nav_overview'), icon: LayoutDashboard, roles: ['CUSTOMER', 'PROVIDER', 'ADMIN'] },
    { id: 'providers', label: t('nav_users'), icon: Users, roles: ['CUSTOMER'] },
    { id: 'history', label: t('nav_history'), icon: Briefcase, roles: ['CUSTOMER'] },
    { id: 'schedule', label: t('nav_schedule'), icon: Calendar, roles: ['PROVIDER'] },
    { id: 'earnings', label: t('nav_earnings'), icon: Wallet, roles: ['PROVIDER'] },
    { id: 'users', label: t('nav_users'), icon: Users, roles: ['ADMIN'] },
    { id: 'services', label: t('nav_services'), icon: Grid, roles: ['ADMIN'] },
    { id: 'bookings', label: t('nav_bookings'), icon: Briefcase, roles: ['ADMIN'] },
    { id: 'finance', label: t('nav_finance'), icon: DollarSign, roles: ['ADMIN'] },
    { id: 'fees', label: t('nav_fees'), icon: ReceiptIcon, roles: ['ADMIN'] },
    { id: 'content', label: t('nav_content'), icon: FileText, roles: ['ADMIN'] },
    { id: 'messages', label: t('nav_messages'), icon: MessageSquare, roles: ['CUSTOMER', 'PROVIDER', 'ADMIN'], badge: unreadMessagesCount },
    { id: 'profile', label: t('nav_profile'), icon: User, roles: ['CUSTOMER', 'PROVIDER', 'ADMIN'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <>
      <div className={`fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)} />
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col transition-all duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center gap-2.5">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md"><Hammer size={22} /></div>
          <span className="text-xl font-black dark:text-white tracking-tighter">HomeHero</span>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto scrollbar-thin">
          {filteredItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <div className="flex items-center gap-3.5">
                  <item.icon size={20} />
                  {item.label}
                </div>
                {item.badge ? <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black shadow-sm">{item.badge}</span> : null}
              </button>
            );
          })}
        </nav>
        <div className="p-5 border-t border-gray-100 dark:border-gray-700">
          <button onClick={onLogout} className="w-full flex items-center gap-4 px-4 py-3 text-red-500 font-black uppercase tracking-widest text-[11px] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"><LogOut size={20} /> {t('sign_out')}</button>
        </div>
      </aside>
    </>
  );
};

// --- TopBar Component ---
export const TopBar: React.FC<{
  onOpenSidebar: () => void;
  notifications?: AppNotification[];
  onMarkNotificationsRead: () => void;
  onMarkSingleRead: (id: string) => void;
  onNotificationClick: (n: AppNotification) => void;
  user: UserType;
  onAvatarClick: () => void;
}> = ({ onOpenSidebar, notifications = [], onMarkNotificationsRead, onMarkSingleRead, onNotificationClick, user, onAvatarClick }) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="h-16 border-b border-gray-100 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button onClick={onOpenSidebar} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <Menu size={20} />
        </button>
      </div>

      <div className="flex items-center gap-1.5 md:gap-3">
        <button 
          onClick={() => setLanguage(language === 'sq' ? 'en' : 'sq')}
          title={language === 'sq' ? 'Switch to English' : 'Kalo në Shqip'}
          className="p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
        >
          <Languages size={20} className="text-indigo-600" />
          <span className="text-[10px] font-black uppercase tracking-tighter hidden sm:block">{language === 'sq' ? 'SQ' : 'EN'}</span>
        </button>

        <button 
          onClick={() => setCurrency(currency === 'ALL' ? 'EUR' : 'ALL')}
          title={`Switch to ${currency === 'ALL' ? 'EUR' : 'ALL'}`}
          className="p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
        >
          {currency === 'ALL' ? <Coins size={20} className="text-indigo-600" /> : <Euro size={20} className="text-indigo-600" />}
          <span className="text-[10px] font-black uppercase tracking-tighter hidden sm:block">{currency}</span>
        </button>

        <button 
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          className="p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all active:scale-95"
        >
          {theme === 'light' ? <Moon size={20} className="text-indigo-600" /> : <Sun size={20} className="text-yellow-400" />}
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            className="p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl relative transition-all active:scale-95"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                {unreadCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-scale-in origin-top-right">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                  <span className="text-[10px] font-black uppercase tracking-widest dark:text-white">{t('notifications')}</span>
                  <button onClick={onMarkNotificationsRead} className="text-[8px] font-black uppercase text-indigo-600 hover:underline">{t('mark_read')}</button>
                </div>
                <div className="max-h-96 overflow-y-auto scrollbar-thin">
                  {notifications.length === 0 ? (
                    <div className="p-10 text-center text-gray-400">
                      <Bell size={32} className="mx-auto mb-3 opacity-10" />
                      <p className="text-[10px] font-black uppercase tracking-widest">{t('no_notifications')}</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <button 
                        key={n.id} 
                        onClick={() => { onNotificationClick(n); setShowNotifications(false); }}
                        className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors border-b last:border-0 dark:border-gray-700/50 flex gap-3 ${!n.isRead ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          n.type === 'SUCCESS' ? 'bg-green-100 text-green-600' : 
                          n.type === 'WARNING' ? 'bg-yellow-100 text-yellow-600' : 
                          n.type === 'ERROR' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {n.type === 'SUCCESS' ? <CheckCircle size={16}/> : n.type === 'WARNING' ? <AlertTriangle size={16}/> : n.type === 'ERROR' ? <AlertCircle size={16}/> : <Info size={16}/>}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase dark:text-white leading-tight">{t(n.titleKey, n.params)}</p>
                          <p className="text-[10px] text-gray-500 mt-1 leading-tight line-clamp-2">{t(n.messageKey, n.params)}</p>
                          <p className="text-[8px] text-gray-400 mt-1.5 font-bold uppercase">{new Date(n.date).toLocaleDateString()}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <button onClick={onAvatarClick} className="flex items-center gap-3 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group">
          <div className="hidden md:block text-right">
            <p className="text-[10px] font-black dark:text-white uppercase leading-none">{user.name}</p>
            <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-1">{t(`role_${user.role.toLowerCase()}`)}</p>
          </div>
          <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-xl object-cover border-2 border-transparent group-hover:border-indigo-600 transition-all" />
        </button>
      </div>
    </header>
  );
};

// --- New Components to Fix Module Errors ---

// MessagesView
export const MessagesView: React.FC<{ user: UserType; bookings: ServiceRequest[]; onSendMessage: (bid: string, txt: string) => void; onMarkRead: (bid: string) => void }> = ({ user, bookings, onSendMessage, onMarkRead }) => {
  const [selectedBooking, setSelectedBooking] = useState<ServiceRequest | null>(null);
  const { t } = useLanguage();
  
  // Sorting bookings by latest message timestamp
  const chatList = useMemo(() => {
    return bookings
      .filter(b => b.messages.length > 0 || (b.providerId && b.customerId))
      .sort((a, b) => {
        const aTime = a.messages.length > 0 ? new Date(a.messages[a.messages.length-1].timestamp).getTime() : 0;
        const bTime = b.messages.length > 0 ? new Date(b.messages[b.messages.length-1].timestamp).getTime() : 0;
        return bTime - aTime;
      });
  }, [bookings]);

  useEffect(() => {
    if (selectedBooking) {
      onMarkRead(selectedBooking.id);
    }
  }, [selectedBooking?.id, onMarkRead]);

  return (
    <div className="flex flex-col lg:flex-row h-[700px] bg-white dark:bg-gray-800 rounded-3xl border dark:border-gray-700 shadow-xl overflow-hidden animate-fade-in">
      {/* Chats Sidebar */}
      <div className="w-full lg:w-96 border-r dark:border-gray-700 flex flex-col bg-gray-50/50 dark:bg-gray-900/50">
        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="font-black uppercase tracking-[0.2em] text-[11px] dark:text-white flex items-center gap-2">
            <MessageSquare size={18} className="text-indigo-600" />
            {t('nav_messages')}
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {chatList.length === 0 ? (
            <div className="p-16 text-center text-gray-400 flex flex-col items-center opacity-30">
               <MessageSquare size={40} className="mb-4" />
               <p className="italic text-[10px] font-black uppercase tracking-widest">{t('no_bookings')}</p>
            </div>
          ) : chatList.map(b => {
            const unread = b.messages.filter(m => !m.isRead && m.senderId !== user.id).length;
            const lastMsg = b.messages[b.messages.length - 1];
            const chatName = user.role === 'CUSTOMER' ? (b.providerName || t('waiting_provider')) : b.customerName;
            
            return (
              <button 
                key={b.id} 
                onClick={() => setSelectedBooking(b)} 
                className={`w-full p-5 text-left border-b dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all flex gap-4 relative group ${selectedBooking?.id === b.id ? 'bg-white dark:bg-gray-800' : ''}`}
              >
                {selectedBooking?.id === b.id && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600 shadow-[2px_0_10px_rgba(79,70,229,0.4)]" />}
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-sm shrink-0 border dark:border-indigo-500/20 group-hover:scale-105 transition-transform">
                  {chatName[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <p className={`text-[11px] font-black uppercase truncate tracking-tight ${unread > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>
                      {chatName}
                    </p>
                    <p className="text-[7px] font-bold text-gray-400 uppercase">
                      {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-[10px] truncate max-w-[200px] ${unread > 0 ? 'font-black text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 font-medium'}`}>
                      {lastMsg?.text || t('start_conversation')}
                    </p>
                    {unread > 0 && (
                      <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[8px] text-white font-black shadow-lg animate-pulse">
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Thread Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 relative">
        {selectedBooking ? (
          <div className="h-full">
            <ChatThread 
              booking={selectedBooking} 
              currentUser={user} 
              onSendMessage={onSendMessage} 
              showHeader={true}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/20 dark:bg-gray-900/10">
            <div className="relative">
              <MessageSquare size={80} className="mb-6 text-indigo-100 dark:text-indigo-900/30" />
              <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-3 rounded-2xl shadow-2xl">
                <SendHorizontal size={24} />
              </div>
            </div>
            <p className="text-sm font-black italic uppercase tracking-widest text-gray-300 dark:text-gray-600">{t('select_provider')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ProfileView
export const ProfileView: React.FC<{ user: UserType; onEdit: () => void }> = ({ user, onEdit }) => {
  const { t } = useLanguage();
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 shadow-sm overflow-hidden p-8 md:p-12">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
          <div className="relative group">
            <img src={user.avatarUrl} className="w-40 h-40 rounded-[2rem] object-cover border-4 border-gray-50 dark:border-gray-700 shadow-xl" alt={user.name} />
            <button onClick={onEdit} className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:scale-110 transition-transform active:scale-95"><Edit2 size={20}/></button>
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <h2 className="text-3xl font-black dark:text-white uppercase tracking-tight">{user.name}</h2>
              <Badge status={user.role} />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-bold mb-8 italic text-lg">"{user.bio || 'HomeHero Professional'}"</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-left">
              <div><p className="text-[8px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2">{t('email')}</p><p className="text-xs font-black dark:text-white truncate">{user.email}</p></div>
              <div><p className="text-[8px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2">{t('phone')}</p><p className="text-xs font-black dark:text-white">{user.phone || 'N/A'}</p></div>
              <div><p className="text-[8px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2">{t('address')}</p><p className="text-xs font-black dark:text-white truncate">{user.address || 'N/A'}</p></div>
            </div>
          </div>
        </div>
      </div>
      {user.role === 'PROVIDER' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <StatCard label={t('completed_jobs')} value={user.jobsCompleted || 0} icon={BriefcaseBusiness} color="bg-indigo-500" />
           <StatCard label={t('my_rating')} value={user.rating?.toFixed(1) || '0.0'} icon={Star} color="bg-yellow-500" />
           <StatCard label={t('enter_price')} value={`${user.hourlyRate} L/h`} icon={Banknote} color="bg-emerald-500" />
        </div>
      )}
    </div>
  );
};

// EditProfileModal
export const EditProfileModal: React.FC<{ isOpen: boolean; onClose: () => void; user: UserType; onSave: (u: UserType) => void }> = ({ isOpen, onClose, user, onSave }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ ...user });
  useEffect(() => { setFormData({...user}); }, [user, isOpen]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] w-full max-w-lg shadow-2xl p-8 border dark:border-gray-700 animate-scale-in">
        <div className="flex justify-between items-center mb-8"><h3 className="text-xl font-black dark:text-white uppercase tracking-tight">{t('edit_profile')}</h3><button onClick={onClose} className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={24}/></button></div>
        <form onSubmit={e => { e.preventDefault(); onSave(formData); onClose(); }} className="space-y-5">
           <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">{t('full_name')}</label><input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-800 rounded-xl text-xs dark:text-white font-black" /></div>
           <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">{t('bio')}</label><textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-800 rounded-xl text-xs dark:text-white font-bold h-24" /></div>
           <div className="grid grid-cols-2 gap-4">
             <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">{t('phone')}</label><input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-800 rounded-xl text-xs dark:text-white font-black" /></div>
             <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">{t('address')}</label><input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-800 rounded-xl text-xs dark:text-white font-black" /></div>
           </div>
           <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 shadow-xl active:scale-95 transition-all mt-4">{t('save')}</button>
        </form>
      </div>
    </div>
  );
};

// RatingModal
export const RatingModal: React.FC<{ isOpen: boolean; onClose: () => void; booking: ServiceRequest | null; onSubmit: (bid: string, r: number, rev: string) => void }> = ({ isOpen, onClose, booking, onSubmit }) => {
  const { t } = useLanguage();
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  if (!isOpen || !booking) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 border dark:border-gray-700 animate-scale-in">
        <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight text-center mb-8">{t('rate_service')}</h3>
        <div className="flex justify-center mb-10"><StarRating rating={rating} max={5} onRate={setRating} /></div>
        <textarea placeholder={t('review_optional')} value={review} onChange={e => setReview(e.target.value)} className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl text-xs dark:text-white font-bold h-32 mb-8" />
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 text-gray-400 font-black uppercase tracking-widest text-[10px]">{t('cancel')}</button>
          <button onClick={() => { onSubmit(booking.id, rating, review); onClose(); }} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-indigo-700 active:scale-95 transition-all">{t('submit')}</button>
        </div>
      </div>
    </div>
  );
};

// PaymentModal
export const PaymentModal: React.FC<{ isOpen: boolean; onClose: () => void; booking: ServiceRequest | null; onProcessPayment: (bid: string, m: PaymentMethod) => void }> = ({ isOpen, onClose, booking, onProcessPayment }) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [method, setMethod] = useState<PaymentMethod>('CARD');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Card Details State
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const parts = value.match(/.{1,4}/g);
    setCardNumber(parts ? parts.join(' ').substring(0, 19) : '');
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) value = value.substring(0, 2) + '/' + value.substring(2, 4);
    setExpiry(value.substring(0, 5));
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    setCvc(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (method === 'CARD' && (cardNumber.length < 16 || expiry.length < 5 || cvc.length < 3)) {
      return; // Basic local block
    }
    setIsProcessing(true);
    // Simulate real gateway delay
    setTimeout(() => {
      onProcessPayment(booking!.id, method);
      setIsProcessing(false);
      onClose();
    }, 2000);
  };

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 border dark:border-gray-700 animate-scale-in overflow-hidden">
        <div className="flex justify-between items-center mb-8">
           <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight">{t('payment_modal_title')}</h3>
           <button onClick={onClose} disabled={isProcessing} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><X size={24}/></button>
        </div>

        <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl border dark:border-gray-700 flex justify-between items-center shadow-inner">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl"><ReceiptIcon size={20}/></div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t('total')}</span>
           </div>
           <span className="text-2xl font-black dark:text-white">{formatPrice(booking.price)}</span>
        </div>

        <div className="flex gap-3 mb-8">
           <button 
             type="button"
             disabled={isProcessing}
             onClick={() => setMethod('CARD')} 
             className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${method === 'CARD' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 shadow-lg shadow-indigo-100 dark:shadow-none' : 'border-gray-100 dark:border-gray-700 text-gray-400'}`}
           >
              <CardIcon size={24}/>
              <span className="text-[9px] font-black uppercase tracking-widest">{t('pay_card')}</span>
           </button>
           <button 
             type="button"
             disabled={isProcessing}
             onClick={() => setMethod('CASH')} 
             className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${method === 'CASH' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 shadow-lg shadow-indigo-100 dark:shadow-none' : 'border-gray-100 dark:border-gray-700 text-gray-400'}`}
           >
              <Banknote size={24}/>
              <span className="text-[9px] font-black uppercase tracking-widest">{t('pay_cash')}</span>
           </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {method === 'CARD' && (
            <div className="space-y-5 animate-fade-in">
              <div className="relative">
                <label className="block text-[9px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">{t('card_info')}</label>
                <div className="relative group">
                   <CardIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20}/>
                   <input 
                     required
                     disabled={isProcessing}
                     type="text" 
                     placeholder="0000 0000 0000 0000"
                     value={cardNumber}
                     onChange={handleCardNumberChange}
                     className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-600 rounded-2xl text-sm font-black dark:text-white transition-all outline-none"
                   />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative group">
                   <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20}/>
                   <input 
                     required
                     disabled={isProcessing}
                     type="text" 
                     placeholder="MM/YY"
                     value={expiry}
                     onChange={handleExpiryChange}
                     className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-600 rounded-2xl text-sm font-black dark:text-white transition-all outline-none"
                   />
                </div>
                <div className="relative group">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20}/>
                   <input 
                     required
                     disabled={isProcessing}
                     type="text" 
                     placeholder="CVC"
                     value={cvc}
                     onChange={handleCvcChange}
                     className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-600 rounded-2xl text-sm font-black dark:text-white transition-all outline-none"
                   />
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 opacity-60">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">{t('secure_checkout')}</span>
              </div>
            </div>
          )}

          {method === 'CASH' && (
            <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 flex items-center gap-4 animate-fade-in">
               <Banknote size={32} className="text-indigo-600" />
               <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-widest leading-relaxed">
                 {t('cash_payment_selected')}. Ju lutem sigurohuni që të keni shumën e duhur të gatshme për profesionistin.
               </p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isProcessing}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:pointer-events-none"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                {t('processing')}
              </>
            ) : (
              <>
                <Check size={20}/>
                {method === 'CARD' ? t('confirm') : t('confirm_cash')}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// WithdrawalModal
export const WithdrawalModal: React.FC<{ isOpen: boolean; onClose: () => void; availableBalance: number; onWithdraw: (amt: number, m: string) => void }> = ({ isOpen, onClose, availableBalance, onWithdraw }) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [amount, setAmount] = useState(availableBalance.toString());
  const [method, setMethod] = useState('PayPal');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 border dark:border-gray-700 animate-scale-in">
        <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight mb-8">{t('withdraw_funds')}</h3>
        <div className="space-y-6 mb-10 text-left">
          <div><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('amount')} (Max: {formatPrice(availableBalance)})</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl text-lg font-black dark:text-white" /></div>
          <div><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('method')}</label><select value={method} onChange={e => setMethod(e.target.value)} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl text-xs font-black dark:text-white"><option value="PayPal">PayPal</option><option value="Bank Transfer">{t('bank_transfer')}</option></select></div>
        </div>
        <button onClick={() => { onWithdraw(parseFloat(amount), method); onClose(); }} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-indigo-700 active:scale-95 transition-all">{t('confirm')}</button>
      </div>
    </div>
  );
};

// OfferModal
export const OfferModal: React.FC<{ isOpen: boolean; onClose: () => void; onSubmit: (min: number, max: number) => void }> = ({ isOpen, onClose, onSubmit }) => {
  const { t } = useLanguage();
  const [min, setMin] = useState('500');
  const [max, setMax] = useState('1000');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 border dark:border-gray-700 animate-scale-in">
        <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight mb-8">{t('make_offer')}</h3>
        <div className="grid grid-cols-2 gap-4 mb-10 text-left">
          <div><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('min_price')}</label><input type="number" value={min} onChange={e => setMin(e.target.value)} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl text-lg font-black dark:text-white" /></div>
          <div><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('max_price')}</label><input type="number" value={max} onChange={e => setMax(e.target.value)} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl text-lg font-black dark:text-white" /></div>
        </div>
        <button onClick={() => { onSubmit(parseFloat(min), parseFloat(max)); onClose(); }} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-indigo-700 active:scale-95 transition-all">{t('send')}</button>
      </div>
    </div>
  );
};

// JobCompletionModal
export const JobCompletionModal: React.FC<{ isOpen: boolean; onClose: () => void; booking: ServiceRequest | null; onComplete: (bid: string, price: number) => void }> = ({ isOpen, onClose, booking, onComplete }) => {
  const { t } = useLanguage();
  const [price, setPrice] = useState('0');
  if (!isOpen || !booking) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 border dark:border-gray-700 animate-scale-in">
        <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight mb-4">{t('complete_job')}</h3>
        <p className="text-[10px] text-gray-400 font-bold mb-8 uppercase tracking-widest leading-relaxed text-left">{t('enter_final_price_desc')}</p>
        <div className="mb-10 text-left">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('final_price')}</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl text-2xl font-black dark:text-white" />
        </div>
        <button onClick={() => { onComplete(booking.id, parseFloat(price)); onClose(); }} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-emerald-700 active:scale-95 transition-all">{t('confirm_completion')}</button>
      </div>
    </div>
  );
};

// SupportChatWidget
export const SupportChatWidget: React.FC<{ user: UserType }> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  return (
    <div className="fixed bottom-6 right-6 z-[80]">
      {isOpen ? (
        <div className="bg-white dark:bg-gray-800 w-72 h-96 rounded-2xl shadow-2xl border dark:border-gray-700 flex flex-col overflow-hidden animate-slide-in">
          <div className="p-4 bg-indigo-600 text-white flex justify-between items-center"><span className="text-[10px] font-black uppercase tracking-widest">Support Hero</span><button onClick={() => setIsOpen(false)}><X size={18}/></button></div>
          <div className="flex-1 p-4 flex flex-col items-center justify-center text-center"><Headphones size={40} className="text-indigo-600 opacity-20 mb-4"/><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">Agenti i mbështetjes do të jetë i disponueshëm së shpejti.</p></div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"><MessageSquare size={28}/></button>
      )}
    </div>
  );
};

// Footer
export const Footer: React.FC<{ content: PlatformContent; serviceCategories: CategoryItem[] }> = ({ content, serviceCategories }) => {
  const { t } = useLanguage();
  return (
    <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 py-16 px-4 md:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2.5 mb-6"><Hammer size={24} className="text-indigo-600"/><span className="text-xl font-black dark:text-white tracking-tighter">HomeHero</span></div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed mb-6">{t('find_perfect_pro')}</p>
          <div className="flex gap-4"><Instagram size={18} className="text-gray-400"/><Facebook size={18} className="text-gray-400"/><Twitter size={18} className="text-gray-400"/></div>
        </div>
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-widest mb-6 dark:text-white">{t('popular_services')}</h4>
          <ul className="space-y-3">{serviceCategories.slice(0, 5).map(c => <li key={c.id} className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t(c.name)}</li>)}</ul>
        </div>
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-widest mb-6 dark:text-white">{t('contact_info')}</h4>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-[10px] text-gray-500 font-bold uppercase tracking-widest"><Phone size={14}/> {content.contact.phone}</li>
            <li className="flex items-center gap-3 text-[10px] text-gray-500 font-bold uppercase tracking-widest"><Mail size={14}/> {content.contact.email}</li>
            <li className="flex items-center gap-3 text-[10px] text-gray-500 font-bold uppercase tracking-widest"><MapPin size={14}/> {content.contact.address}</li>
          </ul>
        </div>
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-widest mb-6 dark:text-white">{t('site_content')}</h4>
          <ul className="space-y-3">
            <li className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">FAQ</li>
            <li className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Terms</li>
            <li className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Privacy</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

// VerificationModal
export const VerificationModal: React.FC<{ isOpen: boolean; email: string; onVerify: (c: string) => void; onResend: () => void; onClose: () => void }> = ({ isOpen, email, onVerify, onResend, onClose }) => {
  const { t } = useLanguage();
  const [code, setCode] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 border dark:border-gray-700 animate-scale-in text-center">
        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><Mail size={32}/></div>
        <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight mb-4">{t('sign_in')}</h3>
        <p className="text-[10px] text-gray-500 font-bold mb-8 uppercase tracking-widest leading-relaxed">Dërguam një kod në: <br/><span className="text-indigo-600">{email}</span></p>
        <input type="text" maxLength={6} placeholder="000000" value={code} onChange={e => setCode(e.target.value)} className="w-full text-center px-5 py-4 bg-gray-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl text-2xl font-black dark:text-white tracking-[0.5em] mb-8" />
        <button onClick={() => onVerify(code)} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-indigo-700 active:scale-95 transition-all mb-4">{t('confirm')}</button>
        <button onClick={onResend} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Rinis kodin</button>
      </div>
    </div>
  );
};
