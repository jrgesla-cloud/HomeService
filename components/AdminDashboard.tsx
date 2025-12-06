

import React, { useState, useEffect } from 'react';
import { User, ServiceRequest, ServiceCategory, PlatformContent, Withdrawal, CategoryItem } from '../types';
import { Badge, StatCard, StarRating, useLanguage, useCurrency } from './Shared';
import { Users, Briefcase, Activity, TrendingUp, Plus, X, Search, MapPin, DollarSign, Mail, Save, Trash2, Edit2, Filter, Calendar, User as UserIcon, Clock, CheckCircle, XCircle, CreditCard, Receipt, FileText, ShieldCheck, Lock, Phone, Globe, HelpCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Props {
  users: User[];
  bookings: ServiceRequest[];
  currentView: string;
  onAddProvider: (provider: Omit<User, 'id' | 'rating' | 'jobsCompleted'>) => void;
  platformContent?: PlatformContent;
  onUpdateContent?: (content: PlatformContent) => void;
  onProcessWithdrawal?: (withdrawalId: string, action: 'APPROVE' | 'REJECT') => void;
  serviceCategories: CategoryItem[];
  onAddCategory: (category: Omit<CategoryItem, 'id'>) => void;
  onUpdateCategory?: (category: CategoryItem) => void;
  onDeleteCategory: (categoryId: string) => void;
}

const AddProviderModal: React.FC<{ isOpen: boolean, onClose: () => void, onSubmit: (d: any) => void, categories: CategoryItem[] }> = ({ isOpen, onClose, onSubmit, categories }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({ name: '', email: '', category: categories[0]?.name || 'cat_general', hourlyRate: 50, address: '', bio: '' });

    if (!isOpen) return null;
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit({ ...formData, role: 'PROVIDER' }); onClose(); };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 animate-scale-in border dark:border-gray-700">
                <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('add_provider')}</h3><button onClick={onClose} className="text-gray-500 dark:text-gray-400"><X size={20} /></button></div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input required placeholder={t('full_name')} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
                    <input required placeholder={t('email')} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg">{categories.map(c => <option key={c.id} value={c.name}>{t(c.name)}</option>)}</select>
                    <input required type="number" placeholder={`${t('rate_service')} (€)`} value={formData.hourlyRate} onChange={e => setFormData({...formData, hourlyRate: Number(e.target.value)})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
                    <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700">{t('submit')}</button>
                </form>
            </div>
        </div>
    );
}

const EditCategoryModal: React.FC<{ isOpen: boolean, onClose: () => void, category: CategoryItem | null, onSave: (c: CategoryItem) => void }> = ({ isOpen, onClose, category, onSave }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState<CategoryItem | null>(null);

    useEffect(() => { setFormData(category); }, [category]);

    if (!isOpen || !formData) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-scale-in border dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('edit_category')}</h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('name')}</label>
                        <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('icon')}</label>
                        <input required value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('base_price')} (€)</label>
                        <input required type="number" min="0" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: Number(e.target.value)})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
                    </div>
                    <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700">{t('save')}</button>
                </form>
            </div>
        </div>
    );
}

