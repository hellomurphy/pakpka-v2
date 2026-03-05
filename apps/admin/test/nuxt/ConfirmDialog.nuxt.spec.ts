import { describe, expect, it, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { defineComponent, h } from 'vue'
import ConfirmDialog from '~/components/ConfirmDialog.vue'

const { confirmMock, cancelMock } = vi.hoisted(() => ({
  confirmMock: vi.fn(),
  cancelMock: vi.fn(),
}))

mockNuxtImport('useConfirm', () => () => ({
  state: {
    show: true,
    title: 'Test Title',
    message: 'Test message',
    confirmText: 'ยืนยัน',
    cancelText: 'ยกเลิก',
    intent: 'info',
  },
  confirm: confirmMock,
  cancel: cancelMock,
}))

// UModal (inside BaseModal) renders content in a portal, so we stub BaseModal to render
// the slot inline and make title/buttons visible to the wrapper.
const BaseModalStub = defineComponent({
  props: { modelValue: Boolean, maxWidth: String },
  setup(props, { slots }) {
    return () =>
      props.modelValue
        ? h('div', { 'data-testid': 'confirm-dialog-content' }, slots.default?.())
        : null
  },
})

describe('ConfirmDialog', () => {
  const mountOptions = {
    global: {
      stubs: {
        BaseModal: BaseModalStub,
      },
    },
  }

  it('renders title and message from useConfirm state', async () => {
    const wrapper = await mountSuspended(ConfirmDialog, mountOptions)
    expect(wrapper.text()).toContain('Test Title')
    expect(wrapper.text()).toContain('Test message')
  })

  it('renders cancel and confirm button labels', async () => {
    const wrapper = await mountSuspended(ConfirmDialog, mountOptions)
    expect(wrapper.text()).toContain('ยกเลิก')
    expect(wrapper.text()).toContain('ยืนยัน')
  })

  it('calls confirm when confirm button is clicked', async () => {
    confirmMock.mockClear()
    const wrapper = await mountSuspended(ConfirmDialog, mountOptions)
    const buttons = wrapper.findAll('button')
    const confirmButton = buttons.find((b) => b.text() === 'ยืนยัน')
    expect(confirmButton).toBeDefined()
    await confirmButton!.trigger('click')
    expect(confirmMock).toHaveBeenCalledTimes(1)
  })

  it('calls cancel when cancel button is clicked', async () => {
    cancelMock.mockClear()
    const wrapper = await mountSuspended(ConfirmDialog, mountOptions)
    const buttons = wrapper.findAll('button')
    const cancelButton = buttons.find((b) => b.text() === 'ยกเลิก')
    expect(cancelButton).toBeDefined()
    await cancelButton!.trigger('click')
    expect(cancelMock).toHaveBeenCalledTimes(1)
  })
})
