import type { AttendanceRecord, AttendanceStatus, StoredAttendanceRecord } from "../types/Attendance";

const API_URL = "/api/attendance";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options?.body ? { "Content-Type": "application/json" } : {}),
      ...options?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(body?.error ?? `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

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