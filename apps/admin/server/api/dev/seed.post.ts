import dayjs from 'dayjs'
import { eq, and } from 'drizzle-orm'
import {
  Role,
  TenantStatus,
  RoomStatus,
  BillingType,
  ContractStatus,
  PaymentStatus,
  PaymentMethod,
  BillingRunStatus,
  InvoiceStatus,
  BillingCycle,
  MaintenanceStatus,
  Priority,
  ReservationStatus,
  DepositClearanceStatus,
  InvitationStatus,
  LateFeeType,
  RoomNameFormat,
  UtilityType
} from '@repo/db'
import { db, schema } from '@nuxthub/db'

export default defineEventHandler(async (event) => {
  console.log('🌱 [API] Starting comprehensive database seeding...')

  const config = useRuntimeConfig(event)
  if (config.public.appMode !== 'demo') {
    return errorResponse(
      event,
      createError({
        statusCode: 403,
        statusMessage: 'Seeding is only allowed in demo mode.'
      })
    )
  }

  try {
    await db.select({ id: schema.user.id }).from(schema.user).limit(1)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    const causeMsg = (err as { cause?: Error }).cause?.message ?? ''
    if (msg.includes('no such table') || causeMsg.includes('no such table')) {
      return errorResponse(
        event,
        createError({
          statusCode: 503,
          statusMessage: 'Database has no schema (wrong DB or migration not applied). From repo root run: pnpm --filter @repo/db run db:migrate:local. Ensure apps/admin/.env DATABASE_URL points to the same SQLite file as Drizzle Studio (see README).'
        })
      )
    }
    throw err
  }

  const cleanupTables = [
    schema.meterReadingPhoto,
    schema.meterReading,
    schema.invoiceItem,
    schema.payment,
    schema.deposit,
    schema.contractTermination,
    schema.maintenanceRequest,
    schema.roomStatusHistory,
    schema.reservation,
    schema.contractService,
    schema.contractTenant,
    schema.contract,
    schema.tenant,
    schema.room,
    schema.roomTypeAmenity,
    schema.roomType,
    schema.floor,
    schema.service,
    schema.invoice,
    schema.billingRun,
    schema.invitation,
    schema.propertyStaff,
    schema.receivingAccount,
    schema.property,
    schema.session,
    schema.account,
    schema.user,
    schema.amenity
  ] as const

  try {
    console.log('🧹 [API] Cleaning up old data...')
    for (const table of cleanupTables) {
      try {
        await db.delete(table)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        const causeMsg = (err as { cause?: Error }).cause?.message ?? ''
        const hasNoSuchTable = msg.includes('no such table') || causeMsg.includes('no such table')
        if (hasNoSuchTable) {
          console.warn('[API] Skip delete: table missing (run pnpm db:migrate:local if needed)')
        } else {
          throw err
        }
      }
    }

    console.log('🌱 [API] Starting to seed new data...')

    const usersData = [
      { id: 'user_owner_01', name: 'เจ้าของหอ (คุณอารี)', email: 'owner@pakpak.app', username: 'owner01', password: null },
      { id: 'user_admin_01', name: 'ผู้จัดการ (สมหญิง)', email: 'admin@pakpak.app', username: 'admin01', password: null },
      { id: 'user_staff_01', name: 'พนักงาน (จินดา)', email: 'staff1@pakpak.app', username: 'staff01', password: null },
      { id: 'user_staff_02', name: 'พนักงาน (สมศรี)', email: 'staff2@pakpak.app', username: 'staff02', password: null },
      { id: 'user_tenant_01', name: 'กิตติพงษ์ ชูชาติ', email: 'kittipong@example.com', username: 'kittipong', password: null },
      { id: 'user_tenant_02', name: 'วิภาดา สุขสันต์', email: 'wipada@example.com', username: 'wipada', password: null }
    ]
    await db.insert(schema.user).values(usersData)
    const owner = usersData[0]!
    const admin = usersData[1]!
    const staff1 = usersData[2]!
    const staff2 = usersData[3]!
    const tenantUser1 = usersData[4]!
    const tenantUser2 = usersData[5]!

    console.log('🏢 Creating properties...')
    const property1Id = 'prop_01'
    const property2Id = 'prop_02'
    await db.insert(schema.property).values([
      {
        id: property1Id,
        name: 'พักดีเพลส (มหาวิทยาลัยราชภัฏ)',
        roomNamingFormat: RoomNameFormat.NUMERIC,
        roomTurnoverDays: 3,
        contractEndingSoonDays: 60,
        defaultWaterBillingType: BillingType.PER_UNIT,
        defaultWaterRate: '20',
        defaultWaterMinimumCharge: '100',
        defaultElectricityBillingType: BillingType.PER_UNIT,
        defaultElectricityRate: '8',
        defaultElectricityMinimumCharge: '0',
        defaultBillingCutoffDay: 25,
        defaultPaymentDueDays: 5,
        lateFeeEnabled: true,
        lateFeeType: LateFeeType.FIXED,
        lateFeeValue: '100'
      },
      {
        id: property2Id,
        name: 'บ้านสบาย (เซ็นทรัลพลาซ่า)',
        roomNamingFormat: RoomNameFormat.ALPHA_NUMERIC,
        roomTurnoverDays: 5,
        contractEndingSoonDays: 30,
        defaultWaterBillingType: BillingType.FLAT_RATE,
        defaultWaterRate: '150',
        defaultWaterMinimumCharge: '150',
        defaultElectricityBillingType: BillingType.PER_UNIT,
        defaultElectricityRate: '7.5',
        defaultElectricityMinimumCharge: '50',
        defaultBillingCutoffDay: 28,
        defaultPaymentDueDays: 7,
        lateFeeEnabled: true,
        lateFeeType: LateFeeType.PERCENTAGE,
        lateFeeValue: '5'
      }
    ])
    await db.insert(schema.propertyStaff).values([
      { userId: owner.id, propertyId: property1Id, role: Role.OWNER },
      { userId: admin.id, propertyId: property1Id, role: Role.ADMIN },
      { userId: staff1.id, propertyId: property1Id, role: Role.STAFF },
      { userId: owner.id, propertyId: property2Id, role: Role.OWNER },
      { userId: staff2.id, propertyId: property2Id, role: Role.STAFF }
    ])
    const [property1] = await db.select().from(schema.property).where(eq(schema.property.id, property1Id)).limit(1)
    const [property2] = await db.select().from(schema.property).where(eq(schema.property.id, property2Id)).limit(1)
    if (!property1 || !property2) throw new Error('Property insert failed')

    console.log('✨ Creating amenities...')
    const amenityNames = [
      'เครื่องปรับอากาศ', 'เครื่องทำน้ำอุ่น', 'อินเทอร์เน็ต WiFi', 'ตู้เย็น',
      'เครื่องซักผ้าส่วนกลาง', 'ที่จอดรถ', 'ระบบรักษาความปลอดภัย 24 ชม.', 'ลิฟต์โดยสาร'
    ]
    const amenities = amenityNames.map((name, i) => ({ id: `amenity_${i + 1}`, name }))
    await db.insert(schema.amenity).values(amenities)

    console.log('🏗️  Creating floors and room types for Property 1...')
    const floors1Data = [
      { id: 'floor_p1_1', name: 'ชั้น 1', floorNumber: 1, propertyId: property1.id },
      { id: 'floor_p1_2', name: 'ชั้น 2', floorNumber: 2, propertyId: property1.id },
      { id: 'floor_p1_3', name: 'ชั้น 3', floorNumber: 3, propertyId: property1.id }
    ]
    await db.insert(schema.floor).values(floors1Data)
    const floors1 = floors1Data

    const roomTypes1Data = [
      { id: 'rt1_1', name: 'ห้องพัดลม', basePrice: '3000', deposit: '5000', propertyId: property1.id },
      { id: 'rt1_2', name: 'ห้องแอร์', basePrice: '4200', deposit: '6000', propertyId: property1.id },
      { id: 'rt1_3', name: 'ห้องแอร์ + น้ำอุ่น', basePrice: '4800', deposit: '7000', propertyId: property1.id }
    ]
    await db.insert(schema.roomType).values(roomTypes1Data)
    await db.insert(schema.roomTypeAmenity).values([
      { roomTypeId: 'rt1_1', amenityId: amenities[2].id },
      { roomTypeId: 'rt1_1', amenityId: amenities[4].id },
      { roomTypeId: 'rt1_1', amenityId: amenities[6].id },
      { roomTypeId: 'rt1_2', amenityId: amenities[0].id },
      { roomTypeId: 'rt1_2', amenityId: amenities[2].id },
      { roomTypeId: 'rt1_2', amenityId: amenities[4].id },
      { roomTypeId: 'rt1_2', amenityId: amenities[6].id },
      { roomTypeId: 'rt1_3', amenityId: amenities[0].id },
      { roomTypeId: 'rt1_3', amenityId: amenities[1].id },
      { roomTypeId: 'rt1_3', amenityId: amenities[2].id },
      { roomTypeId: 'rt1_3', amenityId: amenities[3].id },
      { roomTypeId: 'rt1_3', amenityId: amenities[4].id },
      { roomTypeId: 'rt1_3', amenityId: amenities[6].id }
    ])
    const roomTypes1 = roomTypes1Data

    console.log('🚪 Creating rooms for Property 1...')
    const roomsData1: { id: string; roomNumber: string; status: string; roomTypeId: string; floorId: string; propertyId: string }[] = []
    for (let floorIdx = 0; floorIdx < 3; floorIdx++) {
      for (let roomNum = 1; roomNum <= 10; roomNum++) {
        const roomNumber = `${floorIdx + 1}${roomNum.toString().padStart(2, '0')}`
        let status = RoomStatus.AVAILABLE
        let roomTypeId = roomTypes1[roomNum % 3].id
        if (floorIdx === 0 && roomNum <= 3) status = RoomStatus.OCCUPIED
        else if (floorIdx === 1 && roomNum <= 2) status = RoomStatus.OCCUPIED
        else if (floorIdx === 0 && roomNum === 4) { status = RoomStatus.RESERVED; roomTypeId = roomTypes1[1].id }
        else if (floorIdx === 1 && roomNum === 7) { status = RoomStatus.MAINTENANCE; roomTypeId = roomTypes1[0].id }
        else if (floorIdx === 1 && roomNum === 8) { status = RoomStatus.CLEANING; roomTypeId = roomTypes1[2].id }
        roomsData1.push({
          id: `room_p1_${floorIdx + 1}${roomNum.toString().padStart(2, '0')}`,
          roomNumber,
          status,
          roomTypeId,
          floorId: floors1[floorIdx].id,
          propertyId: property1.id
        })
      }
    }
    await db.insert(schema.room).values(roomsData1)
    const roomTypeById = Object.fromEntries(roomTypes1.map(rt => [rt.id, rt]))
    const rooms1 = roomsData1.map(r => ({
      ...r,
      roomType: roomTypeById[r.roomTypeId] ?? roomTypes1[0]
    }))

    console.log('🏗️  Creating floors and room types for Property 2...')
    const floors2Data = [
      { id: 'floor_p2_1', name: 'Floor 1', floorNumber: 1, propertyId: property2.id },
      { id: 'floor_p2_2', name: 'Floor 2', floorNumber: 2, propertyId: property2.id }
    ]
    await db.insert(schema.floor).values(floors2Data)
    const floors2 = floors2Data

    const roomTypes2Data = [
      { id: 'rt2_1', name: 'Studio', basePrice: '5500', deposit: '11000', propertyId: property2.id },
      { id: 'rt2_2', name: 'Deluxe', basePrice: '7200', deposit: '14400', propertyId: property2.id }
    ]
    await db.insert(schema.roomType).values(roomTypes2Data)
    const roomTypes2 = roomTypes2Data
    const rt2Amenities = [
      [0, 1, 2, 3, 5, 6, 7],
      [0, 1, 2, 3, 4, 5, 6, 7]
    ]
    for (let i = 0; i < roomTypes2.length; i++) {
      await db.insert(schema.roomTypeAmenity).values(
        rt2Amenities[i].map(aIdx => ({ roomTypeId: roomTypes2[i].id, amenityId: amenities[aIdx].id }))
      )
    }

    const roomsData2: { id: string; roomNumber: string; status: string; roomTypeId: string; floorId: string; propertyId: string }[] = []
    for (let floorIdx = 0; floorIdx < 2; floorIdx++) {
      for (let roomNum = 1; roomNum <= 8; roomNum++) {
        const roomNumber = `${String.fromCharCode(65 + floorIdx)}${roomNum.toString().padStart(2, '0')}`
        let status = RoomStatus.AVAILABLE
        if (floorIdx === 0 && roomNum <= 2) status = RoomStatus.OCCUPIED
        else if (floorIdx === 1 && roomNum === 1) status = RoomStatus.OCCUPIED
        roomsData2.push({
          id: `room_p2_${roomNumber}`,
          roomNumber,
          status,
          roomTypeId: roomTypes2[roomNum % 2].id,
          floorId: floors2[floorIdx].id,
          propertyId: property2.id
        })
      }
    }
    await db.insert(schema.room).values(roomsData2)
    const rt2ById = Object.fromEntries(roomTypes2.map(rt => [rt.id, rt]))
    const rooms2 = roomsData2.map(r => ({
      ...r,
      roomType: rt2ById[r.roomTypeId] ?? roomTypes2[0]
    }))

    console.log('🛎️  Creating services...')
    const services1Data = [
      { id: 'sv1_1', name: 'ที่จอดรถ', defaultPrice: '500', billingCycle: BillingCycle.MONTHLY, propertyId: property1.id, isOptional: true },
      { id: 'sv1_2', name: 'อินเทอร์เน็ตความเร็วสูง', defaultPrice: '300', billingCycle: BillingCycle.MONTHLY, propertyId: property1.id, isOptional: false },
      { id: 'sv1_3', name: 'ค่าขยะและทำความสะอาด', defaultPrice: '200', billingCycle: BillingCycle.MONTHLY, propertyId: property1.id, isOptional: false }
    ]
    const services2Data = [
      { id: 'sv2_1', name: 'ที่จอดรถในร่ม', defaultPrice: '1000', billingCycle: BillingCycle.MONTHLY, propertyId: property2.id, isOptional: true },
      { id: 'sv2_2', name: 'บริการซักรีด', defaultPrice: '800', billingCycle: BillingCycle.MONTHLY, propertyId: property2.id, isOptional: true }
    ]
    await db.insert(schema.service).values([...services1Data, ...services2Data])
    const services1 = services1Data
    const services2 = services2Data

    console.log('👤 Creating tenants...')
    const tenantsData = [
      { id: 'tenant_01', name: 'กิตติพงษ์ ชูชาติ', phone: '0812345601', propertyId: property1.id, status: TenantStatus.ACTIVE, userId: tenantUser1.id },
      { id: 'tenant_02', name: 'วิภาดา สุขสันต์', phone: '0812345602', propertyId: property1.id, status: TenantStatus.ACTIVE, userId: tenantUser2.id },
      { id: 'tenant_03', name: 'ปิติ ยินดี', phone: '0812345603', propertyId: property1.id, status: TenantStatus.ACTIVE },
      { id: 'tenant_04', name: 'สมศรี รักษา', phone: '0812345604', propertyId: property1.id, status: TenantStatus.ACTIVE },
      { id: 'tenant_05', name: 'วิชัย เจริญ', phone: '0812345605', propertyId: property1.id, status: TenantStatus.ACTIVE },
      { id: 'tenant_06', name: 'นันทิดา สดใส', phone: '0812345606', propertyId: property1.id, status: TenantStatus.UPCOMING, desiredRoomTypeId: roomTypes1[1].id },
      { id: 'tenant_07', name: 'ประเสริฐ ออกไป', phone: '0812345607', propertyId: property1.id, status: TenantStatus.NOTICE_GIVEN },
      { id: 'tenant_08', name: 'สุดา รออยู่', phone: '0812345608', propertyId: property1.id, status: TenantStatus.WAITING_LIST, desiredRoomTypeId: roomTypes1[2].id },
      { id: 'tenant_09', name: 'วิไล รอด้วย', phone: '0812345609', propertyId: property1.id, status: TenantStatus.WAITING_LIST, desiredRoomTypeId: roomTypes1[1].id },
      { id: 'tenant_10', name: 'สมบูรณ์ ย้ายไป', phone: '0812345610', propertyId: property1.id, status: TenantStatus.MOVED_OUT },
      { id: 'tenant_11', name: 'ดวงใจ หวังดี', phone: '0823456701', propertyId: property2.id, status: TenantStatus.ACTIVE },
      { id: 'tenant_12', name: 'สุรชัย มั่งคั่ง', phone: '0823456702', propertyId: property2.id, status: TenantStatus.ACTIVE },
      { id: 'tenant_13', name: 'อรทัย สวยงาม', phone: '0823456703', propertyId: property2.id, status: TenantStatus.ACTIVE }
    ]
    await db.insert(schema.tenant).values(tenantsData)
    const tenants = tenantsData

    // --- 10. Create Contracts ---
    console.log("📄 Creating contracts...");
    const occupiedRooms1 = rooms1.filter((r) => r.status === RoomStatus.OCCUPIED);
    const contracts1 = await Promise.all([
      // Property 1: 5 ห้องมีผู้เช่า (101, 102, 103, 201, 202)
      createContractWithServices(
        property1,
        tenants[0],
        occupiedRooms1[0], // 101
        Number(occupiedRooms1[0].roomType.basePrice),
        -6,
        6,
        ContractStatus.ACTIVE,
        [services1[1], services1[2]],
        true
      ),
      createContractWithServices(
        property1,
        tenants[1],
        occupiedRooms1[1], // 102
        Number(occupiedRooms1[1].roomType.basePrice),
        -3,
        9,
        ContractStatus.ACTIVE,
        [services1[0], services1[1], services1[2]],
        true
      ),
      createContractWithServices(
        property1,
        tenants[2],
        occupiedRooms1[2], // 103
        Number(occupiedRooms1[2].roomType.basePrice),
        -1,
        11,
        ContractStatus.ACTIVE,
        [services1[1], services1[2]],
        true
      ),
      createContractWithServices(
        property1,
        tenants[3],
        occupiedRooms1[3], // 201
        Number(occupiedRooms1[3].roomType.basePrice),
        0,
        12,
        ContractStatus.ACTIVE,
        [services1[1], services1[2]],
        true
      ),
      createContractWithServices(
        property1,
        tenants[4],
        occupiedRooms1[4], // 202
        Number(occupiedRooms1[4].roomType.basePrice),
        -10,
        2,
        ContractStatus.ACTIVE,
        [services1[1], services1[2]],
        false // สัญญาที่กำลังจะหมดอายุ
      ),
      // สัญญาที่แจ้งย้ายออกแล้ว (ห้อง 108 - ยังอยู่อาศัยอยู่แต่จะย้ายออก)
      createContractWithServices(
        property1,
        tenants[6],
        rooms1.find((r) => r.roomNumber === "108")!,
        3000,
        -8,
        1, // สิ้นสุดอีก 1 เดือนข้างหน้า (ยังไม่หมดอายุ)
        ContractStatus.ACTIVE, // ยังคงเป็น ACTIVE เพื่อให้ดูและต่อสัญญาได้
        [services1[1], services1[2]],
        false
      ),
      // สัญญารอเข้าพัก (ห้อง 106 - ผู้เช่ารอเข้าพัก)
      createContractWithServices(
        property1,
        tenants[5], // นันทิดา สดใส (UPCOMING)
        rooms1.find((r) => r.roomNumber === "106")!,
        3200,
        3, // เริ่มสัญญา 3 วันข้างหน้า
        9, // สิ้นสุด 9 เดือนข้างหน้า
        ContractStatus.PENDING,
        [services1[0], services1[1]],
        false
      ),
    ]);

    // Property 2 contracts: 3 ห้องมีผู้เช่า (A01, A02, B01)
    const occupiedRooms2 = rooms2.filter((r) => r.status === RoomStatus.OCCUPIED);
    const contracts2 = await Promise.all([
      createContractWithServices(
        property2,
        tenants[10],
        occupiedRooms2[0], // A01
        Number(occupiedRooms2[0].roomType.basePrice),
        -4,
        8,
        ContractStatus.ACTIVE,
        [services2[0]],
        true
      ),
      createContractWithServices(
        property2,
        tenants[11],
        occupiedRooms2[1], // A02
        Number(occupiedRooms2[1].roomType.basePrice),
        -2,
        10,
        ContractStatus.ACTIVE,
        [services2[0], services2[1]],
        true
      ),
      createContractWithServices(
        property2,
        tenants[12],
        occupiedRooms2[2], // B01
        Number(occupiedRooms2[2].roomType.basePrice),
        -1,
        11,
        ContractStatus.ACTIVE,
        [],
        true
      ),
    ]);


    console.log('📅 Creating reservations...')
    const reservedRoom1 = rooms1.find(r => r.status === RoomStatus.RESERVED)!
    const room105 = rooms1.find(r => r.roomNumber === '105')!
    await db.insert(schema.reservation).values([
      {
        id: crypto.randomUUID(),
        startDate: dayjs().add(15, 'day').toDate(),
        endDate: dayjs().add(15, 'day').add(12, 'month').toDate(),
        status: ReservationStatus.CONFIRMED,
        propertyId: property1.id,
        roomId: reservedRoom1.id,
        tenantId: tenants[5].id
      },
      {
        id: crypto.randomUUID(),
        startDate: dayjs().add(30, 'day').toDate(),
        endDate: dayjs().add(30, 'day').add(12, 'month').toDate(),
        status: ReservationStatus.PENDING,
        propertyId: property1.id,
        roomId: room105.id,
        tenantId: tenants[7].id
      }
    ])

    console.log('💰 Creating deposits...')
    for (let i = 0; i < 5; i++) {
      await db.insert(schema.deposit).values({
        id: crypto.randomUUID(),
        contractId: contracts1[i].id,
        amount: contracts1[i].room.roomType.deposit,
        receivedDate: contracts1[i].startDate,
        clearanceStatus: i === 4 ? DepositClearanceStatus.PENDING_ROOM_CHECK : DepositClearanceStatus.PENDING_SETTLEMENT
      })
    }
    await db.insert(schema.deposit).values({
      id: crypto.randomUUID(),
      contractId: contracts1[5].id,
      amount: '5000',
      receivedDate: contracts1[5].startDate,
      refundedDate: dayjs().subtract(5, 'day').toDate(),
      deductions: '500',
      deductionNotes: 'ค่าทำความสะอาดและซ่อมแซม',
      clearanceStatus: DepositClearanceStatus.REFUNDED
    })

    await db.insert(schema.contractTermination).values({
      id: crypto.randomUUID(),
      contractId: contracts1[5].id,
      reason: 'ย้ายที่ทำงาน',
      terminatedDate: dayjs().subtract(10, 'day').toDate(),
      notes: 'ผู้เช่าแจ้งล่วงหน้า 30 วัน ตามข้อกำหนด'
    })

    console.log('🏦 Creating receiving accounts...')
    const receivingAccountsData = [
      { id: 'ra_1', type: 'BANK_ACCOUNT', details: { bankName: 'ธนาคารกรุงเทพ', accountNumber: '123-4-56789-0', accountName: 'บริษัท พักดีเพลส จำกัด' }, isActive: true, propertyId: property1.id },
      { id: 'ra_2', type: 'PROMPTPAY', details: { promptpayNumber: '0812345678', recipientName: 'คุณอารี (เจ้าของหอ)' }, isActive: true, propertyId: property1.id },
      { id: 'ra_3', type: 'BANK_ACCOUNT', details: { bankName: 'ธนาคารกสิกรไทย', accountNumber: '987-6-54321-0', accountName: 'บ้านสบาย' }, isActive: true, propertyId: property2.id }
    ]
    await db.insert(schema.receivingAccount).values(receivingAccountsData)
    const receivingAccounts = receivingAccountsData

    console.log('🧾 Creating billing runs and invoices...')
    const threeMonthsAgo = dayjs().subtract(3, 'month')
    const billingRun1Id = crypto.randomUUID()
    await db.insert(schema.billingRun).values({
      id: billingRun1Id,
      period: threeMonthsAgo.format('YYYY-MM'),
      propertyId: property1.id,
      status: BillingRunStatus.COMPLETED,
      executedById: admin.id,
      totalContracts: 3,
      meterReadingRequired: 3
    })
    const billingRun1 = { id: billingRun1Id, period: threeMonthsAgo.format('YYYY-MM') }

    await createPaidInvoice(billingRun1, contracts1[0], 1100, 1200, 90, 105, receivingAccounts[0].id)
    await createPaidInvoice(billingRun1, contracts1[1], 2000, 2100, 195, 215, receivingAccounts[1].id)

    const twoMonthsAgo = dayjs().subtract(2, 'month')
    const billingRun2Id = crypto.randomUUID()
    await db.insert(schema.billingRun).values({
      id: billingRun2Id,
      period: twoMonthsAgo.format('YYYY-MM'),
      propertyId: property1.id,
      status: BillingRunStatus.COMPLETED,
      executedById: admin.id,
      totalContracts: 4,
      meterReadingRequired: 4
    })
    const billingRun2 = { id: billingRun2Id, period: twoMonthsAgo.format('YYYY-MM') }
    await createPaidInvoice(billingRun2, contracts1[0], 1200, 1310, 105, 120, receivingAccounts[0].id)
    await createPaidInvoice(billingRun2, contracts1[1], 2100, 2215, 215, 235, receivingAccounts[1].id)
    await createPaidInvoice(billingRun2, contracts1[2], 3000, 3110, 300, 325, receivingAccounts[0].id)

    const lastMonth = dayjs().subtract(1, 'month')
    const billingRun3Id = crypto.randomUUID()
    await db.insert(schema.billingRun).values({
      id: billingRun3Id,
      period: lastMonth.format('YYYY-MM'),
      propertyId: property1.id,
      status: BillingRunStatus.COMPLETED,
      executedById: admin.id,
      totalContracts: 5,
      meterReadingRequired: 5
    })
    const billingRun3 = { id: billingRun3Id, period: lastMonth.format('YYYY-MM') }
    await createPaidInvoice(billingRun3, contracts1[0], 1310, 1425, 120, 137, receivingAccounts[0].id)
    await createPaidInvoice(billingRun3, contracts1[1], 2215, 2330, 235, 258, receivingAccounts[1].id)
    await createPaidInvoice(billingRun3, contracts1[2], 3110, 3225, 325, 350, receivingAccounts[0].id)

    const billingRun4Id = crypto.randomUUID()
    await db.insert(schema.billingRun).values({
      id: billingRun4Id,
      period: threeMonthsAgo.format('YYYY-MM'),
      propertyId: property2.id,
      status: BillingRunStatus.COMPLETED,
      executedById: staff2.id,
      totalContracts: 2,
      meterReadingRequired: 2
    })
    await createPaidInvoice({ id: billingRun4Id, period: threeMonthsAgo.format('YYYY-MM') }, contracts2[0], 1500, 1620, 150, 172, receivingAccounts[2].id)

    const billingRun5Id = crypto.randomUUID()
    await db.insert(schema.billingRun).values({
      id: billingRun5Id,
      period: twoMonthsAgo.format('YYYY-MM'),
      propertyId: property2.id,
      status: BillingRunStatus.COMPLETED,
      executedById: staff2.id,
      totalContracts: 3,
      meterReadingRequired: 3
    })
    const billingRun5 = { id: billingRun5Id, period: twoMonthsAgo.format('YYYY-MM') }
    await createPaidInvoice(billingRun5, contracts2[0], 1620, 1745, 172, 195, receivingAccounts[2].id)
    await createPaidInvoice(billingRun5, contracts2[1], 2200, 2330, 220, 245, receivingAccounts[2].id)

    const billingRun6Id = crypto.randomUUID()
    await db.insert(schema.billingRun).values({
      id: billingRun6Id,
      period: lastMonth.format('YYYY-MM'),
      propertyId: property2.id,
      status: BillingRunStatus.COMPLETED,
      executedById: staff2.id,
      totalContracts: 3,
      meterReadingRequired: 3
    })
    const billingRun6 = { id: billingRun6Id, period: lastMonth.format('YYYY-MM') }
    await createPaidInvoice(billingRun6, contracts2[0], 1745, 1875, 195, 220, receivingAccounts[2].id)
    await createPaidInvoice(billingRun6, contracts2[1], 2330, 2465, 245, 270, receivingAccounts[2].id)
    await createPaidInvoice(billingRun6, contracts2[2], 1800, 1920, 180, 205, receivingAccounts[2].id)

    console.log('💳 Creating pending payments...')
    const unpaidInvoices = await db
      .select()
      .from(schema.invoice)
      .where(and(
        eq(schema.invoice.propertyId, property1.id),
        eq(schema.invoice.status, InvoiceStatus.UNPAID)
      ))
      .limit(3)
    let idx = 0
    for (const invoice of unpaidInvoices) {
      const tenantName = 'ผู้เช่า'
      await createPendingPayment(
        invoice,
        Number(invoice.totalAmount),
        -idx,
        `https://placehold.co/600x800/E2E8F0/475569?text=SLIP%5Cn${invoice.totalAmount}%5Cn${encodeURIComponent(tenantName)}`
      )
      idx++
    }

    console.log('⏰ Creating overdue invoices...')
    const overdueInvoice = await createUnpaidInvoice(
      property1,
      contracts1[3],
      Number(contracts1[3].rentAmount) + 500,
      dayjs().subtract(15, 'day')
    )
    await db.update(schema.invoice).set({ status: InvoiceStatus.OVERDUE }).where(eq(schema.invoice.id, overdueInvoice.id))

    const kittipongOverdueInvoice = await createInvoiceWithMeterReading(
      billingRun3,
      contracts1[0],
      1425, 1550, 137, 159,
      InvoiceStatus.OVERDUE
    )
    await db.update(schema.invoice).set({
      dueDate: dayjs().subtract(10, 'day').toDate(),
      period: lastMonth.format('YYYY-MM')
    }).where(eq(schema.invoice.id, kittipongOverdueInvoice.id))

    console.log('📋 Creating current month unpaid invoices...')
    const currentMonth = dayjs()
    const billingRunCurrentId = crypto.randomUUID()
    await db.insert(schema.billingRun).values({
      id: billingRunCurrentId,
      period: currentMonth.format('YYYY-MM'),
      propertyId: property1.id,
      status: BillingRunStatus.COMPLETED,
      executedById: admin.id,
      totalContracts: 5,
      meterReadingRequired: 5
    })
    const billingRunCurrent = { id: billingRunCurrentId, period: currentMonth.format('YYYY-MM') }
    await createInvoiceWithMeterReading(billingRunCurrent, contracts1[0], 1550, 1675, 159, 181, InvoiceStatus.UNPAID)
    await createInvoiceWithMeterReading(billingRunCurrent, contracts1[1], 2330, 2425, 258, 278, InvoiceStatus.UNPAID)

    console.log('🔧 Creating maintenance requests...')
    const maintenanceData = [
      { id: crypto.randomUUID(), title: 'แอร์เสีย ไม่เย็น', description: 'เครื่องปรับอากาศทำงาน แต่ไม่เย็น เสียงดังผิดปกติ', status: MaintenanceStatus.PENDING, priority: Priority.HIGH, dueDate: dayjs().add(2, 'day').toDate(), roomId: occupiedRooms1[0].id, reportedByContractId: contracts1[0].id },
      { id: crypto.randomUUID(), title: 'ก้อกน้ำรั่ว', description: 'ก้อกน้ำในห้องน้ำรั่ว', status: MaintenanceStatus.IN_PROGRESS, priority: Priority.MEDIUM, roomId: occupiedRooms1[1].id, reportedByContractId: contracts1[1].id },
      { id: crypto.randomUUID(), title: 'หลอดไฟเสีย', description: 'หลอดไฟในห้องนอนดับ', status: MaintenanceStatus.COMPLETED, priority: Priority.LOW, roomId: occupiedRooms1[2].id, reportedByContractId: contracts1[2].id },
      { id: crypto.randomUUID(), title: 'ประตูห้องเสีย', description: 'ลูกบิดประตูหลุด เปิดปิดไม่ได้', status: MaintenanceStatus.PENDING, priority: Priority.HIGH, dueDate: dayjs().add(1, 'day').toDate(), roomId: occupiedRooms1[3].id, reportedByContractId: contracts1[3].id },
      { id: crypto.randomUUID(), title: 'ตรวจเช็คเครื่องทำน้ำอุ่น', description: 'ขอตรวจสอบเครื่องทำน้ำอุ่น น้ำไม่ค่อยร้อน', status: MaintenanceStatus.CANCELLED, priority: Priority.LOW, roomId: occupiedRooms1[4].id, reportedByContractId: contracts1[4].id }
    ]
    await db.insert(schema.maintenanceRequest).values(maintenanceData)

    console.log('📊 Creating room status history...')
    const maintenanceRoom = rooms1.find(r => r.status === RoomStatus.MAINTENANCE)!
    await db.insert(schema.roomStatusHistory).values([
      { id: crypto.randomUUID(), roomId: maintenanceRoom.id, status: RoomStatus.OCCUPIED, startDate: dayjs().subtract(6, 'month').toDate(), endDate: dayjs().subtract(1, 'month').toDate(), notes: 'ผู้เช่ารายเก่า' },
      { id: crypto.randomUUID(), roomId: maintenanceRoom.id, status: RoomStatus.CLEANING, startDate: dayjs().subtract(1, 'month').toDate(), endDate: dayjs().subtract(25, 'day').toDate(), notes: 'ทำความสะอาดหลังผู้เช่าย้ายออก' },
      { id: crypto.randomUUID(), roomId: maintenanceRoom.id, status: RoomStatus.MAINTENANCE, startDate: dayjs().subtract(25, 'day').toDate(), endDate: null, notes: 'ซ่อมแอร์และทาสีใหม่' }
    ])

    console.log('✉️  Creating invitations...')
    await db.insert(schema.invitation).values([
      { id: crypto.randomUUID(), propertyId: property1.id, role: Role.STAFF, status: InvitationStatus.ACCEPTED, nameForReference: 'พนักงาน (จินดา)', invitedById: admin.id, acceptedByUserId: staff1.id, expiresAt: dayjs().add(7, 'day').toDate(), acceptedAt: dayjs().subtract(5, 'day').toDate() },
      { id: crypto.randomUUID(), propertyId: property1.id, role: Role.ADMIN, status: InvitationStatus.PENDING, nameForReference: 'ผู้จัดการใหม่', invitedById: owner.id, expiresAt: dayjs().add(7, 'day').toDate() },
      { id: crypto.randomUUID(), propertyId: property2.id, role: Role.STAFF, status: InvitationStatus.EXPIRED, nameForReference: 'พนักงานรายเก่า', invitedById: owner.id, expiresAt: dayjs().subtract(1, 'day').toDate() }
    ])

    console.log('✅ [API] Seeding finished successfully!')
    return successResponse(null, 'Database seeded successfully!')
  } catch (error) {
    console.error('❌ Seeding error:', error)
    return errorResponse(event, error)
  }
})

