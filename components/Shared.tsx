
import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { 
  LayoutDashboard, 
  User, 
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
  ChevronRight
} from 'lucide-react';
import { UserRole, ServiceRequest, User as UserType, PaymentMethod, Message, PlatformContent, AppNotification } from '../types';
import { translations, Language } from '../translations';

// --- Theme Context ---

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

export const ThemeSwitcher: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-300 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
      aria-label="Toggle Dark Mode"
    >
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
};

// --- Currency Context ---

export type Currency = 'EUR' | 'ALL';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (amount: number) => string;
  convertPrice: (amount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>('EUR');

  // Exchange rate assumption: 1 EUR = 100 ALL
  const RATE = 100;

  const convertPrice = (amount: number) => {
    const val = amount || 0;
    if (currency === 'ALL') return val * RATE;
    return val;
  }

  const formatPrice = (amount: number) => {
    const val = amount || 0;
    if (currency === 'ALL') {
      return `${(val * RATE).toLocaleString('sq-AL', { maximumFractionDigits: 0 })} L`; 
    }
    return `€${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
  return context;
};

export const CurrencySwitcher: React.FC = () => {
  const { currency, setCurrency } = useCurrency();
  return (
    <button
      onClick={() => setCurrency(currency === 'EUR' ? 'ALL' : 'EUR')}
      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 text-xs font-bold transition-colors border border-green-200 dark:border-green-800"
    >
      {currency === 'EUR' ? <Euro size={14} /> : <Coins size={14} />}
      {currency}
    </button>
  );
};

// --- Language Context ---

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('sq'); // Default to Albanian

  const t = (key: string, params?: Record<string, string | number>) => {
    // @ts-ignore
    let text = translations[language][key] || key;
    
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
      });
    }
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// --- Language Switcher ---
export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <button 
      onClick={() => setLanguage(language === 'sq' ? 'en' : 'sq')}
      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors border border-indigo-200 dark:border-indigo-800"
    >
      <Globe size={14} />
      {language === 'sq' ? 'SQ' : 'EN'}
    </button>
  );
};

// --- Location Picker Component ---

interface LocationPickerProps {
  address: string;
  setAddress: (addr: string) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ address, setAddress }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('address')}</label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
        <input 
          required 
          type="text" 
          value={address} 
          onChange={(e) => setAddress(e.target.value)} 
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all" 
          placeholder={t('address')}
        />
      </div>
    </div>
  );
}

// --- Notification Panel ---

interface NotificationPanelProps {
  notifications: AppNotification[];
  onMarkAsRead: () => void;
  onClose: () => void;
  onNotificationClick?: (n: AppNotification) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onMarkAsRead, onClose, onNotificationClick }) => {
  const { t } = useLanguage();
  const sortedNotifications = [...notifications].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="absolute top-12 right-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 animate-scale-in origin-top-right overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Bell size={16} /> {t('notifications')}
        </h3>
        <div className="flex gap-2">
          {notifications.some(n => !n.isRead) && (
            <button 
              onClick={onMarkAsRead}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {t('mark_read')}
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {sortedNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
             <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
             <p className="text-sm">{t('no_notifications')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {sortedNotifications.map(n => (
              <div 
                key={n.id} 
                onClick={() => { if(onNotificationClick) onNotificationClick(n); onClose(); }}
                className={`p-4 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${n.isRead ? 'bg-white dark:bg-gray-800' : 'bg-indigo-50/50 dark:bg-indigo-900/20'}`}
              >
                 <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-semibold ${n.isRead ? 'text-gray-800 dark:text-gray-200' : 'text-indigo-700 dark:text-indigo-300'}`}>
                      {!n.isRead && <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>}
                      {/* Dynamic translation of Title */}
                      {t(n.titleKey, n.params)}
                    </h4>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">{new Date(n.date).toLocaleDateString()}</span>
                 </div>
                 {/* Dynamic translation of Message */}
                 <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                   {t(n.messageKey, n.params)}
                 </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- TopBar ---

interface TopBarProps {
  onOpenSidebar: () => void;
  notifications?: AppNotification[];
  onMarkNotificationsRead?: () => void;
  user?: UserType;
  onNotificationClick?: (n: AppNotification) => void;
  onAvatarClick?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenSidebar, notifications = [], onMarkNotificationsRead, user, onNotificationClick, onAvatarClick }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4 lg:px-8 shadow-sm">
      <div className="flex items-center gap-4">
        <button onClick={onOpenSidebar} className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
           <Menu size={24} />
        </button>
        <span className="lg:hidden font-bold text-gray-900 dark:text-white text-xl">HomeHero</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
         <div className="flex items-center gap-2">
             <LanguageSwitcher />
             <CurrencySwitcher />
             <ThemeSwitcher />
         </div>

         <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
         
         <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors relative"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></span>
              )}
            </button>
            {showNotifications && (
              <NotificationPanel 
                notifications={notifications} 
                onMarkAsRead={() => { if(onMarkNotificationsRead) onMarkNotificationsRead(); }} 
                onClose={() => setShowNotifications(false)} 
                onNotificationClick={onNotificationClick}
              />
            )}
         </div>
         
         {user && (
             <button 
                onClick={onAvatarClick}
                className="hidden sm:block ml-2 w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-gray-600 hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer relative group"
             >
               <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Settings size={12} className="text-white" />
               </div>
             </button>
         )}
      </div>
    </header>
  );
};

