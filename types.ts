
export type UserRole = 'CUSTOMER' | 'PROVIDER' | 'ADMIN';

export enum ServiceCategory {
  PLUMBING = 'Plumbing',
  ELECTRICAL = 'Electrical',
  CLEANING = 'Cleaning',
  HVAC = 'HVAC',
  LANDSCAPING = 'Landscaping',
  MOVING = 'Moving',
  GENERAL = 'General Repair'
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: string; // Store emoji for simplicity in this demo
  basePrice: number;
  description?: string;
}

export interface Availability {
  workingDays: string[]; // e.g. ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  startTime: string; // "09:00"
  endTime: string; // "17:00"
}

export interface Withdrawal {
  id: string;
  providerId: string;
  providerName: string;
  amount: number;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  method: string; // e.g. "Bank Transfer", "PayPal"
}

export interface AppNotification {
  id: string;
  titleKey: string; // Translation key for title
  messageKey: string; // Translation key for message
  params?: Record<string, string | number>; // Dynamic params for translation
  date: string;
  isRead: boolean;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  relatedId?: string; // ID of booking/transaction
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  phone?: string;
  isVerified?: boolean;
  notifications?: AppNotification[];
  // Provider specific
  rating?: number;
  jobsCompleted?: number;
  category?: string; // Changed from ServiceCategory to string
  hourlyRate?: number;
  bio?: string;
  address?: string;
  availability?: Availability;
  withdrawals?: Withdrawal[];
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export type PaymentStatus = 'UNPAID' | 'PAID';
export type PaymentMethod = 'CARD' | 'CASH';

export interface ServiceRequest {
  id: string;
  customerId: string;
  customerName: string;
  providerId?: string; // Null if not yet assigned/picked
  providerName?: string;
  category: string; // Changed from ServiceCategory to string
  description: string;
  status: 'PENDING' | 'OFFER_MADE' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  date: string;
  price: number;
  address: string;
  messages: Message[];
  rating?: number;
  review?: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
}

export interface AIAnalysisResult {
  category: ServiceCategory; // Keep enum for AI strictness, can map to string later
  reasoning: string;
  estimatedPriceRange: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface PlatformContent {
  faq: FAQItem[];
  aboutUs: string;
  termsAndConditions: string;
  privacyPolicy: string;
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  socialMedia: {
    instagram: string;
    facebook: string;
    twitter: string;
  };
}
