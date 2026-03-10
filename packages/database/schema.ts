import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  unique,
} from 'drizzle-orm/sqlite-core'

// ===================================
// ENUMS (TypeScript – SQLite uses text columns)
// ===================================

export const Role = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
} as const
export type Role = (typeof Role)[keyof typeof Role]

export const RoomStatus = {
  AVAILABLE: 'AVAILABLE',
  OCCUPIED: 'OCCUPIED',
  MAINTENANCE: 'MAINTENANCE',
  CLEANING: 'CLEANING',
  RESERVED: 'RESERVED',
} as const
export type RoomStatus = (typeof RoomStatus)[keyof typeof RoomStatus]

export const TenantStatus = {
  WAITING_LIST: 'WAITING_LIST',
  UPCOMING: 'UPCOMING',
  ACTIVE: 'ACTIVE',
  NOTICE_GIVEN: 'NOTICE_GIVEN',
  MOVED_OUT: 'MOVED_OUT',
} as const
export type TenantStatus = (typeof TenantStatus)[keyof typeof TenantStatus]

export const InvoiceStatus = {
  DRAFT: 'DRAFT',
  UNPAID: 'UNPAID',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED',
} as const
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus]

export const PaymentStatus = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  FAILED: 'FAILED',
} as const
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus]

export const SlipStatus = {
  NONE: 'NONE',
  UPLOADED: 'UPLOADED',
  VERIFYING: 'VERIFYING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const
export type SlipStatus = (typeof SlipStatus)[keyof typeof SlipStatus]

export const MaintenanceStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const
export type MaintenanceStatus = (typeof MaintenanceStatus)[keyof typeof MaintenanceStatus]

export const ReservationStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
} as const
export type ReservationStatus = (typeof ReservationStatus)[keyof typeof ReservationStatus]

export const BillingCycle = {
  ONETIME: 'ONETIME',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  YEARLY: 'YEARLY',
} as const
export type BillingCycle = (typeof BillingCycle)[keyof typeof BillingCycle]

export const ContractStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  NOTICE_GIVEN: 'NOTICE_GIVEN',
  EXPIRED: 'EXPIRED',
  TERMINATED: 'TERMINATED',
} as const
export type ContractStatus = (typeof ContractStatus)[keyof typeof ContractStatus]

export const PaymentMethod = {
  BANK_TRANSFER: 'BANK_TRANSFER',
  CASH: 'CASH',
  CREDIT_CARD: 'CREDIT_CARD',
  QR_PROMPTAY: 'QR_PROMPTAY',
} as const
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod]

export const UtilityType = {
  ELECTRICITY: 'ELECTRICITY',
  WATER: 'WATER',
} as const
export type UtilityType = (typeof UtilityType)[keyof typeof UtilityType]

export const Priority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const
export type Priority = (typeof Priority)[keyof typeof Priority]

export const ContractServiceStatus = {
  ACTIVE: 'ACTIVE',
  CANCELLED: 'CANCELLED',
} as const
export type ContractServiceStatus =
  (typeof ContractServiceStatus)[keyof typeof ContractServiceStatus]

export const RoomNameFormat = {
  ALPHA_NUMERIC: 'ALPHA_NUMERIC',
  NUMERIC: 'NUMERIC',
} as const
export type RoomNameFormat = (typeof RoomNameFormat)[keyof typeof RoomNameFormat]

export const LateFeeType = {
  FIXED: 'FIXED',
  PERCENTAGE: 'PERCENTAGE',
} as const
export type LateFeeType = (typeof LateFeeType)[keyof typeof LateFeeType]

export const BillingType = {
  PER_UNIT: 'PER_UNIT',
  FLAT_RATE: 'FLAT_RATE',
} as const
export type BillingType = (typeof BillingType)[keyof typeof BillingType]

export const DepositClearanceStatus = {
  PENDING_ROOM_CHECK: 'PENDING_ROOM_CHECK',
  PENDING_SETTLEMENT: 'PENDING_SETTLEMENT',
  REFUNDED: 'REFUNDED',
} as const
export type DepositClearanceStatus =
  (typeof DepositClearanceStatus)[keyof typeof DepositClearanceStatus]

export const BillingRunStatus = {
  PENDING_METER_READING: 'PENDING_METER_READING',
  PENDING_REVIEW: 'PENDING_REVIEW',
  SENDING: 'SENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const
export type BillingRunStatus = (typeof BillingRunStatus)[keyof typeof BillingRunStatus]

export const InvitationStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  EXPIRED: 'EXPIRED',
} as const
export type InvitationStatus = (typeof InvitationStatus)[keyof typeof InvitationStatus]