// Temp fix for missing icon in Sidebar
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);

// --- Sidebar ---

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, setActiveTab, onLogout, isOpen, setIsOpen }) => {
  const { t } = useLanguage();
  
  const menuItems = {
    CUSTOMER: [
      { id: 'dashboard', label: t('nav_browse'), icon: Search },
      { id: 'history', label: t('nav_history'), icon: Clock },
      { id: 'profile', label: t('nav_profile'), icon: User },
    ],
    PROVIDER: [
      { id: 'dashboard', label: t('nav_job_board'), icon: Briefcase },
      { id: 'schedule', label: t('nav_schedule'), icon: CalendarIcon },
      { id: 'earnings', label: t('nav_earnings'), icon: DollarSign },
    ],
    ADMIN: [
      { id: 'dashboard', label: t('nav_overview'), icon: LayoutDashboard },
      { id: 'services', label: t('nav_services'), icon: Grid },
      { id: 'users', label: t('nav_users'), icon: User },
      { id: 'bookings', label: t('nav_bookings'), icon: Briefcase },
      { id: 'finance', label: t('nav_finance'), icon: DollarSign },
      { id: 'content', label: t('nav_content'), icon: Settings },
    ]
  };

  const items = menuItems[role];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Content */}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:transform-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Hammer className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">HomeHero</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500 dark:text-gray-400">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-1 mt-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === item.id 
                  ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <item.icon className={`w-5 h-5 mr-3 ${activeTab === item.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <button 
            onClick={onLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            {t('sign_out')}
          </button>
        </div>
      </div>
    </>
  );
};

// --- Edit Profile Modal (Shared) ---

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserType;
    onSave: (updatedUser: UserType) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onSave }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        avatarUrl: user.avatarUrl,
        bio: user.bio || ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...user, ...formData });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-md shadow-2xl p-6 animate-scale-in border dark:border-gray-700 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('edit_profile')}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-200 dark:border-indigo-800 mb-4">
                             <img src={formData.avatarUrl} alt={t('preview')} className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                 <Camera className="text-white drop-shadow-md" size={32} />
                             </div>
                        </div>
                        <div className="w-full">
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('avatar_url')}</label>
                            <input 
                                type="text" 
                                value={formData.avatarUrl} 
                                onChange={(e) => setFormData({...formData, avatarUrl: e.target.value})} 
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500" 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('full_name')}</label>
                        <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email')}</label>
                        <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phone')}</label>
                        <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('address')}</label>
                        <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    {user.role === 'PROVIDER' && (
                        <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('bio')}</label>
                             <textarea rows={2} value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    )}
                    <button type="submit" className="w-full px-4 py-3 text-white bg-indigo-600 rounded-xl font-medium hover:bg-indigo-700 transition-colors mt-4">
                        {t('save')}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- Offer Modal ---

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (minPrice: number, maxPrice: number) => void;
  suggestedRange?: string;
}

export const OfferModal: React.FC<OfferModalProps> = ({ isOpen, onClose, onSubmit, suggestedRange }) => {
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const { t } = useLanguage();
  const { currency } = useCurrency();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let min = parseFloat(minPrice);
    let max = parseFloat(maxPrice);
    if (min > 0 && max >= min) {
      // FIX: Handle currency conversion for user input. Store as base currency (EUR).
      if (currency === 'ALL') {
          min = min / 100;
          max = max / 100;
      }
      onSubmit(min, max);
      setMinPrice('');
      setMaxPrice('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-0 animate-scale-in border dark:border-gray-700 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
              <DollarSign size={18} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('make_offer')}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {suggestedRange && (
              <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800 rounded-xl flex items-start gap-3 text-xs text-purple-700 dark:text-purple-300 shadow-sm">
                  <Sparkles size={18} className="shrink-0 text-purple-500" />
                  <div>
                    <p className="font-bold mb-1">{t('ai_suggested_range')}</p>
                    <p className="text-sm font-black opacity-90">{suggestedRange}</p>
                  </div>
              </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('min_price')} ({currency})</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{currency === 'EUR' ? '€' : 'L'}</div>
                  <input 
                    required
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="0.00"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                    autoFocus
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('max_price')} ({currency})</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{currency === 'EUR' ? '€' : 'L'}</div>
                  <input 
                    required
                    type="number"
                    min={minPrice || "1"}
                    step="0.01"
                    placeholder="0.00"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={!minPrice || !maxPrice || parseFloat(maxPrice) < parseFloat(minPrice)}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('send')}
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Star Rating ---

interface StarRatingProps {
  rating: number;
  setRating?: (rating: number) => void;
  interactive?: boolean;
  size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({ rating, setRating, interactive = false, size = 16 }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          disabled={!interactive}
          onClick={() => interactive && setRating && setRating(star)}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
        >
          <Star 
            size={size} 
            className={`${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300 dark:text-gray-600'
            }`} 
          />
        </button>
      ))}
    </div>
  );
};

// --- Rating Modal ---

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: ServiceRequest | null;
  onSubmit: (bookingId: string, rating: number, review: string) => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onClose, booking, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const { t } = useLanguage();

  if (!isOpen || !booking) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(booking.id, rating, review);
    onClose();
    setRating(5);
    setReview('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6 animate-scale-in border dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('rate_service')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-xl font-bold text-indigo-700 dark:text-indigo-300 mb-3">
            {booking.providerName?.[0]}
          </div>
          <p className="font-semibold text-gray-900 dark:text-white">{booking.providerName}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{booking.category}</p>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl w-full flex justify-center mb-4">
             <StarRating rating={rating} setRating={setRating} interactive size={32} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('review_optional')}</label>
            <textarea 
              rows={3}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="..."
            />
          </div>
          
          <button 
            type="submit"
            className="w-full px-4 py-3 text-white bg-indigo-600 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            {t('submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Payment Modal ---

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: ServiceRequest | null;
  onProcessPayment: (bookingId: string, method: PaymentMethod) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, booking, onProcessPayment }) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
  
  // Card Fields
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onProcessPayment(booking.id, paymentMethod);
    setIsProcessing(false);
    
    // Reset
    setCardNumber('');
    setExpiry('');
    setCvc('');
    setPaymentMethod('CARD');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6 animate-scale-in border dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('payment_modal_title')}</h3>
          <button onClick={onClose} disabled={isProcessing} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
           <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 dark:text-gray-300 font-medium">{t('total')}</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(booking.price)}</span>
           </div>
           <p className="text-sm text-gray-500 dark:text-gray-400">{t(booking.category)} - {booking.providerName}</p>
        </div>

        {/* Payment Method Selector */}
        <div className="flex gap-4 mb-6">
          <button 
            type="button"
            onClick={() => setPaymentMethod('CARD')}
            className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${
              paymentMethod === 'CARD' 
                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm' 
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
            }`}
          >
            <CreditCard size={20} />
            <span className="font-medium">{t('pay_card')}</span>
          </button>
          <button 
             type="button"
             onClick={() => setPaymentMethod('CASH')}
             className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${
              paymentMethod === 'CASH' 
                ? 'border-green-600 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 shadow-sm' 
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
            }`}
          >
            <Banknote size={20} />
            <span className="font-medium">{t('pay_cash')}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {paymentMethod === 'CARD' ? (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('card_info')}</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <input 
                    required
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('exp_date')}</label>
                    <input 
                      required
                      type="text"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value.replace(/\D/g, '').replace(/^(\d{2})(\d{0,2})/, '$1/$2').slice(0, 5))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('cvc')}</label>
                    <input 
                      required
                      type="text"
                      placeholder="123"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center animate-fade-in">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Banknote className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-gray-900 dark:text-white font-medium mb-1">{t('pay_cash')}</p>
            </div>
          )}
          
          <button 
            type="submit"
            disabled={isProcessing}
            className={`w-full px-4 py-3 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
              paymentMethod === 'CARD' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isProcessing ? (
              <>{t('processing')}</>
            ) : (
              <>
                {paymentMethod === 'CARD' ? <Lock size={16} /> : <CheckCircle size={16} />} 
                {paymentMethod === 'CARD' ? `${t('pay_now')} ${formatPrice(booking.price)}` : t('confirm_cash')}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Chat Modal ---
interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: ServiceRequest | null;
  currentUser: UserType;
  onSendMessage: (bookingId: string, text: string) => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, booking, currentUser, onSendMessage }) => {
  const { t } = useLanguage();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, booking?.messages]);

  if (!isOpen || !booking) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(booking.id, newMessage);
      setNewMessage('');
    }
  };

  const otherPersonName = currentUser.role === 'CUSTOMER' ? booking.providerName : booking.customerName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl flex flex-col h-[600px] animate-scale-in border dark:border-gray-700">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">
              {otherPersonName ? otherPersonName[0] : '?'}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">{otherPersonName || t('provider_default')}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t(booking.category)} - <Badge status={booking.status} /></p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-800/50">
          {booking.messages.length === 0 ? (
            <div className="text-center text-gray-400 dark:text-gray-500 py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>{t('start_conversation')}</p>
            </div>
          ) : (
            booking.messages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    isMe 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-bl-none shadow-sm'
                  }`}>
                    <p>{msg.text}</p>
                    <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-gray-400 dark:text-gray-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="..."
              className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmLabel,
  cancelLabel,
  isDestructive = false
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-scale-in border dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
        <div className="flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {cancelLabel || t('cancel')}
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }} 
            className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors ${
              isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {confirmLabel || t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  onWithdraw: (amount: number, method: string) => void;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ isOpen, onClose, availableBalance, onWithdraw }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Bank Transfer');
  const [isProcessing, setIsProcessing] = useState(false);
  const { t } = useLanguage();
  const { currency, formatPrice, convertPrice } = useCurrency();

  // Calculate available balance in selected currency for display/input max
  const displayAvailableBalance = convertPrice(availableBalance);
  
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmountDisplay = parseFloat(amount);
    
    // Check amount against display balance
    if (withdrawAmountDisplay > 0 && withdrawAmountDisplay <= displayAvailableBalance) {
      setIsProcessing(true);
      // Convert back to EUR if necessary before sending to backend logic
      const withdrawAmountEur = currency === 'ALL' ? withdrawAmountDisplay / 100 : withdrawAmountDisplay;

      setTimeout(() => {
        onWithdraw(withdrawAmountEur, method);
        setIsProcessing(false);
        setAmount('');
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6 animate-scale-in border dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Wallet className="text-indigo-600 dark:text-indigo-400" size={24} />
            {t('withdraw_funds')}
          </h3>
          <button onClick={onClose} disabled={isProcessing} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800">
          <p className="text-sm text-indigo-600 dark:text-indigo-300 mb-1">{t('available_withdraw')}</p>
          <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">{formatPrice(availableBalance)}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('amount')} ({currency})</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                {currency === 'EUR' ? '€' : 'L'}
              </span>
              <input
                required
                type="number"
                min="1"
                max={displayAvailableBalance}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">Max: {displayAvailableBalance.toFixed(2)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('method')}</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Bank Transfer">{t('bank_transfer')} (2-3 days)</option>
              <option value="PayPal">{t('paypal')} (Instant)</option>
              <option value="Stripe Instant">{t('stripe_instant')} (1% fee)</option>
              <option value="Cash Pickup">{t('cash_pickup')} (Local Agent)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > displayAvailableBalance || isProcessing}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? t('processing') : (
              <>
                {t('confirm')} <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

interface VerificationModalProps {
  isOpen: boolean;
  email: string;
  onVerify: (code: string) => void;
  onResend: () => void;
  onClose: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, email, onVerify, onResend, onClose }) => {
  const [code, setCode] = useState('');
  const [isResending, setIsResending] = useState(false);
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(code);
  };

  const handleResend = () => {
    setIsResending(true);
    onResend();
    setTimeout(() => setIsResending(false), 2000); 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-sm shadow-2xl p-8 animate-scale-in text-center border dark:border-gray-700">
        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('verify_email')}</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
          {t('verify_code_sent')} <span className="font-semibold text-gray-800 dark:text-gray-200">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-full text-center text-3xl tracking-[0.5em] font-bold py-3 border-b-2 border-gray-300 dark:border-gray-600 focus:border-indigo-600 focus:outline-none bg-transparent placeholder-gray-200 dark:placeholder-gray-600 text-gray-900 dark:text-white"
            autoFocus
          />

          <button
            type="submit"
            disabled={code.length !== 6}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t('verify_button')}
          </button>
        </form>

        <div className="mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <button 
              onClick={handleResend}
              disabled={isResending}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 disabled:opacity-50"
            >
              {isResending ? '...' : t('resend_code')}
            </button>
          </p>
        </div>
        
        <button onClick={onClose} className="mt-4 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          {t('cancel')}
        </button>
      </div>
    </div>
  );
};

// Fixed duplicate export on line 1294
export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export const ToastContainer: React.FC<{ toasts: ToastMessage[]; removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3">
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className="bg-white dark:bg-gray-800 border-l-4 border-indigo-600 shadow-xl rounded-r-lg p-4 flex items-start gap-3 min-w-[320px] max-w-[400px] animate-slide-in-right ring-1 ring-black/5 dark:ring-white/10"
        >
           <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-full shrink-0">
             <Mail size={16} className="text-indigo-600 dark:text-indigo-300" />
           </div>
           <div className="flex-1 min-w-0">
             <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{toast.title}</h4>
             <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{toast.message}</p>
           </div>
           <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0">
             <X size={16} />
           </button>
        </div>
      ))}
    </div>
  )
}

export const SupportChatWidget: React.FC<{ user: UserType, onMessageSent?: () => void }> = ({ user, onMessageSent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 's1', senderId: 'support', senderName: 'Support Bot', text: 'Hi there! How can we help you today?', timestamp: new Date().toISOString() }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if(!inputText.trim()) return;

    const userMsg: Message = { 
        id: Date.now().toString(), 
        senderId: user.id, 
        senderName: user.name, 
        text: inputText, 
        timestamp: new Date().toISOString() 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    if (onMessageSent) onMessageSent();

    setTimeout(() => {
        setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            senderId: 'support',
            senderName: 'Support Bot',
            text: 'Thanks for your message. Our team is currently offline in this demo, but we recorded your query!',
            timestamp: new Date().toISOString()
        }]);
    }, 1000);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
       {isOpen && (
         <div className="mb-4 w-80 h-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-scale-in origin-bottom-right">
            <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                    <Headphones size={20} />
                    <span className="font-bold">Support</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:bg-indigo-700 p-1 rounded transition-colors">
                    <X size={16} />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.senderId === user.id ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-bl-none shadow-sm'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                    <input 
                        className="flex-1 text-sm border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 focus:outline-none focus:border-indigo-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                        placeholder="..."
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                    />
                    <button type="submit" className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors">
                        <Send size={16} />
                    </button>
                </div>
            </form>
         </div>
       )}
       <button 
         onClick={() => setIsOpen(!isOpen)}
         className="w-14 h-14 bg-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-indigo-700 transition-transform hover:scale-105"
       >
         {isOpen ? <X size={24} /> : <MessageCircleQuestion size={28} />}
       </button>
    </div>
  );
}

export const ContentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string | { question: string; answer: string }[];
}> = ({ isOpen, onClose, title, content }) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl p-8 animate-scale-in max-h-[85vh] overflow-y-auto border dark:border-gray-700">
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="prose max-w-none text-gray-700 dark:text-gray-300">
          {Array.isArray(content) ? (
            <div className="space-y-6">
              {content.map((item, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-start gap-2">
                    <HelpCircle size={20} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    {t(item.question)}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed ml-7">{t(item.answer)}</p>
                </div>
              ))}
            </div>
          ) : (
             <div className="whitespace-pre-wrap length-relaxed bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl border border-gray-100 dark:border-gray-700 text-sm">
                {t(content as string)}
             </div>
          )}
        </div>
        
        <div className="mt-8 text-right">
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              {t('close')}
            </button>
        </div>
      </div>
    </div>
  );
};

export const Footer: React.FC<{ content: PlatformContent }> = ({ content }) => {
  const [activeModal, setActiveModal] = useState<'faq' | 'about' | 'terms' | 'privacy' | null>(null);
  const { t } = useLanguage();

  const getModalTitle = () => {
    switch (activeModal) {
      case 'faq': return t('footer_faq');
      case 'about': return t('footer_about');
      case 'terms': return t('footer_terms');
      case 'privacy': return t('footer_privacy');
      default: return '';
    }
  };

  const getModalContent = () => {
    switch (activeModal) {
      case 'faq': return content.faq;
      case 'about': return content.aboutUs;
      case 'terms': return content.termsAndConditions;
      case 'privacy': return content.privacyPolicy;
      default: return '';
    }
  };

  return (
    <>
      <footer className="bg-gray-900 dark:bg-black text-white pt-12 pb-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <Hammer className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">HomeHero</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Connecting you with trusted professionals.
              </p>
              <div className="flex gap-4">
                {content.socialMedia.facebook && (
                  <a href={content.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <Facebook size={20} />
                  </a>
                )}
                {content.socialMedia.instagram && (
                  <a href={content.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <Instagram size={20} />
                  </a>
                )}
                {content.socialMedia.twitter && (
                  <a href={content.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <Twitter size={20} />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => setActiveModal('about')} className="hover:text-white transition-colors">{t('footer_about')}</button></li>
                <li><button onClick={() => setActiveModal('terms')} className="hover:text-white transition-colors">{t('footer_terms')}</button></li>
                <li><button onClick={() => setActiveModal('privacy')} className="hover:text-white transition-colors">{t('footer_privacy')}</button></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-lg mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => setActiveModal('faq')} className="hover:text-white transition-colors">{t('footer_faq')}</button></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-lg mb-4">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-3">
                  <Phone size={16} className="mt-0.5 text-indigo-400" />
                  <span>{content.contact.phone}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Mail size={16} className="mt-0.5 text-indigo-400" />
                  <span>{content.contact.email}</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="mt-0.5 text-indigo-400" />
                  <span>{content.contact.address}</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} HomeHero Inc.
          </div>
        </div>
      </footer>

      <ContentModal 
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        title={getModalTitle()}
        content={getModalContent()}
      />
    </>
  );
};

export const StatCard: React.FC<{ label: string; value: string | number; icon: any; color: string }> = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex items-center">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

export const Badge: React.FC<{ status: string }> = ({ status }) => {
  const { t } = useLanguage();
  const styles: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    OFFER_MADE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    ACCEPTED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    IN_PROGRESS: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${styles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
      {t(status)}
    </span>
  );
};
