

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
  feeRequests?: FeeRequest[]; // New field for tracking cash job fees
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

// Fixed: Added minPrice and maxPrice to match usage in biddings across the app
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
  providerId?: string; // Assigned provider after acceptance
  providerName?: string;
  category: string; 
  description: string;
  status: 'PENDING' | 'OFFER_MADE' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  date: string;
  price: number; // Final price
  address: string;
  coordinates?: { lat: number; lng: number };
  messages: Message[];
  offers?: ServiceOffer[]; // Support for multiple biddings
  rating?: number;
  review?: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  aiPriceRange?: string; // Added to store suggested range from Gemini
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