// Decimal stored as text for precision (SQLite)
const decimal = () => text()

// ===================================
// CORE – Auth & User
// ===================================

export const account = sqliteTable(
  'account',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refreshToken: text('refresh_token'),
    accessToken: text('access_token'),
    expiresAt: integer('expires_at'),
    tokenType: text('token_type'),
    scope: text('scope'),
    idToken: text('id_token'),
    sessionState: text('session_state'),
  },
  (t) => [unique('account_provider_provider_account_id').on(t.provider, t.providerAccountId)],
)

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  sessionToken: text('session_token').notNull().unique(),
  userId: text('user_id').notNull(),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
})

export const verificationToken = sqliteTable(
  'verification_token',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull().unique(),
    expires: integer('expires', { mode: 'timestamp' }).notNull(),
  },
  (t) => [unique('verification_token_identifier_token').on(t.identifier, t.token)],
)

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  username: text('username').unique(),
  email: text('email').unique(),
  avatarUrl: text('avatar_url'),
  image: text('image'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
})

// ===================================
// Property & Structure
// ===================================

export const property = sqliteTable('property', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  roomNamingFormat: text('room_naming_format').default(RoomNameFormat.ALPHA_NUMERIC),
  roomTurnoverDays: integer('room_turnover_days').default(3),
  contractEndingSoonDays: integer('contract_ending_soon_days').default(60),
  defaultWaterBillingType: text('default_water_billing_type').default(BillingType.FLAT_RATE),
  defaultWaterRate: decimal().default('150'),
  defaultWaterMinimumCharge: decimal().default('100'),
  defaultElectricityBillingType: text('default_electricity_billing_type').default(
    BillingType.PER_UNIT,
  ),
  defaultElectricityRate: decimal().default('8'),
  defaultElectricityMinimumCharge: decimal().default('0'),
  defaultBillingCutoffDay: integer('default_billing_cutoff_day').default(28),
  defaultPaymentDueDays: integer('default_payment_due_days').default(7),
  lateFeeEnabled: integer('late_fee_enabled', { mode: 'boolean' }).default(true),
  lateFeeType: text('late_fee_type').default(LateFeeType.FIXED),
  lateFeeValue: decimal().default('100'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const propertyStaff = sqliteTable(
  'property_staff',
  {
    userId: text('user_id').notNull(),
    propertyId: text('property_id').notNull(),
    role: text('role').default(Role.STAFF),
  },
  (t) => [primaryKey({ columns: [t.userId, t.propertyId] })],
)

export const floor = sqliteTable(
  'floor',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    floorNumber: integer('floor_number').notNull(),
    propertyId: text('property_id').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [unique('floor_property_id_floor_number').on(t.propertyId, t.floorNumber)],
)

export const amenity = sqliteTable('amenity', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const roomType = sqliteTable(
  'room_type',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    basePrice: decimal().notNull(),
    deposit: decimal().notNull(),
    propertyId: text('property_id').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [index('room_type_property_id').on(t.propertyId)],
)

export const roomTypeAmenity = sqliteTable(
  'room_type_amenity',
  {
    roomTypeId: text('room_type_id').notNull(),
    amenityId: text('amenity_id').notNull(),
  },
  (t) => [primaryKey({ columns: [t.roomTypeId, t.amenityId] })],
)

export const room = sqliteTable(
  'room',
  {
    id: text('id').primaryKey(),
    roomNumber: text('room_number').notNull(),
    status: text('status').default(RoomStatus.AVAILABLE),
    roomTypeId: text('room_type_id').notNull(),
    propertyId: text('property_id').notNull(),
    floorId: text('floor_id').default(''),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    unique('room_property_id_room_number').on(t.propertyId, t.roomNumber),
    index('room_room_type_id').on(t.roomTypeId),
    index('room_floor_id').on(t.floorId),
    index('room_property_id_status').on(t.propertyId, t.status),
  ],
)

export const roomStatusHistory = sqliteTable(
  'room_status_history',
  {
    id: text('id').primaryKey(),
    roomId: text('room_id').notNull(),
    status: text('status').notNull(),
    startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
    endDate: integer('end_date', { mode: 'timestamp' }),
    notes: text('notes'),
  },
  (t) => [index('room_status_history_room_id').on(t.roomId)],
)

export const tenant = sqliteTable(
  'tenant',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    phone: text('phone'),
    status: text('status').default(TenantStatus.WAITING_LIST),
    propertyId: text('property_id').notNull(),
    userId: text('user_id').unique(),
    desiredRoomTypeId: text('desired_room_type_id'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index('tenant_desired_room_type_id').on(t.desiredRoomTypeId),
    index('tenant_property_id').on(t.propertyId),
    index('tenant_property_id_status').on(t.propertyId, t.status),
  ],
)

// ===================================
// Contract & Billing
// ===================================

export const contract = sqliteTable(
  'contract',
  {
    id: text('id').primaryKey(),
    startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
    endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
    status: text('status').default(ContractStatus.ACTIVE),
    waterBillingType: text('water_billing_type').notNull(),
    waterRate: decimal().notNull(),
    waterMinimumCharge: decimal().notNull(),
    electricityBillingType: text('electricity_billing_type').notNull(),
    electricityRate: decimal().notNull(),
    electricityMinimumCharge: decimal().notNull(),
    rentAmount: decimal().notNull(),
    roomId: text('room_id').notNull(),
    propertyId: text('property_id').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index('contract_room_id').on(t.roomId),
    index('contract_property_id').on(t.propertyId),
    index('contract_property_id_status').on(t.propertyId, t.status),
    index('contract_property_id_end_date').on(t.propertyId, t.endDate),
    index('contract_property_id_status_end_date').on(t.propertyId, t.status, t.endDate),
  ],
)

export const contractTenant = sqliteTable(
  'contract_tenant',
  {
    contractId: text('contract_id').notNull(),
    tenantId: text('tenant_id').notNull(),
    isPrimary: integer('is_primary', { mode: 'boolean' }).default(false),
  },
  (t) => [
    primaryKey({ columns: [t.contractId, t.tenantId] }),
    index('contract_tenant_tenant_id').on(t.tenantId),
    index('contract_tenant_contract_id_is_primary').on(t.contractId, t.isPrimary),
  ],
)

export const contractTermination = sqliteTable('contract_termination', {
  id: text('id').primaryKey(),
  contractId: text('contract_id').notNull().unique(),
  reason: text('reason').notNull(),
  terminatedDate: integer('terminated_date', { mode: 'timestamp' }).notNull(),
  notes: text('notes'),
})

export const service = sqliteTable(
  'service',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    defaultPrice: decimal().notNull(),
    billingCycle: text('billing_cycle').notNull(),
    propertyId: text('property_id').notNull(),
    isOptional: integer('is_optional', { mode: 'boolean' }).default(true),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    unique('service_property_id_name').on(t.propertyId, t.name),
    index('service_property_id').on(t.propertyId),
  ],
)

export const contractService = sqliteTable(
  'contract_service',
  {
    id: text('id').primaryKey(),
    startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
    endDate: integer('end_date', { mode: 'timestamp' }),
    status: text('status').default(ContractServiceStatus.ACTIVE),
    customPrice: decimal(),
    contractId: text('contract_id').notNull(),
    serviceId: text('service_id').notNull(),
  },
  (t) => [
    index('contract_service_contract_id').on(t.contractId),
    index('contract_service_service_id').on(t.serviceId),
  ],
)

export const billingRun = sqliteTable(
  'billing_run',
  {
    id: text('id').primaryKey(),
    period: text('period').notNull(),
    status: text('status').default(BillingRunStatus.PENDING_METER_READING),
    propertyId: text('property_id').notNull(),
    totalContracts: integer('total_contracts').notNull(),
    meterReadingRequired: integer('meter_reading_required').notNull(),
    executedById: text('executed_by_id').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    unique('billing_run_property_id_period').on(t.propertyId, t.period),
    index('billing_run_property_id').on(t.propertyId),
  ],
)

export const invoice = sqliteTable(
  'invoice',
  {
    id: text('id').primaryKey(),
    propertyId: text('property_id').notNull(),
    period: text('period').notNull(),
    totalAmount: decimal().notNull(),
    dueDate: integer('due_date', { mode: 'timestamp' }).notNull(),
    status: text('status').default(InvoiceStatus.DRAFT),
    contractId: text('contract_id').notNull(),
    billingRunId: text('billing_run_id'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index('invoice_property_id').on(t.propertyId),
    index('invoice_billing_run_id').on(t.billingRunId),
    index('invoice_contract_id').on(t.contractId),
  ],
)

export const invoiceItem = sqliteTable(
  'invoice_item',
  {
    id: text('id').primaryKey(),
    description: text('description').notNull(),
    amount: decimal().notNull(),
    invoiceId: text('invoice_id').notNull(),
  },
  (t) => [index('invoice_item_invoice_id').on(t.invoiceId)],
)

export const receivingAccount = sqliteTable(
  'receiving_account',
  {
    id: text('id').primaryKey(),
    type: text('type').notNull(),
    details: text('details', { mode: 'json' }).notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    propertyId: text('property_id').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [index('receiving_account_property_id').on(t.propertyId)],
)

export const payment = sqliteTable(
  'payment',
  {
    id: text('id').primaryKey(),
    amount: decimal().notNull(),
    paymentDate: integer('payment_date', { mode: 'timestamp' }).notNull(),
    status: text('status').default(PaymentStatus.PENDING),
    notes: text('notes'),
    invoiceId: text('invoice_id').notNull(),
    paymentMethod: text('payment_method').notNull(),
    receivingAccountId: text('receiving_account_id'),
    slipUrl: text('slip_url'),
    slipKey: text('slip_key'),
    slipStatus: text('slip_status').default(SlipStatus.NONE),
    verifiedByUserId: text('verified_by_user_id'),
    gatewayProvider: text('gateway_provider'),
    gatewayTransactionId: text('gateway_transaction_id').unique(),
    gatewayResponse: text('gateway_response', { mode: 'json' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index('payment_invoice_id').on(t.invoiceId),
    index('payment_gateway_transaction_id').on(t.gatewayTransactionId),
  ],
)

export const deposit = sqliteTable('deposit', {
  id: text('id').primaryKey(),
  amount: decimal().notNull(),
  receivedDate: integer('received_date', { mode: 'timestamp' }).notNull(),
  refundedDate: integer('refunded_date', { mode: 'timestamp' }),
  deductions: decimal().default('0'),
  deductionNotes: text('deduction_notes'),
  contractId: text('contract_id').notNull().unique(),
  clearanceStatus: text('clearance_status').default(DepositClearanceStatus.PENDING_ROOM_CHECK),
})

export const meterReading = sqliteTable(
  'meter_reading',
  {
    id: text('id').primaryKey(),
    utilityType: text('utility_type').notNull(),
    readingValue: decimal().notNull(),
    readingDate: integer('reading_date', { mode: 'timestamp' }).notNull(),
    invoiceId: text('invoice_id').notNull(),
  },
  (t) => [
    unique('meter_reading_invoice_id_utility_type').on(t.invoiceId, t.utilityType),
    index('meter_reading_invoice_id').on(t.invoiceId),
  ],
)

export const meterReadingPhoto = sqliteTable(
  'meter_reading_photo',
  {
    id: text('id').primaryKey(),
    imageUrl: text('image_url').notNull(),
    aiDetectedValue: real('ai_detected_value'),
    isVerifiedByAdmin: integer('is_verified_by_admin', { mode: 'boolean' }).default(false),
    meterReadingId: text('meter_reading_id').notNull(),
  },
  (t) => [index('meter_reading_photo_meter_reading_id').on(t.meterReadingId)],
)

export const maintenanceRequest = sqliteTable(
  'maintenance_request',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status').default(MaintenanceStatus.PENDING),
    priority: text('priority'),
    dueDate: integer('due_date', { mode: 'timestamp' }),
    roomId: text('room_id').notNull(),
    reportedByContractId: text('reported_by_contract_id').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index('maintenance_request_room_id').on(t.roomId),
    index('maintenance_request_reported_by_contract_id').on(t.reportedByContractId),
  ],
)

export const reservation = sqliteTable(
  'reservation',
  {
    id: text('id').primaryKey(),
    startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
    endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
    status: text('status').default(ReservationStatus.PENDING),
    propertyId: text('property_id').notNull(),
    roomId: text('room_id').notNull(),
    tenantId: text('tenant_id').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index('reservation_property_id').on(t.propertyId),
    index('reservation_room_id').on(t.roomId),
    index('reservation_tenant_id').on(t.tenantId),
    index('reservation_room_id_status').on(t.roomId, t.status),
  ],
)

export const invitation = sqliteTable(
  'invitation',
  {
    id: text('id').primaryKey(),
    propertyId: text('property_id').notNull(),
    role: text('role').notNull(),
    status: text('status').default(InvitationStatus.PENDING),
    nameForReference: text('name_for_reference'),
    invitedById: text('invited_by_id').notNull(),
    acceptedByUserId: text('accepted_by_user_id'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    acceptedAt: integer('accepted_at', { mode: 'timestamp' }),
  },
  (t) => [
    index('invitation_property_id').on(t.propertyId),
    index('invitation_invited_by_id').on(t.invitedById),
    index('invitation_accepted_by_user_id').on(t.acceptedByUserId),
  ],
)