async function createContractWithServices(
  property: { id: string; defaultWaterBillingType: string | null; defaultWaterRate: string | null; defaultWaterMinimumCharge: string | null; defaultElectricityBillingType: string | null; defaultElectricityRate: string | null; defaultElectricityMinimumCharge: string | null },
  tenant: { id: string },
  room: { id: string; roomType: { basePrice: string; deposit: string } },
  rentAmount: number,
  startMonthOffset: number,
  endMonthOffset: number,
  status: ContractStatus,
  services: { id: string; defaultPrice: string }[],
  _includeDeposit: boolean
) {
  const contractId = crypto.randomUUID()
  const startDate = dayjs().add(startMonthOffset, 'month').toDate()
  const endDate = dayjs().add(endMonthOffset, 'month').toDate()
  await db.insert(schema.contract).values({
    id: contractId,
    startDate,
    endDate,
    rentAmount: String(rentAmount),
    roomId: room.id,
    propertyId: property.id,
    status,
    waterBillingType: property.defaultWaterBillingType ?? BillingType.FLAT_RATE,
    waterRate: property.defaultWaterRate ?? '0',
    waterMinimumCharge: property.defaultWaterMinimumCharge ?? '0',
    electricityBillingType: property.defaultElectricityBillingType ?? BillingType.PER_UNIT,
    electricityRate: property.defaultElectricityRate ?? '0',
    electricityMinimumCharge: property.defaultElectricityMinimumCharge ?? '0'
  })
  await db.insert(schema.contractTenant).values({
    contractId,
    tenantId: tenant.id,
    isPrimary: true
  })
  for (const service of services) {
    await db.insert(schema.contractService).values({
      id: crypto.randomUUID(),
      contractId,
      serviceId: service.id,
      startDate,
      customPrice: service.defaultPrice
    })
  }
  return {
    id: contractId,
    startDate,
    endDate,
    rentAmount: String(rentAmount),
    roomId: room.id,
    propertyId: property.id,
    status,
    waterBillingType: property.defaultWaterBillingType ?? BillingType.FLAT_RATE,
    waterRate: property.defaultWaterRate ?? '0',
    waterMinimumCharge: property.defaultWaterMinimumCharge ?? '0',
    electricityBillingType: property.defaultElectricityBillingType ?? BillingType.PER_UNIT,
    electricityRate: property.defaultElectricityRate ?? '0',
    electricityMinimumCharge: property.defaultElectricityMinimumCharge ?? '0',
    room: { roomType: room.roomType }
  }
}

