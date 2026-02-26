// composables/useFormatters.ts
import dayjs from "dayjs";

import "dayjs/locale/th"; // locale ภาษาไทย
import relativeTime from "dayjs/plugin/relativeTime"; // "x นาทีที่แล้ว"
import buddhistEra from "dayjs/plugin/buddhistEra"; // ปี พ.ศ.
import duration from "dayjs/plugin/duration"; // duration
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import localizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import thLocale from "dayjs/locale/th";

// ✅ ตั้งค่า plugin
dayjs.extend(relativeTime);
dayjs.extend(buddhistEra);
dayjs.extend(duration);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

// ✅ set ค่าเริ่มต้น
dayjs.locale("th");
dayjs.tz.setDefault("Asia/Bangkok");

dayjs.locale(
  {
    ...thLocale, // เอาของเดิมมาใช้ก่อน
    months:
      "มกราคม_กุมภาพันธ์_มีนาคม_เมษายน_พฤษภาคม_มิถุนายน_กรกฎาคม_สิงหาคม_กันยายน_ตุลาคม_พฤศจิกายน_ธันวาคม".split(
        "_"
      ),
    monthsShort:
      "ม.ค._ก.พ._มี.ค._เม.ย._พ.ค._มิ.ย._ก.ค._ส.ค._ก.ย._ต.ค._พ.ย._ธ.ค.".split(
        "_"
      ),
  },
  undefined,
  true
);

