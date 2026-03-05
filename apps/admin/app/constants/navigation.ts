// composables/navigation.ts

import { usePaymentsStore } from '~/store/paymentsStore'
import { storeToRefs } from 'pinia'

export interface NavigationItem {
  label: string
  icon: string
  activeIcon?: string
  to?: string
  isButton?: boolean
  mobileOrder?: number
  children?: NavigationItem[]
  count?: number
}

export const useNavigation = () => {
  const paymentsStore = usePaymentsStore()
  const { totalPending } = storeToRefs(paymentsStore)

  const mainNavItems: NavigationItem[] = [
    {
      label: 'ภาพรวมระบบ',
      icon: 'i-lucide-bar-chart-2',
      activeIcon: 'i-lucide-bar-chart-2',
      to: '/dashboard',
      mobileOrder: 1,
    },
    {
      label: 'จัดการผู้เช่า',
      icon: 'i-lucide-users',
      activeIcon: 'i-lucide-users',
      mobileOrder: 2,
      children: [
        {
          label: 'รายชื่อผู้เช่า',
          icon: 'i-lucide-users',
          activeIcon: 'i-lucide-users',
          to: '/tenants',
        },
        {
          label: 'จัดการสัญญา',
          icon: 'i-lucide-copy',
          activeIcon: 'i-lucide-copy',
          to: '/contracts',
        },
      ],
    },
    {
      label: 'จัดการห้องพัก',
      icon: 'i-lucide-home',
      activeIcon: 'i-lucide-home',
      to: '/rooms',
      mobileOrder: 3,
    },
    {
      label: 'จัดการแจ้งหนี้',
      icon: 'i-lucide-file-text',
      activeIcon: 'i-lucide-file-text',
      to: '/billing',
      mobileOrder: 4,
    },
    {
      label: 'ตรวจสอบการชำระเงิน',
      icon: 'i-lucide-banknote',
      activeIcon: 'i-lucide-banknote',
      to: '/payments',
      count: totalPending.value,
      mobileOrder: 5,
    },
    {
      label: 'เชิญผู้เช่า (QR)',
      icon: 'i-lucide-qr-code',
      activeIcon: 'i-lucide-qr-code',
      to: '/invite',
      mobileOrder: 0,
    },
  ]

  const userNavItems: NavigationItem[] = [
    {
      label: 'การตั้งค่า',
      icon: 'i-lucide-settings',
      activeIcon: 'i-lucide-settings',
      to: '/settings',
      mobileOrder: 0,
    },
    {
      label: 'ออกจากระบบ',
      icon: 'i-lucide-log-out',
      to: '/logout',
      isButton: true,
      mobileOrder: 0,
    },
  ]

  // --- ✨ LOGIC ใหม่สำหรับ Mobile ---

  // สร้างลิสต์สำหรับ Footer หลัก (4 ปุ่ม)
  const mobilePrimaryLinks = mainNavItems
    .filter((item) => item.mobileOrder && item.mobileOrder > 0 && item.mobileOrder < 5)
    .map((item) => {
      // ถ้าเมนูมี children, ให้ใช้ "เมนูย่อยตัวแรก" เป็นตัวแทนสำหรับปุ่มหลัก
      if (item.children && item.children[0]) {
        return {
          ...item.children[0], // เอา to, activeIcon ของลูกมา
          label: item.label, // แต่ยังใช้ label และ icon ของแม่
          icon: item.icon,
        }
      }
      return item
    })
    .sort((a, b) => (a.mobileOrder || 0) - (b.mobileOrder || 0))

  // สร้างลิสต์สำหรับเมนู "เพิ่มเติม" (Bottom Sheet)
  const mobileSecondaryLinks = [
    // "คลี่" เมนูที่มี children ออกมาเป็นรายการย่อยๆ
    ...mainNavItems.flatMap((item) => {
      if (item.mobileOrder === 0) return [item] // เมนูปกติใน "เพิ่มเติม"
      if (item.mobileOrder >= 5) return [item] // เมนูหลักที่เกิน 4 อันดับแรก
      if (item.children) return item.children // คลี่เมนูย่อยทั้งหมด
      return []
    }),
    ...userNavItems.filter((item) => !item.isButton), // เมนูผู้ใช้ (ไม่รวมปุ่ม Logout)
  ]

  return {
    mainNavItems,
    userNavItems,
    mobilePrimaryLinks,
    mobileSecondaryLinks,
  }
}