async function createPaidInvoice(
  run: { id: string; period: string },
  contract: { id: string; propertyId: string; rentAmount: string; electricityRate: string; electricityMinimumCharge: string; waterRate: string; waterMinimumCharge: string },
  oldElec: number,
  newElec: number,
  oldWater: number,
  newWater: number,
  receivingAccountId?: string
) {
  const [property] = await db.select().from(schema.property).where(eq(schema.property.id, contract.propertyId)).limit(1)
  if (!property) throw new Error('Property not found')
  const elecUnits = newElec - oldElec
  const waterUnits = newWater - oldWater
  const elecCost = Math.max(
    elecUnits * Number(contract.electricityRate),
    Number(contract.electricityMinimumCharge)
  )
  const waterCost = Math.max(
    waterUnits * Number(contract.waterRate),
    Number(contract.waterMinimumCharge)
  )
  const csWithService = await db
    .select({
      customPrice: schema.contractService.customPrice,
      defaultPrice: schema.service.defaultPrice,
      name: schema.service.name
    })
    .from(schema.contractService)
    .innerJoin(schema.service, eq(schema.contractService.serviceId, schema.service.id))
    .where(eq(schema.contractService.contractId, contract.id))
  const servicesCost = csWithService.reduce(
    (sum, cs) => sum + Number(cs.customPrice ?? cs.defaultPrice),
    0
  )
  const totalAmount = Number(contract.rentAmount) + elecCost + waterCost + servicesCost
  const cutoff = property.defaultBillingCutoffDay ?? 28
  const dueDays = property.defaultPaymentDueDays ?? 7
  const dueDate = dayjs(run.period).date(cutoff).add(dueDays, 'day').toDate()
  const invoiceId = crypto.randomUUID()
  await db.insert(schema.invoice).values({
    id: invoiceId,
    billingRunId: run.id,
    propertyId: contract.propertyId,
    contractId: contract.id,
    period: run.period,
    dueDate,
    status: InvoiceStatus.PAID,
    totalAmount: String(totalAmount)
  })
  await db.insert(schema.invoiceItem).values([
    { id: crypto.randomUUID(), invoiceId, description: 'ค่าเช่า', amount: contract.rentAmount },
    { id: crypto.randomUUID(), invoiceId, description: 'ค่าไฟฟ้า', amount: String(elecCost) },
    { id: crypto.randomUUID(), invoiceId, description: 'ค่าน้ำ', amount: String(waterCost) },
    ...csWithService.map(cs => ({
      id: crypto.randomUUID(),
      invoiceId,
      description: cs.name,
      amount: String(cs.customPrice ?? cs.defaultPrice)
    }))
  ])
  const mr1 = crypto.randomUUID()
  const mr2 = crypto.randomUUID()
  await db.insert(schema.meterReading).values([
    { id: mr1, invoiceId, utilityType: UtilityType.ELECTRICITY, readingValue: String(newElec), readingDate: new Date() },
    { id: mr2, invoiceId, utilityType: UtilityType.WATER, readingValue: String(newWater), readingDate: new Date() }
  ])
  await db.insert(schema.payment).values({
    id: crypto.randomUUID(),
    invoiceId,
    amount: String(totalAmount),
    status: PaymentStatus.VERIFIED,
    paymentDate: dayjs(run.period).add(3, 'day').toDate(),
    paymentMethod: PaymentMethod.QR_PROMPTAY,
    receivingAccountId: receivingAccountId ?? null
  })
  return { id: invoiceId }
}

