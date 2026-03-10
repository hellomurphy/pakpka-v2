/**
 * Shared API / DTO types for client and admin.
 * Only exports API-specific types (interfaces + enums that are not in schema).
 * All schema enums (ContractStatus, InvoiceStatus, RoomStatus, etc.) are used
 * via import from schema and are exported only from schema → no duplicate exports.
 */

import type {
  RoomStatus,
  InvoiceStatus,
  PaymentStatus,
  MaintenanceStatus,
  ContractStatus,
} from './schema'

// ============================
// Tenant (API-only; schema has TenantStatus for DB)
// ============================
export const TenantStatusApi = {
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
  INACTIVE: 'INACTIVE',
} as const
export type TenantStatusApi = (typeof TenantStatusApi)[keyof typeof TenantStatusApi]

// ============================
// User & Profile Types
// ============================
export interface UserProfile {
  id: string
  name: string
  phone: string
  status: string
  propertyId: string
  property: {
    id: string
    name: string
  }
  desiredRoomTypeId?: string
  desiredRoomType?: {
    id: string
    name: string
    basePrice: number
  }
  createdAt: string
  updatedAt: string
}

// ============================
// Property (API)
// ============================
export interface PropertySummaryDto {
  id: string
  name: string
  address?: string
  imageUrl?: string
}

export interface Property {
  id: string
  name: string
  address?: string
  imageUrl?: string
  contactInfo?: {
    phone?: string
    lineOA?: string
    email?: string
    facebookPageId?: string
  }
}

// ============================
// Room Types
// ============================
export interface RoomType {
  id: string
  name: string
  basePrice: number
  deposit: number
}

export interface Room {
  id: string
  roomNumber: string
  status: RoomStatus
  imageUrl?: string
  roomType: RoomType
  property: {
    id: string
    name: string
    imageUrl?: string
  }
  activeContract?: {
    id: string
    startDate: string
    endDate: string
    rentAmount: number
  }
  currentInvoice?: {
    id: string
    status: InvoiceStatus
    totalAmount: number
    dueDate: string
  }
}

// ============================
// Contract Types
// ============================
export interface Contract {
  id: string
  roomId: string
  propertyId: string
  startDate: string
  endDate: string
  rentAmount: number
  depositAmount?: number
  status: ContractStatus
  room: {
    roomNumber: string
  }
  property: {
    name: string
  }
  contractFile?: string
  contractImages?: string[]
}

// ============================
// Invoice Types
// ============================
export interface InvoiceItem {
  id: string
  description: string
  amount: number
  type?: string
}

export interface MeterReading {
  id: string
  type: 'WATER' | 'ELECTRICITY'
  previousReading: number
  currentReading: number
  units: number
  rate: number
  amount: number
}

export interface Invoice {
  id: string
  period: string
  totalAmount: number
  dueDate: string
  status: InvoiceStatus
  contractId: string
  propertyId: string
  items: InvoiceItem[]
  meterReadings?: MeterReading[]
  contract: {
    room: {
      roomNumber: string
    }
    property: {
      name: string
    }
  }
  lateFeeAmount?: number
  payments?: Payment[]
}

// ============================
// Payment Types
// ============================
export interface Payment {
  id: string
  invoiceId: string
  amount: number
  paymentDate: string
  status: PaymentStatus
  slipUrl?: string
  notes?: string
  createdAt: string
}

// ============================
// Notification Types
// ============================
export const NotificationType = {
  SYSTEM: 'system',
  DORM: 'dorm',
  ANNOUNCEMENT: 'announcement',
  REPAIR: 'repair',
} as const
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]

export interface Notification {
  id: string
  type: NotificationType
  subtype: string
  title: string
  message: string
  relatedId?: string
  isRead: boolean
  createdAt: string
}

// ============================
// Maintenance Types
// ============================
export interface MaintenanceRequest {
  id: string
  roomId: string
  description: string
  status: MaintenanceStatus
  priority?: string
  images?: string[]
  notes?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  room: {
    roomNumber: string
  }
}

// ============================
// Dashboard Types
// ============================
export interface DashboardData {
  totalOutstanding: number
  rooms: Room[]
  recentInvoices: Invoice[]
  notifications: Notification[]
}

// ============================
// API Response Types
// ============================
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
