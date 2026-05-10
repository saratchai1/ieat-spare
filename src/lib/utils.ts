import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function labelize(value: string) {
  const dictionary: Record<string, string> = {
    ADMIN: "ผู้ดูแลนิคม",
    FACTORY_USER: "ผู้ใช้งานโรงงาน",
    TECHNICIAN: "ช่างซ่อมบำรุง",
    WAREHOUSE: "เจ้าหน้าที่คลัง",
    NORMAL: "ปกติ",
    OK: "ปกติ",
    AVAILABLE: "พร้อมปฏิบัติงาน",
    COMPLETED: "เสร็จสิ้น",
    LOW: "ต่ำ",
    WARNING: "เฝ้าระวัง",
    MEDIUM: "ปานกลาง",
    WAITING_FOR_PARTS: "รออะไหล่",
    HIGH: "สูง",
    CRITICAL: "วิกฤต",
    EMERGENCY: "ฉุกเฉิน",
    UNDER_MAINTENANCE: "กำลังซ่อม",
    ASSIGNED: "มอบหมายแล้ว",
    IN_PROGRESS: "กำลังดำเนินการ",
    APPROVED: "อนุมัติแล้ว",
    NEW: "ใหม่",
    INFO: "ข้อมูล",
    OFF_DUTY: "นอกเวร",
    CANCELLED: "ยกเลิก",
    OFFLINE: "ออฟไลน์",
    PUMP: "ปั๊ม",
    MOTOR: "มอเตอร์",
    CONVEYOR: "สายพานลำเลียง",
    COMPRESSOR: "เครื่องอัดอากาศ",
    BOILER: "หม้อไอน้ำ",
    COOLING_TOWER: "หอหล่อเย็น",
    ELECTRICAL_PANEL: "ตู้ไฟฟ้า",
    BEARING: "ตลับลูกปืน",
    MOTOR_DRIVE: "มอเตอร์/ไดรฟ์",
    BELT_SEAL: "สายพาน/ซีล",
    CONTROL_SENSOR: "ควบคุม/เซนเซอร์",
    FILTER: "ไส้กรอง",
    ELECTRICAL: "ไฟฟ้า",
    PUMP_VALVE: "ปั๊ม/วาล์ว",
    PREVENTIVE: "บำรุงรักษาเชิงป้องกัน",
    CORRECTIVE: "ซ่อมแก้ไข",
    STOCK_IN: "รับเข้า",
    STOCK_OUT: "เบิกออก",
    RESERVE: "จองอะไหล่",
    RELEASE: "ปลดจอง",
    ADJUSTMENT: "ปรับยอด",
  };

  if (dictionary[value]) return dictionary[value];

  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function availabilityFromStock(currentStock: number, reservedStock: number, minStockLevel: number) {
  const available = currentStock - reservedStock;
  if (available <= 0) return "CRITICAL";
  if (available < minStockLevel) return "LOW";
  return "OK";
}