export const useFormatters = () => {
  /**
   * Format ตัวเลขให้เป็นสกุลเงินบาท (฿1,234)
   */
  const currency = (
    value: number | null | undefined,
    options: {
      showSymbol?: boolean;
      decimalDigits?: number;
      compact?: boolean;
    } = {}
  ): string => {
    if (value === null || value === undefined) return "-";

    const { showSymbol = true, decimalDigits = 2, compact = false } = options;

    if (compact && value >= 1_000_000) {
      const formatted = (value / 1_000_000).toFixed(decimalDigits);
      return `${showSymbol ? "฿" : ""}${formatted}M`;
    }

    if (compact && value >= 1_000) {
      const formatted = (value / 1_000).toFixed(decimalDigits);
      return `${showSymbol ? "฿" : ""}${formatted}K`;
    }

    return new Intl.NumberFormat("th-TH", {
      style: showSymbol ? "currency" : "decimal",
      currency: "THB",
      minimumFractionDigits: decimalDigits,
      maximumFractionDigits: decimalDigits,
    })
      .format(value)
      .replace(/\s/g, "");
  };

  /** วันที่แบบเต็ม (17 สิงหาคม 2568) */
  const fullDate = (date: string | Date | null | undefined): string =>
    !date ? "-" : dayjs(date).tz().format("D MMMM BBBB");

  /** วันที่แบบสั้น (17/08/2568) */
  const shortDate = (date: string | Date | null | undefined): string =>
    !date ? "-" : dayjs(date).tz().format("DD/MM/BBBB");

  /** เวลาแบบสัมพันธ์กับปัจจุบัน ("5 นาทีที่แล้ว") */
  const timeAgo = (date: string | Date | null | undefined): string =>
    !date ? "-" : dayjs(date).tz().fromNow();

  /** วัน+เวลาแบบเต็ม (17 สิงหาคม 2568 13:45 น.) */
  const fullDateTime = (date: string | Date | null | undefined): string =>
    !date ? "-" : dayjs(date).tz().format("D MMMM BBBB HH:mm น.");

  /** วัน+เวลาแบบสั้น (17/08/2568 13:45) */
  const shortDateTime = (date: string | Date | null | undefined): string =>
    !date ? "-" : dayjs(date).tz().format("DD/MM/BBBB HH:mm");

  /** เวลาเท่านั้น (13:45 น.) */
  const timeOnly = (date: string | Date | null | undefined): string =>
    !date ? "-" : dayjs(date).tz().format("HH:mm น.");

  /** วันที่ ISO (2025-08-17) */
  const isoDate = (date: string | Date | null | undefined): string =>
    !date ? "-" : dayjs(date).tz().format("YYYY-MM-DD");

  /** วันที่ medium (17 ส.ค. 2568) */
  const mediumDate = (date: string | Date | null | undefined): string =>
    !date ? "-" : dayjs(date).tz().format("D MMM BBBB");

  /** Format ตัวเลขทั่วไป (1,234) */
  const number = (
    value: number | null | undefined,
    decimalDigits: number = 0
  ): string =>
    value === null || value === undefined
      ? "-"
      : new Intl.NumberFormat("th-TH", {
          minimumFractionDigits: decimalDigits,
          maximumFractionDigits: decimalDigits,
        }).format(value);

  /** เปอร์เซ็นต์ (12.34%) */
  const percentage = (
    value: number | null | undefined,
    decimalDigits: number = 2
  ): string =>
    value === null || value === undefined
      ? "-"
      : new Intl.NumberFormat("th-TH", {
          style: "percent",
          minimumFractionDigits: decimalDigits,
          maximumFractionDigits: decimalDigits,
        }).format(value);

  /** ระยะเวลา (2 วัน 3 ชั่วโมง) */
  const durationFormat = (milliseconds: number): string => {
    const dur = dayjs.duration(milliseconds);
    const days = dur.days();
    const hours = dur.hours();
    const minutes = dur.minutes();

    let result = [];
    if (days > 0) result.push(`${days} วัน`);
    if (hours > 0) result.push(`${hours} ชั่วโมง`);
    if (minutes > 0 || result.length === 0) result.push(`${minutes} นาที`);

    return result.join(" ");
  };

  /** เบอร์โทรศัพท์ไทย (081-234-5678) */
  const phoneNumber = (
    phoneNumber: string | null | undefined,
    format: string = "XXX-XXX-XXXX"
  ): string => {
    if (!phoneNumber) return "-";

    const cleaned = phoneNumber.replace(/\D/g, "");
    if (cleaned.length !== 9 && cleaned.length !== 10) return phoneNumber;

    if (format === "XXX-XXX-XXXX") {
      if (cleaned.length === 9) {
        return `${cleaned.substring(0, 2)}-${cleaned.substring(
          2,
          5
        )}-${cleaned.substring(5)}`;
      }
      return `${cleaned.substring(0, 3)}-${cleaned.substring(
        3,
        6
      )}-${cleaned.substring(6)}`;
    }

    if (format === "(XXX) XXX-XXXX") {
      if (cleaned.length === 9) {
        return `(${cleaned.substring(0, 2)}) ${cleaned.substring(
          2,
          5
        )}-${cleaned.substring(5)}`;
      }
      return `(${cleaned.substring(0, 3)}) ${cleaned.substring(
        3,
        6
      )}-${cleaned.substring(6)}`;
    }

    if (format === "XXXX XXXXXX") {
      if (cleaned.length === 9) {
        return `${cleaned.substring(0, 3)} ${cleaned.substring(3)}`;
      }
      return `${cleaned.substring(0, 4)} ${cleaned.substring(4)}`;
    }

    // default
    if (cleaned.length === 9) {
      return `${cleaned.substring(0, 2)}-${cleaned.substring(
        2,
        5
      )}-${cleaned.substring(5)}`;
    }
    return `${cleaned.substring(0, 3)}-${cleaned.substring(
      3,
      6
    )}-${cleaned.substring(6)}`;
  };

  return {
    currency,
    fullDate,
    shortDate,
    timeAgo,
    fullDateTime,
    shortDateTime,
    timeOnly,
    isoDate,
    mediumDate,
    number,
    percentage,
    durationFormat,
    phoneNumber,
    // export dayjs เผื่อใช้เองนอกฟังก์ชัน
    dayjs,
  };
};
