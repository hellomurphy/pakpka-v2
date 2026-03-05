import { useAppAuth } from '~/composables/useAppAuth'
import { useInitializeSession } from '~/composables/useInitializeSession'
import { useSettingsStore } from '~/pages/settings/store/settingsStore'
import { usePropertyStore } from '~/store/propertyStore'

export default defineNuxtPlugin(() => {
  const { status } = useAppAuth()
  const { initialize } = useInitializeSession()

  const propertyStore = usePropertyStore()
  const settingsStore = useSettingsStore()

  watch(
    status,
    async (newStatus) => {
      if (newStatus === 'authenticated') {
        await initialize()

        if (propertyStore.propertyId) {
          await settingsStore.fetchSettings()
        }
      } else {
        propertyStore.clearProperties()
        settingsStore.clearSettings()
      }
    },
    { immediate: true },
  )
})