async function createInvoiceWithMeterReading(
  run: { id: string; period: string },
  contract: { id: string; propertyId: string; rentAmount: string; electricityBillingType: string; electricityRate: string; electricityMinimumCharge: string; waterBillingType: string; waterRate: string; waterMinimumCharge: string },
  oldElec: number,
  newElec: number,
  oldWater: number,
  newWater: number,
  status: InvoiceStatus
) {
  const [property] = await db.select().from(schema.property).where(eq(schema.property.id, contract.propertyId)).limit(1)
  if (!property) throw new Error('Property not found')
  const elecUnits = newElec - oldElec
  const waterUnits = newWater - oldWater
  const elecCost = contract.electricityBillingType === BillingType.PER_UNIT
    ? Math.max(elecUnits * Number(contract.electricityRate), Number(contract.electricityMinimumCharge))
    : Number(contract.electricityRate)
  const waterCost = contract.waterBillingType === BillingType.PER_UNIT
    ? Math.max(waterUnits * Number(contract.waterRate), Number(contract.waterMinimumCharge))
    : Number(contract.waterRate)
  const csWithService = await db.select({ customPrice: schema.contractService.customPrice, defaultPrice: schema.service.defaultPrice, name: schema.service.name })
    .from(schema.contractService)
    .innerJoin(schema.service, eq(schema.contractService.serviceId, schema.service.id))
    .where(eq(schema.contractService.contractId, contract.id))
  const servicesCost = csWithService.reduce((sum, cs) => sum + Number(cs.customPrice ?? cs.defaultPrice), 0)
  const totalAmount = Number(contract.rentAmount) + elecCost + waterCost + servicesCost
  const cutoff = property.defaultBillingCutoffDay ?? 28
  const dueDays = property.defaultPaymentDueDays ?? 7
  const dueDate = dayjs(run.period).date(cutoff).add(dueDays, 'day').toDate()
  const invoiceId = crypto.randomUUID()
  await db.insert(schema.invoice).values({
    id: invoiceId,
    billingRunId: run.id,
    propertyId: contract.propertyId,
    contractId: contract.id,
    period: run.period,
    dueDate,
    status,
    totalAmount: String(totalAmount)
  })
  await db.insert(schema.invoiceItem).values([
    { id: crypto.randomUUID(), invoiceId, description: 'ค่าเช่า', amount: contract.rentAmount },
    { id: crypto.randomUUID(), invoiceId, description: `ค่าไฟฟ้า (${elecUnits} หน่วย)`, amount: String(elecCost) },
    { id: crypto.randomUUID(), invoiceId, description: `ค่าน้ำ (${waterUnits} หน่วย)`, amount: String(waterCost) },
    ...csWithService.map(cs => ({ id: crypto.randomUUID(), invoiceId, description: cs.name, amount: String(cs.customPrice ?? cs.defaultPrice) }))
  ])
  await db.insert(schema.meterReading).values([
    { id: crypto.randomUUID(), invoiceId, utilityType: UtilityType.ELECTRICITY, readingValue: String(newElec), readingDate: new Date() },
    { id: crypto.randomUUID(), invoiceId, utilityType: UtilityType.WATER, readingValue: String(newWater), readingDate: new Date() }
  ])
  return { id: invoiceId }
}