export const AdminDashboard: React.FC<Props> = ({ users, bookings, currentView, onAddProvider, platformContent, onUpdateContent, onProcessWithdrawal, serviceCategories, onAddCategory, onUpdateCategory, onDeleteCategory }) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [editedContent, setEditedContent] = useState<PlatformContent | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '🔧', basePrice: 50 });
  const [bookingFilter, setBookingFilter] = useState<ServiceRequest['status'] | 'ALL'>('ALL');
  
  // Category Editing
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  React.useEffect(() => { if (platformContent && !editedContent) setEditedContent(platformContent); }, [platformContent]);
  const handleSaveContent = () => { if (editedContent && onUpdateContent) onUpdateContent(editedContent); };

  if (currentView === 'content') {
      if (!editedContent) return null;

      const handleContactChange = (field: keyof PlatformContent['contact'], value: string) => {
          setEditedContent({ ...editedContent, contact: { ...editedContent.contact, [field]: value } });
      };

      const handleSocialChange = (field: keyof PlatformContent['socialMedia'], value: string) => {
          setEditedContent({ ...editedContent, socialMedia: { ...editedContent.socialMedia, [field]: value } });
      };

      const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
          const newFaq = [...editedContent.faq];
          newFaq[index] = { ...newFaq[index], [field]: value };
          setEditedContent({ ...editedContent, faq: newFaq });
      };

      const addFaq = () => {
          setEditedContent({ ...editedContent, faq: [...editedContent.faq, { question: '', answer: '' }] });
      };

      const removeFaq = (index: number) => {
          setEditedContent({ ...editedContent, faq: editedContent.faq.filter((_, i) => i !== index) });
      };

      return (
          <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('site_content')}</h2>
                  <button onClick={handleSaveContent} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                      <Save size={20} /> {t('save')}
                  </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* General Text Content */}
                  <div className="space-y-6">
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><FileText size={20}/> {t('footer_about')}</h3>
                          <textarea rows={4} value={editedContent.aboutUs} onChange={(e) => setEditedContent({...editedContent, aboutUs: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><ShieldCheck size={20}/> {t('footer_terms')}</h3>
                          <textarea rows={4} value={editedContent.termsAndConditions} onChange={(e) => setEditedContent({...editedContent, termsAndConditions: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Lock size={20}/> {t('footer_privacy')}</h3>
                          <textarea rows={4} value={editedContent.privacyPolicy} onChange={(e) => setEditedContent({...editedContent, privacyPolicy: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500" />
                      </div>
                  </div>

                  <div className="space-y-6">
                      {/* Contact Info */}
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Phone size={20}/> {t('contact_info')}</h3>
                          <div className="space-y-4">
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phone')}</label>
                                  <input type="text" value={editedContent.contact.phone} onChange={(e) => handleContactChange('phone', e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email')}</label>
                                  <input type="text" value={editedContent.contact.email} onChange={(e) => handleContactChange('email', e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('address')}</label>
                                  <input type="text" value={editedContent.contact.address} onChange={(e) => handleContactChange('address', e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
                              </div>
                          </div>
                      </div>

                       {/* Social Media */}
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Globe size={20}/> {t('social_media')}</h3>
                          <div className="space-y-4">
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Facebook</label>
                                  <input type="text" value={editedContent.socialMedia.facebook} onChange={(e) => handleSocialChange('facebook', e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instagram</label>
                                  <input type="text" value={editedContent.socialMedia.instagram} onChange={(e) => handleSocialChange('instagram', e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Twitter</label>
                                  <input type="text" value={editedContent.socialMedia.twitter} onChange={(e) => handleSocialChange('twitter', e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
                              </div>
                          </div>
                      </div>

                      {/* FAQ */}
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                          <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><HelpCircle size={20}/> {t('footer_faq')}</h3>
                              <button onClick={addFaq} className="text-sm px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50">{t('add_question')}</button>
                          </div>
                          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                              {editedContent.faq.map((faq, index) => (
                                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg relative group border border-gray-200 dark:border-gray-600">
                                      <button onClick={() => removeFaq(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Trash2 size={16} />
                                      </button>
                                      <input 
                                          placeholder="Question" 
                                          value={faq.question} 
                                          onChange={(e) => handleFaqChange(index, 'question', e.target.value)} 
                                          className="w-full mb-2 px-3 py-1.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-sm font-medium dark:text-white"
                                      />
                                      <textarea 
                                          placeholder="Answer" 
                                          rows={2} 
                                          value={faq.answer} 
                                          onChange={(e) => handleFaqChange(index, 'answer', e.target.value)} 
                                          className="w-full px-3 py-1.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-sm dark:text-gray-200"
                                      />
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  if (currentView === 'finance') {
    const allWithdrawals = users.flatMap(u => u.withdrawals || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const paidBookings = bookings.filter(b => b.paymentStatus === 'PAID').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const totalPlatformRevenue = paidBookings.reduce((acc, b) => acc + (b.price * 0.15), 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nav_finance')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp size={24} className="text-white" />
                        <h3 className="text-lg font-semibold text-emerald-100">{t('revenue_commissions')}</h3>
                    </div>
                    <p className="text-4xl font-bold">{formatPrice(totalPlatformRevenue)}</p>
                 </div>
                 <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                     <div className="flex items-center gap-3 mb-2">
                        <Receipt size={24} className="text-indigo-500" />
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">{t('transactions')}</h3>
                     </div>
                     <p className="text-4xl font-bold text-gray-900 dark:text-white">{paidBookings.length}</p>
                 </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Transaction Log */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[500px]">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <CreditCard size={18} className="text-green-500" /> {t('transactions')}
                        </h3>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4">{t('paid_by')}</th>
                                    <th className="px-6 py-4">{t('total_amount')}</th>
                                    <th className="px-6 py-4">{t('commission')} (15%)</th>
                                    <th className="px-6 py-4">{t('net_amount')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {paidBookings.map(b => (
                                    <tr key={b.id} className="dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">{b.customerName}</div>
                                            <div className="text-xs text-gray-500">to {b.providerName}</div>
                                            <div className="text-xs text-gray-400 mt-0.5">{new Date(b.date).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{formatPrice(b.price)}</td>
                                        <td className="px-6 py-4 text-emerald-600 font-medium">+{formatPrice(b.price * 0.15)}</td>
                                        <td className="px-6 py-4 text-indigo-600">{formatPrice(b.price * 0.85)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Withdrawal Requests */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[500px]">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('withdrawal_requests')}</h3>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4">Provider</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {allWithdrawals.map(w => (
                                    <tr key={w.id} className="dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{w.providerName}</div>
                                            <div className="text-xs text-gray-500">{new Date(w.date).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold">{formatPrice(w.amount)}</td>
                                        <td className="px-6 py-4"><Badge status={w.status} /></td>
                                        <td className="px-6 py-4">
                                            {w.status === 'PENDING' && onProcessWithdrawal && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => onProcessWithdrawal(w.id, 'APPROVE')} className="p-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50"><CheckCircle size={16}/></button>
                                                    <button onClick={() => onProcessWithdrawal(w.id, 'REJECT')} className="p-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50"><XCircle size={16}/></button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  if (currentView === 'bookings') {
    const filteredBookings = bookings.filter(b => bookingFilter === 'ALL' || b.status === bookingFilter);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nav_bookings')}</h2>
                <div className="flex gap-2">
                    <select 
                        value={bookingFilter}
                        onChange={(e) => setBookingFilter(e.target.value as any)}
                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="ALL">{t('all_statuses')}</option>
                        <option value="PENDING">{t('PENDING')}</option>
                        <option value="OFFER_MADE">{t('OFFER_MADE')}</option>
                        <option value="ACCEPTED">{t('ACCEPTED')}</option>
                        <option value="COMPLETED">{t('COMPLETED')}</option>
                        <option value="CANCELLED">{t('CANCELLED')}</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                            <tr>
                                <th className="px-6 py-4">{t('job_info')}</th>
                                <th className="px-6 py-4">{t('participants')}</th>
                                <th className="px-6 py-4">{t('status')}</th>
                                <th className="px-6 py-4">{t('offer_price')}</th>
                                <th className="px-6 py-4 text-emerald-600">{t('est_comm')} (15%)</th>
                                <th className="px-6 py-4">{t('payment_header')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredBookings.map(b => (
                                <tr key={b.id} className="dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 max-w-xs">
                                        <div className="font-bold text-gray-900 dark:text-white truncate">{t(b.category)}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{b.description}</div>
                                        <div className="text-xs text-gray-400 mt-1">{new Date(b.date).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 w-fit">{t('customer_label')}: {b.customerName}</span>
                                            {b.providerName ? (
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 w-fit">{t('provider_label')}: {b.providerName}</span>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">{t('no_provider')}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><Badge status={b.status} /></td>
                                    <td className="px-6 py-4 font-medium">
                                        {b.price > 0 ? formatPrice(b.price) : <span className="text-gray-400">-</span>}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-emerald-600">
                                        {b.price > 0 ? formatPrice(b.price * 0.15) : <span className="text-gray-400">-</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        {b.paymentStatus === 'PAID' ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded">
                                                <CheckCircle size={12}/> {t('PAID')} ({b.paymentMethod})
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400">{t('UNPAID')}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredBookings.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        {t('no_bookings')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
  }

  if (currentView === 'services') {
      return (
          <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('service_management')}</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-fit">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('add_category')}</h3>
                      <form onSubmit={(e) => { e.preventDefault(); onAddCategory(newCategory); }} className="space-y-4">
                          <input required placeholder="Name" value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
                          <input required type="number" placeholder="Price (€)" value={newCategory.basePrice} onChange={e => setNewCategory({...newCategory, basePrice: Number(e.target.value)})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
                          <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-lg">{t('submit')}</button>
                      </form>
                  </div>
                  <div className="lg:col-span-2">
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300"><tr><th className="px-6 py-4">{t('icon')}</th><th className="px-6 py-4">{t('name')}</th><th className="px-6 py-4">{t('base_price')}</th><th className="px-6 py-4"></th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-700">{serviceCategories.map(cat => (<tr key={cat.id} className="dark:text-gray-300"><td className="px-6 py-4">{cat.icon}</td><td className="px-6 py-4 font-bold">{t(cat.name)}</td><td className="px-6 py-4">{formatPrice(cat.basePrice)}</td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                             <button onClick={() => { setEditingCategory(cat); setShowEditCategoryModal(true); }} className="text-blue-500 hover:text-blue-700 p-1 bg-blue-50 dark:bg-blue-900/30 rounded"><Edit2 size={16} /></button>
                             <button onClick={() => onDeleteCategory(cat.id)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 dark:bg-red-900/30 rounded"><Trash2 size={16} /></button>
                        </td></tr>))}</tbody></table></div>
                      </div>
                  </div>
              </div>
              <EditCategoryModal isOpen={showEditCategoryModal} onClose={() => setShowEditCategoryModal(false)} category={editingCategory} onSave={(c) => { if(onUpdateCategory) onUpdateCategory(c); setShowEditCategoryModal(false); }} />
          </div>
      );
  }

  if (currentView === 'users') {
      return (
        <div className="space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('user_management')}</h2><button onClick={() => setShowAddProvider(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg"><Plus size={20} /> {t('add_provider')}</button></div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300"><tr><th className="px-6 py-4">{t('user')}</th><th className="px-6 py-4">{t('role')}</th><th className="px-6 py-4">{t('details')}</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-700">{users.map(user => (<tr key={user.id} className="dark:text-gray-300"><td className="px-6 py-4 font-medium">{user.name}<br/><span className="text-xs text-gray-500 dark:text-gray-400">{user.email}</span></td><td className="px-6 py-4"><span className="px-2 py-1 text-xs font-bold rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">{user.role}</span></td><td className="px-6 py-4">{t(user.category || '')}</td></tr>))}</tbody></table></div>
            </div>
            <AddProviderModal isOpen={showAddProvider} onClose={() => setShowAddProvider(false)} onSubmit={onAddProvider} categories={serviceCategories} />
        </div>
      );
  }

  if (currentView === 'dashboard') {
    return (
        <div className="space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard label={t('total_users')} value={users.length} icon={Users} color="bg-indigo-500" />
            <StatCard label={t('total_bookings')} value={bookings.length} icon={Briefcase} color="bg-blue-500" />
            <StatCard label={t('revenue')} value={formatPrice(bookings.filter(b => b.paymentStatus === 'PAID').reduce((acc, b) => acc + (b.price * 0.15), 0))} icon={TrendingUp} color="bg-green-500" />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700"><h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('recent_bookings')}</h3></div>
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300"><tr><th className="px-6 py-4">{t('customer_label')}</th><th className="px-6 py-4">{t('category_label')}</th><th className="px-6 py-4">{t('status')}</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-700">{bookings.slice(0, 5).map(b => (<tr key={b.id} className="dark:text-gray-300"><td className="px-6 py-4">{b.customerName}</td><td className="px-6 py-4">{t(b.category)}</td><td className="px-6 py-4"><Badge status={b.status} /></td></tr>))}</tbody></table></div>
        </div>
        </div>
    );
  }

  return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('view_not_found')}</h2>
      </div>
  );
};