/**
 * Types สำหรับ API Responses
 * ตรงกับ structure ที่ backend ส่งกลับมา
 */

// ============================
// User & Profile Types
// ============================
export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  status: string;
  propertyId: string;
  property: {
    id: string;
    name: string;
  };
  desiredRoomTypeId?: string;
  desiredRoomType?: {
    id: string;
    name: string;
    basePrice: number;
  };
  createdAt: string;
  updatedAt: string;
}

export enum TenantStatus {
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
  INACTIVE = "INACTIVE",
}

// ============================
// Room Types
// ============================
export interface RoomType {
  id: string;
  name: string;
  basePrice: number;
  deposit: number;
}

export interface Room {
  id: string;
  roomNumber: string;
  status: RoomStatus;
  imageUrl?: string;
  roomType: RoomType;
  property: {
    id: string;
    name: string;
    imageUrl?: string;
  };
  activeContract?: {
    id: string;
    startDate: string;
    endDate: string;
    rentAmount: number;
  };
  currentInvoice?: {
    id: string;
    status: InvoiceStatus;
    totalAmount: number;
    dueDate: string;
  };
}

export enum RoomStatus {
  AVAILABLE = "AVAILABLE",
  OCCUPIED = "OCCUPIED",
  RESERVED = "RESERVED",
  MAINTENANCE = "MAINTENANCE",
  CLEANING = "CLEANING",
}

// ============================
// Contract Types
// ============================
export interface Contract {
  id: string;
  roomId: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  depositAmount?: number;
  status: ContractStatus;
  room: {
    roomNumber: string;
  };
  property: {
    name: string;
  };
  contractFile?: string; // URL to PDF
  contractImages?: string[]; // URLs to images
}

export enum ContractStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  NOTICE_GIVEN = "NOTICE_GIVEN",
  EXPIRED = "EXPIRED",
  TERMINATED = "TERMINATED",
}

// ============================
// Invoice Types
// ============================
export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
  type?: string; // "RENT", "WATER", "ELECTRICITY", "SERVICE", "LATE_FEE"
}

export interface MeterReading {
  id: string;
  type: "WATER" | "ELECTRICITY";
  previousReading: number;
  currentReading: number;
  units: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  period: string;
  totalAmount: number;
  dueDate: string;
  status: InvoiceStatus;
  contractId: string;
  propertyId: string;
  items: InvoiceItem[];
  meterReadings?: MeterReading[];
  contract: {
    room: {
      roomNumber: string;
    };
    property: {
      name: string;
    };
  };
  lateFeeAmount?: number;
  payments?: Payment[];
}

export enum InvoiceStatus {
  UNPAID = "UNPAID",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED",
}

// ============================
// Payment Types
// ============================
export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  status: PaymentStatus;
  slipUrl?: string;
  notes?: string;
  createdAt: string;
}

export enum PaymentStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

// ============================
// Notification Types
// ============================
export interface Notification {
  id: string;
  type: NotificationType;
  subtype: string;
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

export enum NotificationType {
  SYSTEM = "system",
  DORM = "dorm",
  ANNOUNCEMENT = "announcement",
  REPAIR = "repair",
}

// ============================
// Maintenance Types
// ============================
export interface MaintenanceRequest {
  id: string;
  roomId: string;
  description: string;
  status: MaintenanceStatus;
  priority?: string;
  images?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  room: {
    roomNumber: string;
  };
}

export enum MaintenanceStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// ============================
// Property Types
// ============================
export interface Property {
  id: string;
  name: string;
  address?: string;
  imageUrl?: string;
  contactInfo?: {
    phone?: string;
    lineOA?: string;
    email?: string;
    facebookPageId?: string;
  };
}

// ============================
// Dashboard Types
// ============================
export interface DashboardData {
  totalOutstanding: number; // ยอดค้างชำระรวม
  rooms: Room[];
  recentInvoices: Invoice[];
  notifications: Notification[];
}

// ============================
// API Response Types
// ============================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
