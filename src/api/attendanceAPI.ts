import type { AttendanceRecord, AttendanceStatus, StoredAttendanceRecord } from "../types/Attendance";
import { request } from "./request";

const API_URL = "/api/attendance";

export async function getAttendanceForDate(date: string): Promise<AttendanceRecord[]> {
  return request<AttendanceRecord[]>(`${API_URL}?date=${encodeURIComponent(date)}`);
}

export async function getStudentAttendance(studentId: string | number): Promise<StoredAttendanceRecord[]> {
  return request<StoredAttendanceRecord[]>(`${API_URL}?studentId=${encodeURIComponent(String(studentId))}`);
}

export async function saveAttendanceForDate(
  date: string,
  records: AttendanceRecord[],
): Promise<AttendanceRecord[]> {
  return request<AttendanceRecord[]>(API_URL, {
    method: "PUT",
    body: JSON.stringify({ date, records }),
  });
}

export type { AttendanceStatus };