import type { z } from "zod";
import type { attendanceRecordSchema, attendanceStatusSchema } from "../attendanceSchema";

export type AttendanceStatus = z.infer<typeof attendanceStatusSchema>;
export type AttendanceRecord = z.infer<typeof attendanceRecordSchema>;
export type StoredAttendanceRecord = AttendanceRecord & { date: string };