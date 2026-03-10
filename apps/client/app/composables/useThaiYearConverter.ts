// src/composables/useThaiYearConverter.js
import dayjs from 'dayjs' // Assuming dayjs is installed for getting the current year

/**
 * A Vue composable for converting between Gregorian (A.D.) and Thai Buddhist (B.E.) years.
 * It also provides a utility to generate year options for select inputs.
 */
export function useThaiYearConverter() {
  // Define the constant offset for Gregorian to Buddhist Era conversion
  const AD_TO_BE_OFFSET = 543

  /**
   * Converts a Gregorian year (A.D.) to a Thai Buddhist year (B.E.).
   * Handles "all" string for filter scenarios.
   * @param {number|string} adYear - The Gregorian year (e.g., 2025) or "all".
   * @returns {string} The Thai Buddhist year (e.g., "2568") or "ทุกปี".
   */
  const convertADtoBE = (adYear: string) => {
    if (typeof adYear === 'string' && adYear.toLowerCase() === 'all') {
      return 'ทุกปี'
    }
    const year = parseInt(adYear, 10)
    // Ensure the year is a valid number before conversion
    if (isNaN(year)) {
      console.warn(`Invalid Gregorian year provided to convertADtoBE: ${adYear}`)
      return '' // Or handle error appropriately
    }
    return String(year + AD_TO_BE_OFFSET)
  }

  /**
   * Converts a Thai Buddhist year (B.E.) to a Gregorian year (A.D.).
   * Handles "ทุกปี" string for filter scenarios.
   * This might be less commonly used in the UI display -> backend flow,
   * but useful if you need to convert B.E. input back to A.D.
   * @param {number|string} beYear - The Thai Buddhist year (e.g., 2568) or "ทุกปี".
   * @returns {string} The Gregorian year (e.g., "2025") or "all".
   */
  const convertBEtoAD = (beYear: string) => {
    if (typeof beYear === 'string' && beYear.toLowerCase() === 'ทุกปี') {
      return 'all'
    }
    const year = parseInt(beYear, 10)
    if (isNaN(year)) {
      console.warn(`Invalid Buddhist year provided to convertBEtoAD: ${beYear}`)
      return '' // Or handle error appropriately
    }
    return String(year - AD_TO_BE_OFFSET)
  }

  /**
   * Generates a dynamic list of year options for a <select> element.
   * It starts from a fixed Gregorian year and goes up to the current Gregorian year.
   * The options will display B.E. years to the user but have A.D. years as their value.
   * @param {number} fixedStartGregorianYear - The Gregorian year to start the list from (e.g., 2020).
   * @returns {Array<{ value: string, label: string }>} An array of year options.
   */
  const generateYearOptions = (fixedStartGregorianYear = 2020) => {
    const currentGregorianYear = dayjs().year() // Get current year (e.g., 2025)
    const options = [{ value: 'all', label: 'ทุกปี' }]

    // Loop from the fixed start year up to the current year (inclusive)
    for (let adYear = fixedStartGregorianYear; adYear <= currentGregorianYear; adYear++) {
      const beYear = adYear + AD_TO_BE_OFFSET // Convert to Buddhist Era for display
      options.push({
        value: String(adYear), // The actual value will be Gregorian (A.D.)
        label: String(beYear), // The displayed label will be Buddhist (B.E.)
      })
    }
    // Optionally reverse the order if you want the most recent year first in the dropdown
    options.reverse()
    return options
  }

  // Return the functions that will be exposed when using this composable
  return {
    convertADtoBE,
    convertBEtoAD, // Useful if you ever need to convert user B.E. input to A.D.
    generateYearOptions,
    AD_TO_BE_OFFSET, // Expose the offset constant if it might be useful elsewhere
  }
}
