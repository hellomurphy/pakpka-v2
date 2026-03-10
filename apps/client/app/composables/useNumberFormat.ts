export const useNumberFormat = (locale = 'th-TH') => {
  const formatNumber = (value: number | string): string => {
    const number = Number(value)
    if (isNaN(number)) return '-'
    return new Intl.NumberFormat(locale).format(number)
  }

  return { formatNumber }
}