async function _createDraftInvoice(
  run: { id: string; period: string },
  contract: { id: string; propertyId: string; rentAmount: string }
) {
  const [property] = await db.select().from(schema.property).where(eq(schema.property.id, contract.propertyId)).limit(1)
  if (!property) throw new Error('Property not found')
  const csWithService = await db.select({ customPrice: schema.contractService.customPrice, defaultPrice: schema.service.defaultPrice, name: schema.service.name })
    .from(schema.contractService)
    .innerJoin(schema.service, eq(schema.contractService.serviceId, schema.service.id))
    .where(eq(schema.contractService.contractId, contract.id))
  const servicesCost = csWithService.reduce((sum, cs) => sum + Number(cs.customPrice ?? cs.defaultPrice), 0)
  const totalAmount = Number(contract.rentAmount) + servicesCost
  const cutoff = property.defaultBillingCutoffDay ?? 28
  const dueDays = property.defaultPaymentDueDays ?? 7
  const dueDate = dayjs(run.period).date(cutoff).add(dueDays, 'day').toDate()
  const invoiceId = crypto.randomUUID()
  await db.insert(schema.invoice).values({
    id: invoiceId,
    billingRunId: run.id,
    propertyId: contract.propertyId,
    contractId: contract.id,
    period: run.period,
    dueDate,
    status: InvoiceStatus.DRAFT,
    totalAmount: String(totalAmount)
  })
  await db.insert(schema.invoiceItem).values([
    { id: crypto.randomUUID(), invoiceId, description: 'ค่าเช่า', amount: contract.rentAmount },
    ...csWithService.map(cs => ({ id: crypto.randomUUID(), invoiceId, description: cs.name, amount: String(cs.customPrice ?? cs.defaultPrice) }))
  ])
  return { id: invoiceId }
}

