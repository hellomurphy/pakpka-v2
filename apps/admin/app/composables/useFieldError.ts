import { computed } from 'vue'
import {
  useFieldError as useVeeFieldError,
  useIsFieldTouched,
  useSubmitCount
} from 'vee-validate'

/**
 * Returns a computed error message for a field that only shows when the field
 * has been touched (blurred) or the form has been submitted at least once.
 * Use this to avoid showing "invalid" on first focus/blur before the user
 * has had a chance to edit. Must be called in a component that uses useForm().
 */
export function useDelayedFieldError(fieldName: string) {
  const errorMessage = useVeeFieldError(fieldName)
  const isTouched = useIsFieldTouched(fieldName)
  const submitCount = useSubmitCount()
  return computed(
    () => (isTouched.value || submitCount.value > 0 ? (errorMessage.value ?? '') : '') as string
  )
}
