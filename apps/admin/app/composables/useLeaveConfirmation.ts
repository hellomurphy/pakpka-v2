import { onBeforeRouteLeave } from 'vue-router'
import { useConfirm } from '~/composables/useConfirm'
import type { Ref } from 'vue'

/**
 * A composable to handle confirmation before leaving a page with unsaved changes.
 * @param isDirty - A Ref<boolean> that indicates if the form has unsaved changes.
 * @param onConfirmLeave - A function to call when the user confirms they want to leave.
 */
export const useLeaveConfirmation = (
  isDirty: Ref<boolean>,
  onConfirmLeave: () => void, // ✨ รับฟังก์ชันเข้ามา
) => {
  const { show: showConfirm } = useConfirm()

  onBeforeRouteLeave(async (to, from, next) => {
    if (!isDirty.value) {
      next()
      return
    }

    const confirmed = await showConfirm({
      title: 'มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก',
      message: 'คุณแน่ใจหรือไม่ว่าต้องการออกจากหน้านี้? การเปลี่ยนแปลงทั้งหมดจะสูญหาย',
      intent: 'warning',
      confirmText: 'ออกจากหน้านี้',
      cancelText: 'อยู่ต่อ',
    })

    if (confirmed) {
      // ✨ เรียกใช้ฟังก์ชันที่รับเข้ามาเพื่อรีเซ็ต State
      onConfirmLeave()

      // ใช้ nextTick เพื่อให้แน่ใจว่า state update เสร็จก่อนจะ navigate
      await nextTick()

      next()
    } else {
      next(false)
    }
  })
}