async function createUnpaidInvoice(
  property: { id: string; defaultBillingCutoffDay: number | null; defaultPaymentDueDays: number | null },
  contract: { id: string; propertyId: string },
  totalAmount: number,
  dueDate?: dayjs.Dayjs
) {
  const cutoff = property.defaultBillingCutoffDay ?? 28
  const dueDays = property.defaultPaymentDueDays ?? 7
  const calculatedDueDate = dueDate ?? dayjs().date(cutoff).add(dueDays, 'day')
  const invoiceId = crypto.randomUUID()
  await db.insert(schema.invoice).values({
    id: invoiceId,
    propertyId: property.id,
    contractId: contract.id,
    period: dayjs().format('YYYY-MM'),
    dueDate: calculatedDueDate.toDate(),
    status: InvoiceStatus.UNPAID,
    totalAmount: String(totalAmount)
  })
  await db.insert(schema.invoiceItem).values({
    id: crypto.randomUUID(),
    invoiceId,
    description: 'ค่าเช่าและบริการ',
    amount: String(totalAmount)
  })
  return { id: invoiceId }
}

async function createPendingPayment(
  invoice: { id: string },
  amount: number,
  daysAgo: number,
  slipUrl: string
) {
  await db.insert(schema.payment).values({
    id: crypto.randomUUID(),
    invoiceId: invoice.id,
    amount: String(amount),
    status: PaymentStatus.PENDING,
    paymentDate: dayjs().add(daysAgo, 'day').toDate(),
    paymentMethod: PaymentMethod.QR_PROMPTAY,
    slipUrl
  })
}
