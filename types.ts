
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
  icon: string; 
  basePrice: number;
  description?: string;
}

export interface Availability {
  workingDays: string[]; 
  startTime: string; 
  endTime: string; 
}

export interface Withdrawal {
  id: string;
  providerId: string;
  providerName: string;
  amount: number;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  method: string; 
}

export interface FeeRequest {
  id: string;
  providerId: string;
  bookingId: string;
  amount: number;
  date: string;
  status: 'PENDING' | 'PAID' | 'REQUESTED' | 'REJECTED' | 'VERIFYING';
  bookingCategory: string;
}

export interface AppNotification {
  id: string;
  titleKey: string; 
  messageKey: string; 
  params?: Record<string, string | number>; 
  date: string;
  isRead: boolean;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  relatedId?: string; 
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
  rating?: number;
  jobsCompleted?: number;
  category?: string; 
  hourlyRate?: number;
  bio?: string;
  address?: string;
  availability?: Availability;
  withdrawals?: Withdrawal[];
  feeRequests?: FeeRequest[]; 
  location?: { lat: number; lng: number };
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isRead: boolean; 
}

export interface ServiceOffer {
  id: string;
  providerId: string;
  providerName: string;
  providerRating?: number;
  providerAvatar?: string;
  minPrice: number;
  maxPrice: number;
  timestamp: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export type PaymentStatus = 'UNPAID' | 'PAID';
export type PaymentMethod = 'CARD' | 'CASH';

export interface ServiceRequest {
  id: string;
  customerId: string;
  customerName: string;
  providerId?: string; 
  providerName?: string;
  category: string; 
  description: string;
  status: 'PENDING' | 'OFFER_MADE' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  date: string; 
  scheduledDateTime: string; 
  price: number; 
  address: string;
  coordinates?: { lat: number; lng: number };
  messages: Message[];
  offers?: ServiceOffer[]; 
  rating?: number;
  review?: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  aiPriceRange?: string; 
  beforeImage?: string;
  afterImage?: string;
}

export interface AIAnalysisResult {
  category: ServiceCategory; 
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
