export function useStatusStyles() {
  const getContractStatusInfo = (status: string) => {
    const map = {
      ACTIVE: { text: "กำลังใช้งาน", class: "bg-green-100 text-green-800" },
      PENDING: { text: "รอดำเนินการ", class: "bg-yellow-100 text-yellow-800" },
      EXPIRED: { text: "หมดอายุ", class: "bg-gray-100 text-gray-800" },
      TERMINATED: { text: "ยกเลิก/สิ้นสุด", class: "bg-red-100 text-red-800" },
    };
    return map[status] || { text: status, class: "bg-gray-100 text-gray-800" };
  };

  // ในอนาคตเราสามารถเพิ่มฟังก์ชันสำหรับสถานะอื่นๆ ที่นี่ได้
  // const getInvoiceStatusInfo = (status: string) => { ... };
  // const getRoomStatusInfo = (status: string) => { ... };

  return {
    getContractStatusInfo,
    // getInvoiceStatusInfo,
    // getRoomStatusInfo,
  };
}
