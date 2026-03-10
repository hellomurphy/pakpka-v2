// stores/rooms.ts
import { defineStore } from 'pinia'
import type { Room } from '@repo/db'

export const useRoomsStore = defineStore('rooms', {
  state: () => ({
    rooms: [] as Room[],
    currentRoom: null as Room | null,
    status: 'idle' as 'idle' | 'pending' | 'success' | 'error',
  }),

  getters: {
    isLoading: (state) => state.status === 'pending',
    hasRooms: (state) => state.rooms.length > 0,
    overdueRooms: (state) =>
      state.rooms.filter((room) => room.currentInvoice?.status === 'OVERDUE'),
    totalOutstanding: (state) =>
      state.rooms.reduce((sum, room) => sum + Number(room.currentInvoice?.totalAmount ?? 0), 0),
  },

  actions: {
    /**
     * ดึงห้องทั้งหมดของ tenant ที่ล็อกอินอยู่
     */
    async fetchMyRooms() {
      const api = useApi()
      const userStore = useUserStore()
      this.status = 'pending'

      try {
        const response = await api.rooms.getMy()
        const rawRooms = response.data?.rooms || []

        // Transform backend data to UI format
        this.rooms = rawRooms.map((item: any) => {
          const propertyName = userStore.user?.property?.name || 'หอพัก'

          // Format contract dates
          const startDate = new Date(item.startDate)
          const endDate = new Date(item.endDate)
          const contractPeriod = `${startDate.toLocaleDateString('th-TH', { month: 'short', year: 'numeric' })} - ${endDate.toLocaleDateString('th-TH', { month: 'short', year: 'numeric' })}`

          // Determine room status based on contract status
          let status = 'pending'
          if (item.contractStatus === 'ACTIVE') {
            status = 'paid' // สมมติว่าห้องที่มี contract active แสดงว่าชำระแล้ว
          } else if (item.contractStatus === 'MOVED_OUT') {
            status = 'inactive'
          }

          return {
            id: item.room.id,
            name: propertyName,
            roomNumber: item.room.roomNumber,
            contract: contractPeriod,
            rent: Number(item.rentAmount),
            status,
            imageUrl:
              'https://placehold.co/400x240/EEF2FF/818CF8?text=' +
              encodeURIComponent(item.room.roomNumber),
            roomType: item.room.roomType.name,
            floor: item.room.floor.name,
            amenities: item.room.roomType.amenities || [],
            contractId: item.contractId,
            contractStatus: item.contractStatus,
            currentInvoice: null, // Will be populated later if needed
          }
        })

        console.log('📦 Fetched and transformed rooms:', this.rooms)
        this.status = 'success'
      } catch (error) {
        this.status = 'error'
        this.rooms = []
        console.error('Failed to fetch rooms:', error)
      }
    },

    /**
     * ดึงข้อมูลห้องเฉพาะ ID
     */
    async fetchRoom(roomId: string) {
      const api = useApi()
      this.status = 'pending'

      try {
        const response = await api.rooms.get(roomId)
        this.currentRoom = response.data
        this.status = 'success'
      } catch (error) {
        this.status = 'error'
        this.currentRoom = null
        console.error('Failed to fetch room:', error)
      }
    },

    /**
     * อัปเดตสถานะห้องตาม invoice ที่ค้างชำระ
     */
    updateRoomStatusFromInvoices(invoices: any[]) {
      // Group invoices by contract ID
      const invoicesByContract = new Map()

      invoices.forEach((invoice: any) => {
        const contractId = invoice.contract?.id
        if (!contractId) return

        if (!invoicesByContract.has(contractId)) {
          invoicesByContract.set(contractId, [])
        }
        invoicesByContract.get(contractId).push(invoice)
      })

      // Update room status based on invoices
      this.rooms = this.rooms.map((room: any) => {
        const roomInvoices = invoicesByContract.get(room.contractId) || []

        // Check if there are any overdue invoices
        const hasOverdue = roomInvoices.some((inv: any) => inv.status === 'OVERDUE')

        if (hasOverdue) {
          return { ...room, status: 'overdue' }
        }

        // Check if there are any unpaid invoices
        const hasUnpaid = roomInvoices.some((inv: any) => inv.status === 'UNPAID')

        if (hasUnpaid) {
          return { ...room, status: 'pending' }
        }

        // All invoices are paid
        return { ...room, status: 'paid' }
      })

      console.log('✅ Updated room status from invoices')
    },

    /**
     * Clear state เมื่อ logout
     */
    clearRooms() {
      this.rooms = []
      this.currentRoom = null
      this.status = 'idle'
    },
  },
})
